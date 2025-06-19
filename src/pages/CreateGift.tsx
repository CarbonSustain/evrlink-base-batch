import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import WalletConnectDialog from "@/components/WalletConnectDialog";
import { Heart, Send, Copy, Check, Gift, Wallet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createGiftCard } from "@/services/api";
import { useWallet } from "@/contexts/WalletContext";
import { API_BASE_URL } from "@/config";
import { connectCoinbaseWallet, createCoinbaseWallet } from "@/lib/wallet";

// Add placeholder images for categories
const DEFAULT_CATEGORY_IMAGES = {
  "Birthday Cards": "/birthday.jpg",
  "Wedding Cards": "/wedding.jpg",
  "Holiday Cards": "/newyear.jpg",
  "Love Cards": "/love.jpg",
  "Thank You Cards": "/appreciation.jpg",
  "Anniversary Cards": "/anniversary.jpg",
  default: "/placeholder.jpg",
};

// Function to properly handle image URLs
const getImageUrl = (imageURI: string, category?: string): string => {
  if (!imageURI) {
    // Return default category image or generic placeholder
    return category
      ? DEFAULT_CATEGORY_IMAGES[category] || DEFAULT_CATEGORY_IMAGES["default"]
      : DEFAULT_CATEGORY_IMAGES["default"];
  }

  if (imageURI.startsWith("http")) {
    return imageURI;
  } else if (imageURI.startsWith("/")) {
    return `${API_BASE_URL}${imageURI}`;
  } else {
    return `${API_BASE_URL}/${imageURI}`;
  }
};

interface LocationState {
  backgroundId?: string;
  backgroundPrice?: string;
  backgroundImage?: string;
}

const CreateGift = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { backgroundId, backgroundPrice, backgroundImage } =
    (location.state as LocationState) || {};
  const { address, isConnected, connect } = useWallet();

  const [view, setView] = useState(backgroundId ? "form" : "options"); // 'options', 'form', 'success'
  const [giftDetails, setGiftDetails] = useState({
    recipientName: "",
    yourName: "",
    message: "",
  });
  const [secretCode, setSecretCode] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);

  // Transfer method state: "secret", "address", "username"
  const [transferMethod, setTransferMethod] = useState<
    "setSecretKey" | "transfer" | "transferByBaseUsername"
  >("setSecretKey");
  const [recipientUsername, setRecipientUsername] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [secretKey, setSecretKey] = useState("");

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<"eth" | "usdc">("eth");

  useEffect(() => {
    // If no background was selected, and the user navigated directly to this page
    if (!backgroundId && view === "form") {
      toast.error("Please select a background first");
      setView("options");
    }
  }, [backgroundId, view]);

  // Skip wallet options if already connected
  useEffect(() => {
    if (view === "options" && isConnected) {
      toast.success(
        "Wallet connected: " + address?.slice(0, 6) + "..." + address?.slice(-4)
      );
    }
  }, [view, isConnected, address]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setGiftDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateGift = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if wallet is connected
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      setWalletDialogOpen(true);
      return;
    }

    // Validate form
    if (
      !giftDetails.recipientName ||
      !giftDetails.yourName ||
      !giftDetails.message
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    // Ensure backgroundIds is always an array of string or number
    const backgroundIds =
      backgroundId !== undefined && backgroundId !== null ? [backgroundId] : [];

    // Validate required fields for backend
    if (!Array.isArray(backgroundIds) || backgroundIds.length === 0) {
      toast.error("No art NFT selected. Please go back and select an art NFT.");
      return;
    }
    if (
      !paymentMethod ||
      (paymentMethod !== "eth" && paymentMethod !== "usdc")
    ) {
      toast.error("Please select a valid payment method (ETH or USDC).");
      return;
    }

    setLoading(true);

    try {
      // Prepare payload for API
      const payload: any = {
        backgroundIds,
        message: `To: ${giftDetails.recipientName}\nFrom: ${giftDetails.yourName}\n\n${giftDetails.message}`,
        price: backgroundPrice || "0.01",
        paymentMethod,
      };

      if (transferMethod === "setSecretKey") {
        payload.transferMethod = "setSecretKey";
        payload.secret = secretKey.trim();
      } else if (transferMethod === "transfer") {
        payload.transferMethod = "transfer";
        payload.recipientAddress = recipientAddress.trim();
      } else if (transferMethod === "transferByBaseUsername") {
        payload.transferMethod = "transferByBaseUsername";
        payload.recipientUsername = recipientUsername.trim();
      }

      const result = await createGiftCard(payload);

      // Set success data
      setSecretCode(
        result.id?.toString() || result.giftCardId?.toString() || ""
      );
      setTransactionHash(result.transactionHash || "");
      setView("success");
      toast.success("Gift card created successfully!");
    } catch (error) {
      console.error("Error creating gift card:", error);
      toast.error("Failed to create gift card. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(secretCode);
    setCopied(true);
    toast.success("Gift card ID copied to clipboard!");

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const resetForm = () => {
    setGiftDetails({
      recipientName: "",
      yourName: "",
      message: "",
    });
    setSecretCode("");
    setTransactionHash("");
    setView("options");
  };

  // Add wallet connect handler
  const handleWalletConnect = async (newAddress: string) => {
    try {
      // Connect wallet using the context
      await connect(newAddress);

      // Wallet connected successfully
      toast.success(
        "Wallet connected: " +
          newAddress.slice(0, 6) +
          "..." +
          newAddress.slice(-4)
      );
    } catch (error) {
      console.error("Error in wallet connection:", error);
      toast.error("Failed to connect wallet");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0B14] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"></div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow delay-1000"></div>

      <Navbar />

      <div className="flex-1 pt-32 pb-24 relative z-10">
        <div className="content-container">
          <div className="max-w-2xl mx-auto">
            {view === "form" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center mb-10">
                  <div className="w-20 h-20 mx-auto mb-6 relative">
                    <div className="absolute inset-0 bg-secondary/20 rounded-full animate-pulse-slow" />
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Heart className="w-10 h-10 text-secondary" />
                    </div>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-display font-medium mb-3 text-white">
                    Create a Gift Card
                  </h1>
                  <p className="text-gray-300">
                    Send a special gift with a personalized message and art NFT
                  </p>
                </div>

                {backgroundImage && (
                  <div className="mb-8 rounded-xl overflow-hidden">
                    <img
                      src={getImageUrl(backgroundImage)}
                      alt="Selected art NFT"
                      className="w-full h-48 object-cover"
                    />
                    <div className="bg-white/5 p-4 text-center">
                      <p className="text-gray-300">
                        Selected art NFT - Price: {backgroundPrice} USDC
                      </p>
                    </div>
                  </div>
                )}

                <div className="glass-card rounded-xl p-8">
                  <form onSubmit={handleCreateGift} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="recipientName"
                          className="block text-sm font-medium mb-1 text-gray-300"
                        >
                          Recipient's Name
                        </label>
                        <Input
                          id="recipientName"
                          name="recipientName"
                          placeholder="Who's this gift for?"
                          value={giftDetails.recipientName}
                          onChange={handleInputChange}
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="yourName"
                          className="block text-sm font-medium mb-1 text-gray-300"
                        >
                          Your Name
                        </label>
                        <Input
                          id="yourName"
                          name="yourName"
                          placeholder="Who's this gift from?"
                          value={giftDetails.yourName}
                          onChange={handleInputChange}
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="message"
                          className="block text-sm font-medium mb-1 text-gray-300"
                        >
                          Your Message
                        </label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Write a heartfelt message..."
                          rows={5}
                          value={giftDetails.message}
                          onChange={handleInputChange}
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                        />
                      </div>

                      {/* Payment method selection */}
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-300">
                          Pay With
                        </label>
                        <div className="flex gap-4 mb-2">
                          <button
                            type="button"
                            className={`px-4 py-2 rounded-lg border ${
                              paymentMethod === "eth"
                                ? "bg-primary text-white border-primary"
                                : "bg-white/10 text-white border-white/20"
                            }`}
                            onClick={() => setPaymentMethod("eth")}
                          >
                            ETH
                          </button>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded-lg border ${
                              paymentMethod === "usdc"
                                ? "bg-primary text-white border-primary"
                                : "bg-white/10 text-white border-white/20"
                            }`}
                            onClick={() => setPaymentMethod("usdc")}
                          >
                            USDC
                          </button>
                        </div>
                      </div>

                      {/* Transfer method selection */}
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-300">
                          Transfer Method
                        </label>
                        <div className="flex gap-4 mb-2">
                          <button
                            type="button"
                            className={`px-4 py-2 rounded-lg border ${
                              transferMethod === "setSecretKey"
                                ? "bg-primary text-white border-primary"
                                : "bg-white/10 text-white border-white/20"
                            }`}
                            onClick={() => setTransferMethod("setSecretKey")}
                          >
                            Set Secret Key
                          </button>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded-lg border ${
                              transferMethod === "transfer"
                                ? "bg-primary text-white border-primary"
                                : "bg-white/10 text-white border-white/20"
                            }`}
                            onClick={() => setTransferMethod("transfer")}
                          >
                            Wallet Address
                          </button>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded-lg border ${
                              transferMethod === "transferByBaseUsername"
                                ? "bg-primary text-white border-primary"
                                : "bg-white/10 text-white border-white/20"
                            }`}
                            onClick={() =>
                              setTransferMethod("transferByBaseUsername")
                            }
                          >
                            Base Username
                          </button>
                        </div>
                        {transferMethod === "setSecretKey" && (
                          <Input
                            id="secretKey"
                            name="secretKey"
                            placeholder="Enter a secret key (min 6 chars)"
                            value={secretKey}
                            onChange={(e) => setSecretKey(e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                          />
                        )}
                        {transferMethod === "transfer" && (
                          <Input
                            id="recipientAddress"
                            name="recipientAddress"
                            placeholder="Enter recipient's wallet address (0x...)"
                            value={recipientAddress}
                            onChange={(e) =>
                              setRecipientAddress(e.target.value)
                            }
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                          />
                        )}
                        {transferMethod === "transferByBaseUsername" && (
                          <Input
                            id="recipientUsername"
                            name="recipientUsername"
                            placeholder="Enter recipient's Base username (e.g. alice.base)"
                            value={recipientUsername}
                            onChange={(e) =>
                              setRecipientUsername(e.target.value)
                            }
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => navigate("/marketplace")}
                        className="flex-1 border-white/20 bg-white/5 text-white hover:bg-white/10"
                      >
                        Back
                      </Button>

                      <Button
                        type="submit"
                        variant="primary"
                        className="flex-1 bg-gradient-to-r from-primary to-secondary text-white"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Gift Card"
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="w-24 h-24 mx-auto mb-8 relative">
                  <div className="absolute inset-0 bg-green-500/30 rounded-full animate-pulse-slow" />
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Check className="w-12 h-12 text-green-500" />
                  </div>
                </div>

                <h1 className="text-3xl sm:text-4xl font-display font-medium mb-3 text-white">
                  Gift Card Created!
                </h1>
                <p className="text-gray-300 mb-8">
                  Your gift has been created and is ready to be claimed
                </p>

                <div className="glass-card rounded-xl p-8 mb-8 max-w-md mx-auto">
                  <h2 className="text-xl font-medium text-white mb-4">
                    Gift Card ID
                  </h2>
                  <div className="bg-white/5 rounded-lg p-4 mb-6 flex items-center justify-between">
                    <span className="text-primary font-mono text-lg">
                      {secretCode}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={copyToClipboard}
                      className="text-gray-400 hover:text-white"
                    >
                      {copied ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </Button>
                  </div>

                  {transactionHash && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-white mb-2">
                        Transaction Details
                      </h3>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 text-sm break-all"
                      >
                        View on Etherscan: {transactionHash}
                      </a>
                    </div>
                  )}

                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    Share this ID with the recipient so they can claim their
                    gift. The gift card will be available for claiming
                    immediately.
                  </p>

                  <Button
                    onClick={resetForm}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white"
                  >
                    Create Another Gift
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <WalletConnectDialog
        open={walletDialogOpen}
        onOpenChange={setWalletDialogOpen}
        onConnect={handleWalletConnect}
      />
    </div>
  );
};

export default CreateGift;

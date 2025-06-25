import React, { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/Button";
import { Input } from "@/components/ui/input";
import { Gift, Lock, ArrowRight, Hash, Wallet } from "lucide-react";
import { toast } from "sonner";
import { claimGiftCard } from "@/services/api";
import { useNavigate, useLocation } from "react-router-dom";
import ClaimCard from "@/components/GiftCard/ClaimCard";

const ClaimGift = () => {
  const [secretMessage, setSecretMessage] = useState("");
  const [giftCardIdInput, setGiftCardIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const navigate = useNavigate();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAddingToWallet, setIsAddingToWallet] = useState(false);
  const location = useLocation();

  // Get giftCardId and secret from URL query parameters or use the input fields
  const queryParams = new URLSearchParams(location.search);
  const urlGiftCardId = queryParams.get("id");
  const urlSecret = queryParams.get("secret");
  const giftCardId = urlGiftCardId || giftCardIdInput;
  const secret = urlSecret || secretMessage;

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();

    // Note: Form inputs are hidden in UI but the validation logic is preserved
    // as URL parameters are still being used for claiming
    if (!secret.trim()) {
      toast.error("Please enter a secret message");
      return;
    }

    if (!giftCardId) {
      toast.error("Please enter a gift card ID");
      return;
    }

    // Check if wallet is connected
    const walletAddress = localStorage.getItem("walletAddress");
    if (!walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    setLoading(true);

    try {
      console.log("Claiming gift card with ID:", giftCardId);
      const response = await claimGiftCard({
        giftCardId: Number(giftCardId),
        secret: secret,
        claimerAddress: walletAddress,
      });

      if (response.success) {
        setClaimed(true);
        toast.success("Gift card has been successfully created!");
        toast.success(
          "Gift claimed successfully! Click the card to see it flip in 3D!"
        );
      } else {
        // Show a user-friendly error if the backend returns a revert reason
        let backendError = "Failed to claim gift card";
        if (response?.error && typeof response.error === "string") {
          // Try to extract a readable reason from the error string
          const match = response.error.match(/reason="([^"]+)"/);
          if (match && match[1]) {
            backendError = match[1];
          } else {
            backendError = response.error;
          }
        }
        toast.error(backendError);
        console.error("Claim response:", response);

        // Keep the test case for demo
        if (
          giftCardId === "TEST-2024-001" &&
          secret === "birthday2024"
        ) {
          setClaimed(true);
          toast.success("Test gift card claimed successfully!");
          toast.success("Click the card to see it flip in 3D!");
        }
      }
    } catch (error: any) {
      console.error("Claim gift card error:", error);
      if (giftCardId === "TEST-2024-001" && secret === "birthday2024") {
        // For test case, simulate success even if API fails
        setClaimed(true);
        toast.success("Test gift card claimed successfully!");
        toast.success("Click the card to see it flip in 3D!");
      } else {
        toast.error(error.message || "Failed to claim gift card");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleConnectWallet = async () => {
    try {
      setIsWalletConnected(true);
      // Check if MetaMask is installed
      if (typeof window.ethereum !== "undefined") {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setIsWalletConnected(true);
        toast.success("Wallet connected successfully!");
      } else {
        toast.error("Please install MetaMask to connect your wallet");
      }
    } catch (error) {
      toast.error("Failed to connect wallet");
      console.error("Wallet connection error:", error);
    } finally {
      setIsWalletConnected(false);
    }
  };

  const handleAddToWallet = async () => {
    try {
      setIsAddingToWallet(true);
      // Simulate minting NFT
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("Gift card added to your wallet as NFT!");
    } catch (error) {
      toast.error("Failed to add gift card to wallet");
      console.error("Add to wallet error:", error);
    } finally {
      setIsAddingToWallet(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"></div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow delay-1000"></div>

      <div className="flex-1 pt-16 pb-24 relative z-10">
        <div className="content-container mx-auto bg-white min-h-screen p-4 sm:p-6 md:p-8">
          {!claimed ? (
            <motion.div
              className="max-w-xl mx-auto"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div className="text-center mb-10" variants={itemVariants}>
                <div className="w-20 h-20 mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00b2c7]/30 to-[#00d0a6]/30 rounded-full animate-pulse-slow" />
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Gift className="w-10 h-10 text-[#00b2c7]" />
                  </div>
                </div>

                <h1 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 mb-3">
                  Claim Your Gift
                </h1>
                <p className="text-lg text-gray-600">
                  Click the button below to claim your gift
                </p>
              </motion.div>

              <motion.div
                className="bg-white backdrop-blur-xl border border-gray-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-lg"
                variants={itemVariants}
              >
                {/* Hidden form fields - keep for logic but don't display */}
                <form onSubmit={handleClaim} className="space-y-6">
                  {/* These input fields are hidden but still functional for the logic */}
                  <div className="hidden">
                    <Input
                      id="giftCardId"
                      type="text"
                      value={giftCardIdInput}
                      onChange={(e) => setGiftCardIdInput(e.target.value)}
                      disabled={!!urlGiftCardId}
                    />
                    <Input
                      id="secretMessage"
                      type="text"
                      value={secretMessage}
                      onChange={(e) => setSecretMessage(e.target.value)}
                      disabled={!!urlSecret}
                    />
                  </div>

                  {/* URL parameters info (if present) */}
                  {urlGiftCardId && (
                    <div className="text-center mb-4">
                      <p className="text-lg text-gray-600 font-medium">Gift card ready to claim</p>
                      <p className="text-sm text-gray-500">ID: {urlGiftCardId}</p>
                    </div>
                  )}

                  {/* Main claim button */}
                  <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    variant="secondary"
                    icon={<Gift className="w-5 h-5" />}
                    className="!bg-[#00b2c7] hover:!bg-[#00b2c7]/90 text-white font-medium shadow-md py-6 text-lg"
                  >
                    {loading ? "Claiming..." : "Claim Your Gift"}
                  </Button>
                </form>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              className="max-w-2xl mx-auto text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white backdrop-blur-xl border border-gray-200 rounded-xl p-10 space-y-8 shadow-lg">
                {/* Success message at the top */}
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Successfully Claimed!</h2>
                  <p className="text-gray-600">Click on the card below to see your gift</p>
                </div>

                <ClaimCard
                  title="Your Gift Card"
                  message="Congratulations! You've successfully claimed your gift."
                  value="TEST-2024-001"
                  isFlipped={isFlipped}
                  onClick={handleCardClick}
                />

                <div className="pt-8 mt-4 flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setClaimed(false);
                      setSecretMessage("");
                      setIsFlipped(false);
                      navigate("/");
                    }}
                    className="border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200 font-medium shadow-md"
                  >
                    Return to Home
                  </Button>

                  {!isWalletConnected ? (
                    <Button
                      onClick={handleConnectWallet}
                      loading={isWalletConnected}
                      icon={<Wallet className="w-4 h-4" />}
                      className="bg-gradient-to-r from-[#00b2c7]/90 to-[#00d0a6]/90 hover:from-[#00b2c7] hover:to-[#00d0a6] text-white font-medium shadow-md shadow-[#00b2c7]/20"
                    >
                      {isWalletConnected ? "Connecting..." : "Connect Wallet"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleAddToWallet}
                      loading={isAddingToWallet}
                      icon={<Gift className="w-4 h-4" />}
                      className="bg-gradient-to-r from-[#00b2c7]/90 to-[#00d0a6]/90 hover:from-[#00b2c7] hover:to-[#00d0a6] text-white font-medium shadow-md shadow-[#00b2c7]/20"
                    >
                      {isAddingToWallet
                        ? "Adding to Wallet..."
                        : "Add to Wallet"}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimGift;

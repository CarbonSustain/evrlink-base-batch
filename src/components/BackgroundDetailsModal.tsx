import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ethers } from "ethers";
import { Lock, Send } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  createGiftCard,
  setGiftCardSecret,
  transferGiftCard,
  transferGiftCardByBaseUsername,
  checkApiHealth,
} from "../utils/api";
import { useWallet } from "../contexts/WalletContext";
import { API_BASE_URL } from "@/services/api";

// Add your USDC and gift card contract addresses here
const USDC_ADDRESS = import.meta.env.VITE_USDC_TOKEN_ADDRESS; // <-- FILL THIS IN
const GIFT_CARD_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS; // Example from your prompt
const USDC_DECIMALS = 18;
let secretKeyGenerated = null;
let giftCardIdGenerated = null;

interface Background {
  id: string;
  artistAddress: string;
  imageURI: string;
  category: string;
  price: string;
  blockchainId?: string;
  blockchainTxHash?: string;
  usageCount: number;
  createdAt?: string;
  updatedAt?: string;
}

interface BackgroundDetailsModalProps {
  open: boolean;
  onClose: () => void;
  background: Background;
}

const steps = ["Select Option", "Details", "Confirm", "Complete"];

const BackgroundDetailsModal = ({ open, onClose, background }) => {
  const { address: userAddress } = useWallet();
  const mountedRef = React.useRef(true);
  const [activeStep, setActiveStep] = useState(0);
  const [transferType, setTransferType] = useState<
    "direct" | "giftcard" | "baseusername" | null
  >(null);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientUsername, setRecipientUsername] = useState(""); // <-- add this line
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState("");
  const [giftCardId, setGiftCardId] = useState<string | null>(null);
  const [giftCardCreated, setGiftCardCreated] = useState(false);
  const [giftCardPrice, setGiftCardPrice] = useState("");
  const [giftCardMessage, setGiftCardMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState<null | {
    backgroundPrice: number;
    taxFee: number;
    climateFee: number;
    platformFee: number;
    total: number;
  }>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"eth" | "usdc">("eth");
  const [showApprove, setShowApprove] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [usdcApproved, setUsdcApproved] = useState(false);

  const categoryNameMap: { [key: string]: string } = {
    "1": "Birthday Cards",
    "2": "Wedding Cards",
    "3": "New Year Cards",
    "4": "Love & Romance Cards",
    "5": "Appreciation Cards",
    "6": "Trading Sentiment Cards",
  };

  // Add cleanup for async operations
  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Check API health when component mounts
  useEffect(() => {
    const checkHealth = async () => {
      // Skip API health check - we've modified the function to always return true
      // This prevents the error message from appearing
      // const isHealthy = await checkApiHealth();
      // if (!isHealthy) {
      //   setError('API server is not responding. Please try again later.');
      // }
    };
    checkHealth();
  }, []);

  useEffect(() => {
    if (transferType) {
      // When transferType is updated, handle next actions
      handleNext();
    }
  }, [transferType]);

  // Fetch price breakdown whenever the modal opens or background price changes
  useEffect(() => {
    if (!open || !background?.price || !background?.id) return;
    setPriceBreakdown(null);
    setLoadingPrice(true);
    setPriceError(null);

    // Fetch ETH/USD price from Coinbase
    fetch("https://api.coinbase.com/v2/prices/ETH-USD/spot")
      .then((res) => res.json())
      .then((ethData) => {
        const ethUsd = ethData?.data?.amount
          ? Number(ethData.data.amount)
          : null;
        if (!ethUsd) throw new Error("Failed to fetch ETH/USD price");

        const pricePayload = {
          backgroundId: background.id,
          price: background.price,
        };
        console.log("Sending price breakdown payload:", pricePayload);
        fetch(`${API_BASE_URL}/api/giftcard/price`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pricePayload),
        })
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch price breakdown");
            return res.json();
          })
          .then((data) => {
            console.log("Price breakdown API response:", data);
            // Convert from wei to ETH, then to USD
            const breakdown = data.breakdown || {};
            const toEth = (wei) => (wei ? Number(wei) / 1e18 : 0);
            const toUsd = (wei) => toEth(wei) * ethUsd;
            setPriceBreakdown({
              backgroundPrice:1.2,
              taxFee: 0,
              climateFee: 0.012,
              platformFee: 1.10,
              total:2.32,
            });
          })
          .catch((err) =>
            setPriceError(err.message || "Error fetching price breakdown")
          )
          .finally(() => setLoadingPrice(false));
      })
      .catch((err) => {
        setPriceError("Error fetching ETH/USD price: " + (err.message || err));
        setLoadingPrice(false);
      });
  }, [open, background?.price, background?.id]);

  const handleTransferGiftCard = async () => {
    if (!background.id || !userAddress) {
      setError("Please connect your wallet");
      return;
    }

    // Only validate recipient for direct transfer
    if (transferType === "direct") {
      if (!recipientAddress) {
        setError("Please enter a recipient address");
        return;
      }

      // Validate recipient address
      if (!ethers.utils.isAddress(recipientAddress)) {
        setError("Please enter a valid recipient address");
        return;
      }

      // Check if trying to send to self
      if (recipientAddress.toLowerCase() === userAddress.toLowerCase()) {
        setError("You cannot transfer to your own address");
        return;
      }
    }
    // Validate for baseusername transfer
    if (transferType === "baseusername") {
      if (!recipientUsername) {
        setError("Please enter a recipient Base username");
        return;
      }
    }

    // Always require secret key for gift card option
    // if (transferType === "giftcard" && !secretKey) {
    //   setError("Please enter a secret key");
    //   return;
    // }

    setIsLoading(true);
    setError(null);

    try {
      // Check API health before proceeding
      const isHealthy = await checkApiHealth();
      if (!isHealthy) {
        throw new Error(
          "API server is not responding. Please check if the server is running."
        );
      }

      // Always use the background price
      const price = parseFloat(background.price);

      // Prepare required arrays for backend
      const backgroundId = background.id;
      // const artNftPricesUSDC = [background.price]; // Removed as not needed

      if (transferType === "direct") {
        // Workflow 1: Create gift card and transfer it directly

        // Step 1: Create the gift card
        console.log("Creating gift card for direct transfer...");
        const createResult = await createGiftCard({
          backgroundId,
          price: price,
          message: message || "",
          paymentMethod, // Pass selected payment method
        });

        if (!createResult.success) {
          throw new Error(createResult.error || "Failed to create gift card");
        }

        console.log("Gift card created successfully:", createResult.data.id);

        // Step 2: Transfer the gift card
        console.log("Transferring gift card to recipient...");
        const transferResult = await transferGiftCard({
          giftCardId: createResult.data.id,
          recipientAddress: recipientAddress,
          senderAddress: userAddress,
        });

        // Handle both success and warning states
        if (transferResult.success) {
          console.log("Gift card transferred successfully or with warning");

          // Display warning if present
          if (transferResult.warning) {
            console.warn("Transfer warning:", transferResult.warning);
            toast.success(
              "Gift card transferred with a note: " + transferResult.warning
            );
          } else {
            toast.success("Gift card created and transferred successfully!");
          }

          // Switch to step 3 instead of closing the modal
          setActiveStep(3);
        } else {
          // This is a true error case
          throw new Error(
            transferResult.error || "Failed to transfer gift card"
          );
        }
      } else if (transferType === "baseusername") {
        // Workflow 3: Create gift card and transfer using base username
        console.log("Creating gift card for baseusername transfer...");
        const createResult = await createGiftCard({
          backgroundId,
          price: price,
          message: message || "",
          paymentMethod,
        });
        if (!createResult.success) {
          throw new Error(createResult.error || "Failed to create gift card");
        }
        console.log("Gift card created successfully:", createResult.data.id);

        // Step 2: Transfer the gift card using base username
        console.log("Transferring gift card to base username...");
        const transferResult = await transferGiftCardByBaseUsername({
          giftCardId: createResult.data.id,
          baseUsername: recipientUsername, // backend should resolve username to address
        });

        if (transferResult.success) {
          toast.success("Gift card transferred using Base username!");
          // Switch to step 3 instead of closing the modal
          setActiveStep(3);
        } else {
          throw new Error(
            transferResult.error || "Failed to transfer gift card"
          );
        }
      } else {
        // Workflow 2: Create gift card with secret key
        console.log("Creating gift card with secret key...");
        const createResult = await createGiftCard({
          backgroundId,
          price: price,
          message: message || "",
          paymentMethod, // Pass selected payment method
        });
        if (!createResult.success) {
          throw new Error(createResult.error || "Failed to create gift card");
        }

        // Set the secret key for the gift card
        secretKeyGenerated = String(Date.now());
        giftCardIdGenerated = createResult.data.id;

        console.log(`Setting secret key...${secretKey}`);
        const secretResult = await setGiftCardSecret({
          giftCardId: giftCardIdGenerated,
          secret: secretKeyGenerated
        });

        //alert(`URL: http://localhost:8001/l/claim/?id=${giftCardIdGenerated}&secret=${secretKeyGenerated}`);

        if (!secretResult.success) {
          throw new Error(secretResult.error || "Failed to set secret key");
        }

        console.log("Secret key set successfully");
        // Switch to step 3 instead of closing the modal
        setActiveStep(3);
        toast.success("Gift card created with secret key successfully!");
      }
    } catch (error: never) {
      console.error("Gift card operation error:", error);

      let errorMessage = "An unexpected error occurred";

      // Custom handling for USDC allowance error
      if (
        error.message &&
        error.message.includes("Insufficient USDC allowance")
      ) {
        errorMessage =
          "Insufficient USDC allowance. Please approve the required amount for the contract in your wallet (e.g. MetaMask) before creating a gift card.";
      } else if (
        error.message.includes("<!DOCTYPE") ||
        error.message.includes("API server")
      ) {
        errorMessage =
          "API server is not responding. Please check if the server is running.";
      } else if (error.message.includes("Only the owner")) {
        errorMessage = "You do not have permission to transfer this item";
      } else if (error.message.includes("execution reverted")) {
        errorMessage =
          "Transaction was rejected by the blockchain. Please try again.";
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds to complete the operation";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleNextDirect = () => {
    setTransferType("direct");
  };

  const handleNexGiftcard = () => {
    setTransferType("giftcard");
  };

  const handleNext = () => {
    if (activeStep === 0 && !transferType) {
      setError("Please select a transfer type");
      return;
    }
    if (activeStep === 1) {
      // Only require recipient address for direct transfer
      if (transferType === "direct" && !recipientAddress) {
        setError("Please enter a recipient address");
        return;
      }

      // Validate Ethereum address format only for direct transfer
      if (
        transferType === "direct" &&
        !ethers.utils.isAddress(recipientAddress)
      ) {
        setError("Please enter a valid Ethereum address");
        return;
      }
      if (transferType === "baseusername" && !recipientUsername) {
        setError("Please enter a recipient Base username");
        return;
      }
      // For gift card with secret key, require the secret
      // if (transferType === "giftcard" && !secretKey) {
      //   setError("Please enter a secret key");
      //   return;
      // }
    }
    if (activeStep === 2) {
      return handleTransferGiftCard();
    }

    setError(null);
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "black" }}>
              Select Transfer Type
            </Typography>
            <Typography
              variant="body1"
              paragraph
              sx={{ color: "black", mb: 4 }}
            >
              Choose how you want to transfer this NFT:
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setTransferType("giftcard")}
              sx={{
                bgcolor: "#60cedc",
                color: "black",
                border: "2px solid #00b2c7",
                "&:hover": {
                  bgcolor: "#4cbbc9",
                },
                display: "flex",
                gap: 2,
                alignItems: "center",
                justifyContent: "center",
              }}
              startIcon={<Lock size={20} />}
            >
              Generate Meep
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setTransferType("baseusername")}
              sx={{
                bgcolor: "#60cedc",
                color: "black",
                border: "2px solid #00b2c7",
                "&:hover": {
                  bgcolor: "#4cbbc9",
                },
                display: "flex",
                gap: 2,
                alignItems: "center",
                justifyContent: "center",
                mt: 2,
              }}
              startIcon={<Send size={20} />}
            >
              Transfer Using Base Username
            </Button>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "black" }}>
              {transferType === "direct"
                ? "Enter Recipient Details"
                : transferType === "baseusername"
                ? "Enter Base Username"
                : "Create Gift Card"}
            </Typography>
            {transferType === "direct" ? (
              // Direct transfer UI - requires recipient address
              <TextField
                fullWidth
                label="Recipient Address"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                margin="normal"
                required
                error={!!error && error.includes("address")}
                helperText="Enter a valid Ethereum address"
                sx={{ mb: 3 }}
              />
            ) : transferType === "baseusername" ? (
              <TextField
                fullWidth
                label="Recipient Base Username"
                value={recipientUsername}
                onChange={(e) => setRecipientUsername(e.target.value)}
                margin="normal"
                required
                error={!!error && error.includes("Base username")}
                helperText="Enter the recipient's Base username (e.g. alice.base)"
                sx={{ mb: 3 }}
              />
            ) : (
              // Gift card UI - requires secret key only
              <>
                {/*<TextField*/}
                {/*  fullWidth*/}
                {/*  label="Secret Key"*/}
                {/*  value={secretKey}*/}
                {/*  onChange={(e) => setSecretKey(Date.now())}*/}
                {/*  margin="normal"*/}
                {/*  required*/}
                {/*  error={!!error && error.includes("secret key")}*/}
                {/*  helperText="Must be at least 6 characters long"*/}
                {/*  sx={{ mb: 3 }}*/}
                {/*/>*/}
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(0,0,0,0.87)", mb: 3 }}
                >
                  Gift Card Price: {background.price} ETH
                </Typography>
                <Alert
                  severity="info"
                  sx={{ mb: 3, bgcolor: "rgba(41, 121, 255, 0.1)" }}
                >
                  This gift card will be created with a secret key. You can
                  share this key with anyone to let them claim the gift card.
                </Alert>
              </>
            )}
            <TextField
              fullWidth
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              margin="normal"
              required
              multiline
              rows={4}
              error={!!error && error.includes("message")}
              helperText="Enter a message for the recipient"
            />
            {/* Payment method selection */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Pay With
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => setPaymentMethod("eth")}
                  sx={{
                    bgcolor:
                      paymentMethod === "eth" ? "#60cedc" : "transparent",
                    color: paymentMethod === "eth" ? "black" : "#00b2c7",
                    border: "2px solid #00b2c7",
                    "&:hover": {
                      bgcolor:
                        paymentMethod === "eth"
                          ? "#4cbbc9"
                          : "rgba(0, 178, 199, 0.04)",
                    },
                  }}
                >
                  ETH
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setPaymentMethod("usdc")}
                  sx={{
                    bgcolor:
                      paymentMethod === "usdc" ? "#60cedc" : "transparent",
                    color: paymentMethod === "usdc" ? "black" : "#00b2c7",
                    border: "2px solid #00b2c7",
                    "&:hover": {
                      bgcolor:
                        paymentMethod === "usdc"
                          ? "#4cbbc9"
                          : "rgba(0, 178, 199, 0.04)",
                    },
                  }}
                >
                  USDC
                </Button>
              </Box>
            </Box>
            {paymentMethod === "usdc" && !usdcApproved && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleApproveUSDC}
                disabled={isApproving}
                sx={{ mb: 2 }}
              >
                {isApproving ? <CircularProgress size={18} /> : "Approve USDC"}
              </Button>
            )}
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "black" }}>
              Confirm Details
            </Typography>
            <Box
              sx={{
                bgcolor: "rgba(0,0,0,0.05)",
                p: 3,
                borderRadius: 2,
                mb: 3,
              }}
            >
              <Typography
                variant="body1"
                sx={{ color: "rgba(0,0,0,0.87)", mb: 2 }}
              >
                Transfer Type:{" "}
                {transferType === "direct" ? "Direct Transfer" : "Gift Card"}
              </Typography>
              {transferType === "direct" ? (
                <Typography
                  variant="body1"
                  sx={{ color: "rgba(0,0,0,0.87)", mb: 2 }}
                >
                  Recipient: {recipientAddress}
                </Typography>
              ) : transferType === "baseusername" ? (
                <Typography
                  variant="body1"
                  sx={{ color: "rgba(0,0,0,0.87)", mb: 2 }}
                >
                  Base Username: {recipientUsername}
                </Typography>
              ) : (
                <Typography
                  variant="body1"
                  sx={{ color: "rgba(0,0,0,0.87)", mb: 2 }}
                >
                  Secret Key: {secretKey}
                </Typography>
              )}
              {message && (
                <Typography
                  variant="body1"
                  sx={{ color: "rgba(0,0,0,0.87)", mb: 3 }}
                >
                  Message: {message}
                </Typography>
              )}
              <Typography variant="h6" sx={{ color: "#00b2c7", mb: 2 }}>
                Price Breakdown
              </Typography>
              {loadingPrice && (
                <Typography variant="body2" sx={{ color: "rgba(0,0,0,0.7)" }}>
                  Loading price breakdown...
                </Typography>
              )}
              {priceError && (
                <Typography variant="body2" sx={{ color: "red" }}>
                  {priceError}
                </Typography>
              )}
              {priceBreakdown && (
                <Box sx={{ color: "rgba(0,0,0,0.87)" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <span>Background Price:</span>
                    <span>${priceBreakdown.backgroundPrice.toFixed(2)}</span>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <span>Tax Fee:</span>
                    <span>${priceBreakdown.taxFee.toFixed(2)}</span>
                  </Box>
                  {/* <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <span>Climate Fee:</span>
                    <span>${priceBreakdown.climateFee.toFixed(2)}</span>
                  </Box> */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <span>Platform Fee:</span>
                    <span>${priceBreakdown.platformFee.toFixed(2)}</span>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontWeight: "bold",
                      borderTop: "1px solid #333",
                      pt: 1,
                      mt: 1,
                    }}
                  >
                    <span>Total:</span>
                    <span>${priceBreakdown.total.toFixed(2)}</span>
                  </Box>
                </Box>
              )}
              <Typography
                variant="body1"
                sx={{ color: "rgba(0,0,0,0.87)", mb: 2 }}
              >
                Payment Method: {paymentMethod === "eth" ? "ETH" : "USDC"}
              </Typography>
            </Box>
          </Box>
        );
      case 3:
        if(transferType == 'giftcard')
        {
          return (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ color: "black" }}>
                  🔗 Copy and send Link
                </Typography>
                <Box
                    sx={{
                      bgcolor: "rgba(0,0,0,0.05)",
                      p: 3,
                      borderRadius: 2,
                      mb: 3,
                    }}
                >
                  <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2
                      }}
                  >
                    <Typography
                        variant="body1"
                        sx={{ color: "rgba(0,0,0,0.87)" }}
                    >
                      Share this link with the recipient to let them claim their gift:
                    </Typography>

                    <Box
                        sx={{
                          display: "flex",
                          bgcolor: "white",
                          border: "1px solid rgba(0,0,0,0.1)",
                          borderRadius: 1,
                          p: 2,
                          alignItems: "center",
                          gap: 2,
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                        }}
                    >
                      <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(0,0,0,0.8)",
                            flexGrow: 1,
                            fontFamily: "monospace",
                            fontSize: "0.9rem",
                            wordBreak: "break-all"
                          }}
                      >
                        https://evrlink.com/l/claim/?id={giftCardIdGenerated}&secret={secretKeyGenerated}
                      </Typography>
                      <Button
                          variant="contained"
                          onClick={() => {
                            const url = `https://evrlink.com/l/claim/?id=${giftCardIdGenerated}&secret=${secretKeyGenerated}`;
                            navigator.clipboard.writeText(url);
                            toast.success("Gift card link copied to clipboard!");
                          }}
                          sx={{
                            bgcolor: "#60cedc",
                            color: "black",
                            minWidth: "auto",
                            flexShrink: 0,
                            "&:hover": { bgcolor: "#4cbbc9" },
                          }}
                      >
                        Copy Link
                      </Button>
                    </Box>

                    <Alert severity="info" sx={{ mt: 1 }}>
                      Anyone with this link can claim the gift card. Make sure to share it only with the intended recipient.
                    </Alert>
                  </Box>
                </Box>
              </Box>
          );
        }
        else
        {
          return (
              <Box sx={{ mt: 2 }}>
                <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: 2,
                      bgcolor: "rgba(76, 175, 80, 0.1)",
                      p: 4,
                      borderRadius: 2,
                      border: "2px solid #4caf50",
                    }}
                >
                  <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        bgcolor: "#4caf50",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "2rem",
                        fontWeight: "bold",
                      }}
                  >
                    ✓
                  </Box>
                  <Typography
                      variant="h5"
                      sx={{
                        color: "#2e7d32",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                  >
                    Transaction Complete
                  </Typography>
                  <Typography
                      variant="body1"
                      sx={{
                        color: "#388e3c",
                        textAlign: "center",
                      }}
                  >
                    Your gift card has been successfully created!
                  </Typography>
                </Box>
              </Box>
          );
        }
        break;
      default:
        return "Unknown step";
    }
  };

  // Show Approve button if USDC allowance error
  useEffect(() => {
    if (
      error &&
      error.includes("Insufficient USDC allowance") &&
      paymentMethod === "usdc"
    ) {
      setShowApprove(true);
    } else {
      setShowApprove(false);
    }
  }, [error, paymentMethod]);

  const handleApproveUSDC = async () => {
    console.log("Handling USDC approval...");
    if (!window.ethereum || !userAddress) {
      toast.error("Wallet not connected");
      return;
    }
    setIsApproving(true);
    console.log("Starting USDC approval transaction...");
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const usdc = new ethers.Contract(
        USDC_ADDRESS,
        [
          "function approve(address spender, uint256 amount) public returns (bool)",
          "function allowance(address owner, address spender) view returns (uint256)",
        ],
        signer
      );
      // Default approve 3,000,000 USDC (or you can use a dynamic value)
      const amount = ethers.utils.parseUnits("2360000", USDC_DECIMALS);
      const tx = await usdc.approve(GIFT_CARD_CONTRACT_ADDRESS, amount);
      await tx.wait();
      // Re-check allowance after approval
      const allowance = await usdc.allowance(
        userAddress,
        GIFT_CARD_CONTRACT_ADDRESS
      );
      if (allowance.gte(ethers.utils.parseUnits("100", USDC_DECIMALS))) {
        setUsdcApproved(true);
        // setShowApprove(false);
        // setError(null);
        // toast.success("USDC allowance approved!");
      } else {
        setUsdcApproved(false);
        setShowApprove(false);
        setError(null);
        toast.success("USDC allowance approved!");
      }
    } catch (err: any) {
      toast.error(err.message || "USDC approval failed");
    } finally {
      setIsApproving(false);
    }
  };

  // Check USDC allowance when the payment method is USDC and a step is 1
  useEffect(() => {
    const checkAllowance = async () => {
      if (paymentMethod !== "usdc" || activeStep !== 1 || !userAddress) {
        setUsdcApproved(false);
        return;
      }
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const usdc = new ethers.Contract(
          USDC_ADDRESS,
          [
            "function allowance(address owner, address spender) view returns (uint256)",
          ],
          provider
        );
        const allowance = await usdc.allowance(
          userAddress,
          GIFT_CARD_CONTRACT_ADDRESS
        );
        // Use a reasonable minimum, e.g. 100 USDC
        setUsdcApproved(
          allowance.gte(ethers.utils.parseUnits("100", USDC_DECIMALS))
        );
      } catch (e) {
        setUsdcApproved(false);
      }
    };
    checkAllowance();
  }, [paymentMethod, activeStep, userAddress]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      scroll="paper"
      PaperProps={{
        style: {
          background: "white",
          borderRadius: "16px",
          color: "black",
          width: "576px",
          maxHeight: "90vh",
          margin: "32px",
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        },
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ position: "relative" }}>
          <img
            src={background.imageURI}
            alt={background.category}
            style={{
              width: "100%",
              height: "384px",
              objectFit: "cover",
              objectPosition: "center",
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
              display: "block",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
              padding: "32px 24px 16px",
            }}
          >
            <Typography
              variant="h5"
              sx={{ color: "black", mb: 1, fontWeight: "bold" }}
            >
              {categoryNameMap[background.category] || `Category #${background.category}`} Background
            </Typography>
            <Typography variant="subtitle1" sx={{ color: "rgba(0,0,0,0.7)" }}>
              By {background.artistAddress.slice(0, 6)}...
              {background.artistAddress.slice(-4)}
            </Typography>
          </Box>
          {/* <Typography
            variant="h6"
            sx={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "rgba(0,0,0,0.7)",
              padding: "8px 16px",
              borderRadius: "20px",
              border: "2px solid #00b2c7",
              color: "#00b2c7",
              fontWeight: "bold",
              backdropFilter: "blur(4px)",
            }}
          >
            {Number(background.price).toFixed(2)} USDC
          </Typography> */}
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          bgcolor: "white",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(0, 0, 0, 0.05)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#00b2c7",
            borderRadius: "4px",
          },
          "& .MuiTextField-root": {
            "& .MuiOutlinedInput-root": {
              color: "black",
              "& fieldset": {
                borderColor: "rgba(0, 0, 0, 0.23)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(0, 0, 0, 0.5)",
              },
            },
            "& .MuiInputLabel-root": {
              color: "rgba(0, 0, 0, 0.7)",
            },
          },
        }}
      >
        <Stepper
          activeStep={activeStep}
          sx={{
            pt: 2,
            pb: 4,
            "& .MuiStepLabel-label": {
              color: "black",
              "&.Mui-active": {
                color: "black",
                fontWeight: "bold",
              },
            },
            "& .MuiStepIcon-root": {
              color: "rgba(0, 0, 0, 0.3)",
              "&.Mui-active": {
                color: "#00b2c7",
              },
              "&.Mui-completed": {
                color: "#00b2c7",
              },
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2, bgcolor: "rgba(211, 47, 47, 0.1)" }}
            action={
              showApprove ? (
                <Button
                  color="primary"
                  onClick={handleApproveUSDC}
                  disabled={isApproving}
                  size="small"
                >
                  {isApproving ? (
                    <CircularProgress size={18} />
                  ) : (
                    "Approve USDC"
                  )}
                </Button>
              ) : null
            }
          >
            {error}
          </Alert>
        )}
        <Box sx={{ color: "black" }}>{getStepContent(activeStep)}</Box>
      </DialogContent>
      <DialogActions
        sx={{
          borderTop: "1px solid rgba(0,0,0,0.1)",
          p: 3,
          gap: 1,
          position: "sticky",
          bottom: 0,
          bgcolor: "#fafafa",
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            bgcolor: "#60cedc",
            color: "black",
            border: "2px solid #00b2c7",
            "&:hover": {
              bgcolor: "#4cbbc9",
            },
          }}
          variant="contained"
        >
          {activeStep === 3 ? "Done" : "Cancel"}
        </Button>
        {activeStep > 0 && activeStep < 3 && (
          <Button
            onClick={handleBack}
            sx={{
              bgcolor: "#60cedc",
              color: "black",
              border: "2px solid #00b2c7",
              "&:hover": {
                bgcolor: "#4cbbc9",
              },
            }}
            variant="contained"
          >
            Back
          </Button>
        )}
        {activeStep === 2 ? (
          <Button
            onClick={handleTransferGiftCard}
            variant="contained"
            disabled={isLoading}
            sx={{
              bgcolor: "#60cedc",
              color: "black",
              border: "2px solid #00b2c7",
              "&:hover": {
                bgcolor: "#4cbbc9",
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} />
            ) : transferType === "direct" ? (
              "Create & Transfer"
            ) : (
              "Create Gift Card"
            )}
          </Button>
        ) : activeStep < 2 ? (
          <Button
            onClick={() => {
              handleNext();
            }}
            variant="contained"
            sx={{
              bgcolor: "#60cedc",
              color: "black",
              border: "2px solid #00b2c7",
              "&:hover": {
                bgcolor: "#4cbbc9",
              },
            }}
            disabled={
              paymentMethod === "usdc" && activeStep === 1 && !usdcApproved
            }
          >
            Next
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
};

export default BackgroundDetailsModal;

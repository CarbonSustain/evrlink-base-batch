import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";
import Button from "@/components/Button";
import axios from "axios";
import {
  getAuthHeaders,
  mintBackgroundNFT,
  verifyBackgroundStatus,
  checkAuthState,
} from "@/services/api";
import { useWallet } from "@/contexts/WalletContext";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { authLog } from "@/utils/debug";
import { toast } from "react-hot-toast";

// Add CSS for modal animation
const modalStyles = `
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-50px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  .modal-animation {
    animation: fadeInDown 0.5s ease-out forwards;
  }
`;

const API_BASE_URL = "http://localhost:3001/";

const CreateBackground = () => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("1.2");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdBackground, setCreatedBackground] = useState<any>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [pendingBackgroundId, setPendingBackgroundId] = useState<number | null>(null);
  const { address, connect, disconnect, isConnected, getToken } = useWallet();

  useEffect(() => {
    // Check if user is connected
    if (!address) {
      toast.error("Please connect your wallet first");
    }
  }, [address]);

  // We'll let the user select a category manually
  // No auto-selection of category

  // Poll for background status if we have a pending background
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (pendingBackgroundId) {
      // Initial check
      checkBackgroundStatus(pendingBackgroundId);
      
      // Set up polling every 10 seconds
      intervalId = setInterval(() => {
        checkBackgroundStatus(pendingBackgroundId);
      }, 10000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [pendingBackgroundId]);

  const checkBackgroundStatus = async (backgroundId: string | number) => {
    try {
      const response = await verifyBackgroundStatus(backgroundId.toString());
      console.log("Background status check:", response);
      
      if (response.status === "confirmed" && response.background.blockchainId) {
        // Success! The background has been confirmed on the blockchain
        toast.dismiss();
        setShowSuccessModal(true);
        setCreatedBackground(response.background);
        
        // Clear the pending background
        setPendingBackgroundId(null);
      } else if (response.status === "failed") {
        // The transaction failed
        toast.dismiss();
        toast.error("Transaction failed on the blockchain. Please try again.");
        setPendingBackgroundId(null);
      }
      // For other statuses (pending, etc.), we'll continue polling
      
    } catch (error) {
      console.error("Error checking background status:", error);
    }
  };

  const categories = [
    "Birthday Cards",
    "Wedding Cards",
    "New Year Cards",
    "Love & Romance Cards",
    "Appreciation Cards",
    "Trading Sentiment Cards",
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleConnectWallet = async () => {
    try {
      toast.loading("Connecting wallet...");
      
      // For demo/development purposes - in production you'd use proper wallet connection
      // Get the user wallet address from MetaMask or similar
      const walletAddress = prompt(
        "Enter your wallet address for development purposes"
      );
      
      if (!walletAddress) {
        toast.dismiss();
        toast.error("No wallet address provided");
        return;
      }
      
      await connect(walletAddress);
      
      toast.dismiss();
      toast.success("Wallet connected successfully!");
      
      // Now open the dialog if they were trying to create a background
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Failed to connect wallet");
      console.error("Wallet connection error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!address) {
        toast.error("Please connect your wallet first");
        setLoading(false);
        return;
      }

      // Check authentication status before proceeding
      const authStatus = await checkAuthState();
      if (!authStatus.isAuthenticated) {
        authLog(
          "Authentication check failed before minting",
          { message: authStatus.message },
          "error"
        );
        toast.error(`Authentication required: ${authStatus.message}`);
        
        // Try to reconnect the wallet
        try {
          toast.loading("Reconnecting wallet...");
          await connect(address);
          toast.dismiss();
          toast.success("Wallet reconnected successfully");
        } catch (connectError) {
          toast.dismiss();
          toast.error("Failed to reconnect wallet. Please try again.");
          setLoading(false);
          return;
        }
      }

      if (!image || !category || !price) {
        toast.error("Please fill in all fields");
        setLoading(false);
        return;
      }

      console.log("Submitting form data for NFT minting:", {
        category,
        price,
        artistAddress: address,
        image: image.name,
      });
      
      toast.loading("Minting background NFT on the blockchain. Please wait...");
      
      // Use the mintBackgroundNFT API service
      const response = await mintBackgroundNFT({
        image,
        category,
        price,
      });

      console.log("Background NFT minted:", response);
      
      // toast.dismiss();
      
      // Handle both response formats - either nested or direct background object
      const background = response.background || response;

      if (response.warning) {
        toast.error(
          `Warning: ${response.warning}${
            response.error ? `: ${response.error}` : ""
          }`
        );
      } else if (background && background.transactionHash) {
        // Set the pending background ID for status polling
        setPendingBackgroundId(background.id);
        
        // Show success message with transaction details
        toast.success(
          <div>
            Background NFT minting in progress...
            <br />
            <a 
              href={`https://sepolia.etherscan.io/tx/${background.transactionHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              View on Etherscan
            </a>
            {background.message && (
              <div className="mt-2 text-xs opacity-80">
                {background.message}
              </div>
            )}
          </div>,
          { duration: 6000 }
        );
      } else {
        // Show prominent success message with a modal instead of toast
        setCreatedBackground(background);
        setShowSuccessModal(true);
      }
      
      // Reset form after successful submission
      setImage(null);
      setPreviewUrl("");
      setCategory("");
      setPrice("");
    } catch (error: any) {
      console.error("Error minting background NFT:", error);

      toast.dismiss();
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to mint background NFT";

      // Special handling for authentication errors
      if (
        errorMessage.includes("Invalid token") ||
        errorMessage.includes("Authentication failed") ||
        errorMessage.includes("token")
      ) {
        toast.error(
          `Authentication error: ${errorMessage}. Please reconnect your wallet.`
        );

        // Clear stored token and address
        localStorage.removeItem("token");

        // Try to reconnect
        try {
          if (address) {
            await connect(address);
            toast.success("Wallet reconnected. Please try minting again.");
          }
        } catch (reconnectError) {
          console.error("Reconnect error:", reconnectError);
        }
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Close modal when clicking outside of it or pressing Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowSuccessModal(false);
      }
    }
    
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowSuccessModal(false);
      }
    }
    
    if (showSuccessModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = '';
    };
  }, [showSuccessModal]);

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      {/* Background Effects */}
      <style dangerouslySetInnerHTML={{ __html: modalStyles }} />
      <div className="fixed inset-0 grid-pattern opacity-10"></div>
      <div className="fixed inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"></div>
      
      {/* Navbar provided by Layout component */}
      
      <div className="flex-1 py-16 px-4 sm:px-6 md:px-8 relative z-10 content-container max-w-5xl mx-auto w-full">
        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
            <div ref={modalRef} className="bg-white border-4 border-[#00b2c7] rounded-xl p-8 shadow-2xl max-w-md mx-auto modal-animation">
              <div className="flex items-center justify-center mb-6 text-[#00b2c7]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-4 text-gray-800">Background Created Successfully!</div>
                <div className="mb-4 text-lg text-gray-700">Your template has been added to the marketplace.</div>
                {createdBackground?.id && (
                  <div className="text-md mb-3 text-gray-600">
                    Template ID: <span className="font-medium">{createdBackground.id}</span>
                  </div>
                )}
                {createdBackground?.message && (
                  <div className="mt-3 text-sm text-gray-600">
                    {createdBackground.message}
                  </div>
                )}
                <div className="mt-6 flex justify-center space-x-4">
                  <a
                    href="/marketplace"
                    className="inline-block bg-[#00b2c7] text-white px-6 py-3 rounded-lg hover:bg-[#00b2c7]/90 transition-colors font-medium text-lg"
                  >
                    View in Templates
                  </a>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium text-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-1 py-16 px-4 sm:px-6 md:px-8 relative z-10 content-container max-w-5xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#00b2c7] via-[#6fd4df] to-[#00b2c7] mb-6 animate-pulse drop-shadow-lg">
              🚀 Coming Soon
            </h1>
            <h1 className="text-4xl font-bold mb-10 text-center text-gray-800">Create Background</h1>
          </motion.div>

          {!address ? (
            <div className="flex justify-center">
              <Button 
                onClick={handleConnectWallet}
                className="bg-[#00b2c7] text-white py-4 px-8 rounded-xl text-lg font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[#00b2c7]/20"
              >
                Connect Wallet First
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-100 border border-gray-200 rounded-xl p-8 shadow-sm"
            >
              <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
                {/* Image Upload */}
                <div className="bg-[#e6f7f9] border border-gray-200 shadow-sm rounded-xl p-6 sm:p-8">
                  <label className="block text-lg text-gray-800 mb-4">
                    Background Image
                  </label>
                  <div className="relative">
                    {!previewUrl ? (
                      <label className="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#00b2c7]/50 transition-colors bg-white">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-12 h-12 text-gray-400 mb-4" />
                          <p className="mb-2 text-sm text-gray-400">
                            <span className="font-medium">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-400">
                            High-quality image (PNG, JPG)
                          </p>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </div>
                      </label>
                    ) : (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="object-cover w-full h-72 rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImage(null);
                            setPreviewUrl("");
                          }}
                          className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Selection */}
                <div className="bg-[#e6f7f9] border border-gray-200 rounded-xl p-8 shadow-sm">
                  <label className="block text-lg text-gray-800 mb-4">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:border-[#00b2c7] focus:ring-[#00b2c7]"
                    style={{ accentColor: '#00b2c7' }}
                  >
                    <option value="">Select the category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

              {/* Price Input */}
              <div className="bg-[#e6f7f9] border border-gray-200 rounded-xl p-8 shadow-sm">
  <label className="block text-lg text-gray-800 mb-4">
    Price (in USD)
  </label>
  <input
    type="number"
    value={1.2}
    readOnly
    placeholder="Enter price in USD"
    className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:border-[#00b2c7] focus:ring-[#00b2c7] cursor-not-allowed"
  />
</div>


              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading || !image || !category || !price}
                  variant="secondary"
                  className="!bg-[#00b2c7] hover:!bg-[#00b2c7]/90 text-white py-4 px-8 rounded-xl text-lg font-medium shadow-md shadow-[#00b2c7]/20"
                >
                  {loading ? "Creating..." : "Create Background"}
                </Button>
              </div>
            </form>
          </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateBackground;

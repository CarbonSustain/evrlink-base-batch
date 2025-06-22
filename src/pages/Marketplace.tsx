import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Gift,
  Heart,
  Send,
  Lock,
  Star,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useArtNftsStore } from "@/services/store";
import { API_BASE_URL, ArtNFT } from "@/services/api";
import Button from "@/components/Button";
import CategoryNav from "@/components/CategoryNav";
import BackgroundGallery from "@/components/BackgroundGallery";
import BackgroundDetailsModal from "@/components/BackgroundDetailsModal";

interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
  icon: React.ReactNode;
}

interface BackgroundModalProps {
  background: ArtNFT | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (background: ArtNFT) => void;
}

// Update getImageUrl to handle backend URLs and Windows paths
const getImageUrl = (imageURI: string): string => {
  if (imageURI.startsWith("http")) {
    return imageURI; // S3 URL
  }
  // Convert Windows backslashes to forward slashes
  const normalizedPath = imageURI.replace(/\\\\/g, "/").replace(/\\/g, "/");

  // Remove any leading slashes to avoid double slashes in the URL
  const cleanPath = normalizedPath.replace(/^\/+/, "");

  // Construct the full URL using API_BASE_URL
  const fullUrl = `${API_BASE_URL}/${cleanPath}`;
  console.log("Constructed image URL:", fullUrl, "from:", imageURI);
  return fullUrl;
};

const BackgroundModal: React.FC<BackgroundModalProps> = ({
  background,
  isOpen,
  onClose,
  onSelect,
}) => {
  if (!background) return null;

  // Use optional chaining and fallback for artistAddress
  const artistAddress = background.artistAddress || "";

  // Use the getImageUrl function for consistent image URL handling
  const imageUrl = getImageUrl(background.imageUri);

  return (
    <>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#0A0B14] rounded-2xl shadow-2xl z-50 overflow-hidden border border-white/10"
          >
            <div className="relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white/80 hover:text-white transition-colors z-10 hover:bg-black/60"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="h-72 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B14] to-transparent z-10" />
                <img
                  src={imageUrl}
                  alt={`Category ${background.giftCardCategoryId}`}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-8 -mt-16 relative z-20">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-display font-medium text-white mb-2">
                      {background.giftCardCategoryId}
                    </h3>
                    <p className="text-gray-400 text-lg"></p>
                  </div>
                  <div className="bg-primary/20 px-6 py-3 rounded-full">
                    <span className="text-primary font-medium text-lg">
                      {background.price} ETH
                    </span>
                  </div>
                </div>

                <p className="text-gray-300 text-lg leading-relaxed mb-8">
                  Beautiful background from our {background.giftCardCategoryId}{" "}
                  collection. Use this to create a unique gift card that will be
                  minted on the blockchain.
                </p>

                <div className="bg-white/5 rounded-xl p-6 mb-8">
                  <h4 className="text-white font-medium mb-4 text-lg">
                    Background Details
                  </h4>
                  <ul className="space-y-3 text-base text-gray-300">
                    <li className="flex justify-between items-center">
                      <span>Creator Earnings</span>
                      <span className="text-primary font-medium">40%</span>
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={() => onSelect(background)}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl text-lg font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                >
                  Create Gift Card
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
};

const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArtNft, setSelectedArtNft] = useState<ArtNFT | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Use the artNfts store
  const {
    artNftsByCategory,
    isLoading,
    error,
    fetchCategoryArtNfts,
    fetchAllArtNfts,
    addArtNft,
    updateArtNft,
  } = useArtNftsStore();

  // Get artNfts for the selected category, or all artNfts if no category is selected
  const artNfts =
    selectedCategory !== null
      ? artNftsByCategory[Number(selectedCategory)] || []
      : Object.values(artNftsByCategory).flat();

  useEffect(() => {
    fetchAllArtNfts();
    // If you want to handle events, subscribe here
    // ...existing code...
  }, []);

  useEffect(() => {
    if (
      selectedCategory !== null &&
      (!artNftsByCategory[Number(selectedCategory)] ||
        artNftsByCategory[Number(selectedCategory)].length === 0)
    ) {
      fetchCategoryArtNfts(Number(selectedCategory));
    }
  }, [selectedCategory]);

  const handleArtNftAdded = (artNft: ArtNFT) => {
    addArtNft(artNft);
  };

  const handleArtNftUpdated = (artNft: ArtNFT) => {
    updateArtNft(artNft);
  };

  const handleArtNftSelect = (artNft: ArtNFT) => {
    setSelectedArtNft(artNft);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedArtNft(null);
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    if (
      category !== null &&
      (!artNftsByCategory[Number(category)] ||
        artNftsByCategory[Number(category)].length === 0)
    ) {
      fetchCategoryArtNfts(Number(category));
    }
  };

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: [0.17, 0.67, 0.83, 0.97],
      },
    }),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"></div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow delay-1000"></div>

      {/* Navbar */}
      <Navbar />

      <main className="flex-1 pt-20 pb-20">
        <div className="content-container relative z-10">
          {selectedCategory === null ? (
            <>
              {/* Templates heading */}
              <h2 className="text-3xl font-display font-medium text-black mb-4">
                Templates
              </h2>
              
              {/* Description text about celebrating with meeps */}
              <p className="text-lg text-gray-700 mb-6">
                Celebrate someone's special day with a meep that brings onchain joy, confetti, and vibes.
              </p>

              <CategoryNav
                categories={Object.keys(artNftsByCategory)}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
              />

              {/* Show all artNfts if no category is selected */}
              <div className="mt-12">
                <BackgroundGallery
                  backgrounds={artNfts}
                  isLoading={isLoading}
                  error={error}
                  onSelectBackground={handleArtNftSelect}
                  emptyStateMessage="No backgrounds available yet. Be the first to create one!"
                />
              </div>
            </>
          ) : (
            <>
              <div className="mb-10 flex justify-between items-center">
                <div>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="bg-[#6fd4df] text-black font-medium px-3 py-1 rounded-md flex items-center mb-3 transition-colors hover:opacity-90"
                  >
                    <svg
                      className="w-5 h-5 mr-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15 19L8 12L15 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Back to Categories
                  </button>
                  <h1 className="text-3xl font-display font-medium text-black">
                    Category #{selectedCategory}
                  </h1>
                </div>
              </div>

              <CategoryNav
                categories={Object.keys(artNftsByCategory)}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
              />

              {/* ArtNFT gallery for the selected category */}
              <BackgroundGallery
                backgrounds={artNfts}
                isLoading={isLoading}
                error={error}
                onSelectBackground={handleArtNftSelect}
                emptyStateMessage={`No backgrounds found in ${
                  selectedCategory || "this category"
                }`}
              />
            </>
          )}
        </div>
      </main>

      {selectedArtNft && (
        <BackgroundDetailsModal
          open={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          background={{
            id: selectedArtNft.id.toString(),
            artistAddress: selectedArtNft.artistAddress,
            imageURI: selectedArtNft.imageUri,
            category: selectedArtNft.giftCardCategoryId.toString(),
            price: selectedArtNft.price,
            usageCount: 0,
            createdAt: selectedArtNft.createdAt,
            updatedAt: selectedArtNft.updatedAt,
          }}
        />
      )}
    </div>
  );
};

export default Marketplace;

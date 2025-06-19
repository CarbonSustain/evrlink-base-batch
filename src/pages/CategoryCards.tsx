import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Heart, Send, Plus, Loader2 } from "lucide-react";
import Button from "@/components/Button";
import Navbar from "@/components/Navbar";
import CategoryNav from "@/components/CategoryNav";
import BackgroundGallery from "@/components/BackgroundGallery";
import { ArtNFT } from "@/services/api";
import { eventBus } from "@/services/eventBus";

// Define ArtNftUpdatedEvent type locally if not exported from eventBus
type ArtNftUpdatedEvent = {
  artNft: ArtNFT;
  action: "added" | "updated";
};
import { useArtNftsStore } from "@/services/store";

interface CardModalProps {
  artNft: ArtNFT | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (artNft: ArtNFT) => void;
}

const CardModal: React.FC<CardModalProps> = ({
  artNft,
  isOpen,
  onClose,
  onSelect,
}) => {
  if (!artNft) return null;

  // Use imageUri (camelCase) as per updated api.ts/store.ts
  const imageUrl = artNft.imageUri.startsWith("http")
    ? artNft.imageUri
    : `http://localhost:3001/${artNft.imageUri}`;

  return (
    <AnimatePresence>
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
                  alt={`Category ${artNft.giftCardCategoryId}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 -mt-16 relative z-20">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-display font-medium text-white mb-2">
                      Category #{artNft.giftCardCategoryId}
                    </h3>
                    <p className="text-gray-400 text-lg">
                      Created by {artNft.artistAddress.slice(0, 6)}...
                      {artNft.artistAddress.slice(-4)}
                    </p>
                  </div>
                  <div className="bg-primary/20 px-6 py-3 rounded-full">
                    <span className="text-primary font-medium text-lg">
                      {artNft.price} ETH
                    </span>
                  </div>
                </div>

                <p className="text-gray-300 text-lg leading-relaxed mb-8">
                  Beautiful background from our Category #
                  {artNft.giftCardCategoryId} collection. Use this to create a
                  unique gift card that will be minted on the blockchain.
                </p>

                <div className="bg-white/5 rounded-xl p-6 mb-8">
                  <h4 className="text-white font-medium mb-4 text-lg">
                    Card Details
                  </h4>
                  <ul className="space-y-3 text-base text-gray-300">
                    <li className="flex justify-between items-center">
                      <span>Creator Earnings</span>
                      <span className="text-primary font-medium">40%</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Platform Fee</span>
                      <span className="text-secondary font-medium">60%</span>
                    </li>
                    {/* If you want to display another property, replace 'blockchainId' with a valid ArtNFT property, e.g. 'id' */}
                    {artNft.id && (
                      <li className="flex justify-between items-center">
                        <span>Background ID</span>
                        <span className="text-secondary font-medium">
                          #{artNft.id}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>

                <Button
                  onClick={() => onSelect(artNft)}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl text-lg font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                >
                  Create Gift Card
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const CategoryCards: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [selectedArtNft, setSelectedArtNft] = useState<ArtNFT | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Use the art NFTs store
  const {
    artNftsByCategory,
    isLoading,
    error,
    fetchCategoryArtNfts,
    fetchAllArtNfts,
    addArtNft,
    updateArtNft,
  } = useArtNftsStore();

  // Use categoryId as string (category name) for filtering, as per updated api.ts/store.ts
  const artNfts = selectedCategory
    ? Object.values(artNftsByCategory)
        .flat()
        .filter(
          (nft) =>
            String(nft.giftCardCategoryId) === String(selectedCategory) ||
            nft.giftCardCategoryId === Number(selectedCategory)
        )
    : Object.values(artNftsByCategory).flat();

  useEffect(() => {
    fetchAllArtNfts().catch((err) => {
      console.error("Failed to load art NFTs:", err);
    });
  }, []);

  useEffect(() => {
    if (categoryId) {
      const decodedCategory = decodeURIComponent(categoryId);
      setSelectedCategory(decodedCategory);
      // Fetch by category name (string) as per updated api.ts
      fetchCategoryArtNfts(Number(decodedCategory)).catch((err) => {
        console.error(
          "Failed to load art NFTs for category:",
          decodedCategory,
          err
        );
      });
    }
  }, [categoryId]);

  useEffect(() => {
    // Subscribe to art NFT update events
    const unsubscribe = eventBus.onArtNftUpdated(handleArtNftChange);

    // Clean up event listener on component unmount
    return typeof unsubscribe === "function" ? unsubscribe : undefined;
  }, [selectedCategory]);

  // Handler for art NFT changes
  const handleArtNftChange = (data: ArtNftUpdatedEvent) => {
    console.log("Art NFT change detected:", data);

    // Only refresh if we're in the same category as the changed art NFT
    // or if no category is selected yet
    if (
      data.artNft &&
      data.artNft.giftCardCategoryId &&
      (!selectedCategory ||
        String(data.artNft.giftCardCategoryId) === String(selectedCategory))
    ) {
      if (data.action === "added") {
        // Add the new art NFT to our store
        addArtNft(data.artNft);
      } else if (data.action === "updated") {
        // Update the existing art NFT in our store
        updateArtNft(data.artNft);
      }
    }
  };

  const handleCardSelect = (artNft: ArtNFT) => {
    // Navigate to create gift page with art NFT
    navigate(`/create-gift`, {
      state: {
        backgroundId: artNft.id,
        backgroundPrice: artNft.price,
        backgroundImage: artNft.imageUri.startsWith("http")
          ? artNft.imageUri
          : `http://localhost:3001/${artNft.imageUri}`,
      },
    });
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    // Update URL to reflect the selected category
    navigate(`/categories/${encodeURIComponent(category)}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0B14] relative">
      {/* Background Effects */}
      <div className="fixed inset-0 grid-pattern opacity-10"></div>
      <div className="fixed inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"></div>

      {/* Navbar */}
      <Navbar />

      <div className="content-container relative z-10 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-display font-medium text-white mb-2">
              {selectedCategory ? selectedCategory : "Backgrounds"}
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full" />
          </div>

          <Button
            onClick={() => navigate("/create-background")}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl text-base font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            Create Background
          </Button>
        </motion.div>

        {/* Category Navigation */}
        <CategoryNav
          categories={Object.keys(artNftsByCategory)}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />

        {/* Background Gallery using our reusable component */}
        <BackgroundGallery
          backgrounds={artNfts}
          isLoading={isLoading}
          error={error}
          onSelectBackground={setSelectedArtNft}
          emptyStateMessage={
            error
              ? "Failed to load art NFTs"
              : `No backgrounds found in ${selectedCategory || "this category"}`
          }
        />
      </div>
      <CardModal
        artNft={selectedArtNft}
        isOpen={!!selectedArtNft}
        onClose={() => setSelectedArtNft(null)}
        onSelect={handleCardSelect}
      />
    </div>
  );
};

export default CategoryCards;

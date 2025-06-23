import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import { Search, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArtNftsStore } from '@/services/store';
import { ArtNFT, API_BASE_URL } from '@/services/api';
import BackgroundDetailsModal from '@/components/BackgroundDetailsModal';
import { getUserProfile, getDetailedProfile, GiftCard } from '@/utils/api';
import { useWallet } from '@/contexts/WalletContext';

// Helper function to format ArtNFT data for display and search
const formatArtNFTForDisplay = (artNft: ArtNFT) => {
  // Category name mapping
  const categoryNameMap: { [key: string]: string } = {
    "1": "Birthday Cards",
    "2": "Wedding Cards",
    "3": "New Year Cards",
    "4": "Love & Romance Cards",
    "5": "Appreciation Cards",
    "6": "Trading Sentiment Cards",
  };
  
  // Get the human-readable category name
  const categoryId = artNft.giftCardCategoryId?.toString() || "";
  const categoryName = categoryNameMap[categoryId] || `Category #${categoryId}`;
  
  return {
    id: artNft.id.toString(),
    categoryId: categoryId,
    category: categoryName,
    description: 'Beautiful background for creating unique gift cards.', // Default description
    creator: artNft.artistAddress,
    price: artNft.price,
    imageUrl: getImageUrl(artNft.imageUri),
    originalNft: artNft
  };
};

// Update getImageUrl to handle backend URLs and Windows paths
const getImageUrl = (imageURI: string): string => {
  if (imageURI.startsWith("http")) {
    return imageURI; // S3 URL
  }
  // Convert Windows backslashes to forward slashes
  const normalizedPath = imageURI.replace(/\\/g, "/").replace(/\\/g, "/");

  // Remove any leading slashes to avoid double slashes in the URL
  const cleanPath = normalizedPath.replace(/^\/+/, "");

  // Construct the full URL using API_BASE_URL
  return `${API_BASE_URL}/${cleanPath}`;
};

// Update SearchCategory to include gifts
type SearchCategory = 'all' | 'backgrounds' | 'gifts';

// Interface for formatted gift cards
interface MappedGiftCard {
  id: string;
  imageUrl: string;
  senderAddress: string;
  recipientAddress: string;
  senderName: string;
  recipientName: string;
  message: string;
  amount: string;
  date: string;
  status: "Sent" | "Received";
  matchedFields?: {
    address: boolean;
    date: boolean;
    message: boolean;
  };
  exactMatch?: boolean;
  type?: string;
}

interface FormattedArtNFT {
  id: string;
  categoryId: string;
  category: string;
  description: string;
  creator: string;
  price: string;
  imageUrl: string;
  originalNft?: ArtNFT;
  matchedFields?: {
    category: boolean;
    categoryId: boolean;
    description: boolean;
    creator: boolean;
    price: boolean;
  };
  exactMatch?: boolean;
  type?: string;
}

const SearchResults: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [results, setResults] = useState<(FormattedArtNFT | MappedGiftCard)[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Modal state for BackgroundDetailsModal
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedBackground, setSelectedBackground] = useState<any>(null);
  
  // Get wallet context for user address
  const { address } = useWallet();
  
  // Gift card state
  const [sentGifts, setSentGifts] = useState<MappedGiftCard[]>([]);
  const [receivedGifts, setReceivedGifts] = useState<MappedGiftCard[]>([]);
  
  // Get actual marketplace data from store
  const { artNftsByCategory, fetchAllArtNfts } = useArtNftsStore();
  
  // Format artNfts for search and display
  const allFormattedArtNfts = useMemo(() => {
    const allArtNfts = Object.values(artNftsByCategory).flat();
    return allArtNfts.map(formatArtNFTForDisplay);
  }, [artNftsByCategory]);
  
  // Helper function to map gift cards for search
  const mapGiftCardForSearch = (card: GiftCard, status: "Sent" | "Received") => ({
    id: card.id,
    imageUrl: getImageUrl(card.Background?.imageURI || card.backgroundUrl),
    senderAddress: card.creatorAddress || "",
    recipientAddress: card.currentOwner || "",
    senderName: card.creatorAddress || "",
    recipientName: card.currentOwner || "",
    message: card.message || "",
    amount: `${card.price} USDC`,
    date: card.createdAt ? new Date(card.createdAt).toLocaleDateString() : "",
    status,
    type: 'gift'
  });

  // Fetch gift cards for the current user
  const fetchGiftCards = async () => {
    if (!address) return;
    
    try {
      const [_, detailedProfile] = await Promise.all([
        getUserProfile(address),
        getDetailedProfile(address),
      ]);
      
      const mappedReceivedCards = detailedProfile.profile.receivedCards.map(
        (card: GiftCard) => mapGiftCardForSearch(card, "Received")
      );
      
      const mappedSentCards = detailedProfile.profile.sentCards.map(
        (card: GiftCard) => mapGiftCardForSearch(card, "Sent")
      );

      setSentGifts(mappedSentCards);
      setReceivedGifts(mappedReceivedCards);
    } catch (error) {
      console.error("Error fetching gift cards:", error);
    }
  };

  // Fetch all art NFTs and gift cards when component mounts
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchAllArtNfts();
      if (address) {
        await fetchGiftCards();
      }
      setIsLoading(false);
    };
    loadData();
  }, [fetchAllArtNfts, address]);

  useEffect(() => {
    if (!isLoading) {
      performSearch(query, activeCategory);
    }
  }, [query, activeCategory, allFormattedArtNfts, isLoading, sentGifts, receivedGifts]);
  
  // Handle clicking "Generate Meep" button
  const handleGenerateMeep = (background: FormattedArtNFT) => {
    // Format the background data to match what BackgroundDetailsModal expects
    const modalBackground = {
      id: background.id,
      artistAddress: background.creator,
      imageURI: background.imageUrl,
      category: background.category,
      price: background.price,
      usageCount: 0, // Default value for usageCount
      // Use the original NFT if available
      ...(background.originalNft && {
        blockchainId: background.originalNft.id.toString(),
        // Add any other fields from originalNft that might be needed
      })
    };
    
    // Set the selected background and open the modal
    setSelectedBackground(modalBackground);
    setModalOpen(true);
  };
  
  // Handle closing the modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBackground(null);
  };

  const performSearch = (query: string, category: SearchCategory) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    let searchResults: (FormattedArtNFT | MappedGiftCard)[] = [];

    // Search in backgrounds if category is 'all' or 'backgrounds'
    if (category === 'all' || category === 'backgrounds') {
      // First look for exact matches in category ID or creator address (the highlighted parts)
      const exactMatches = allFormattedArtNfts.filter(
        bg =>
          bg.category.toLowerCase() === searchTerm ||
          bg.categoryId === searchTerm ||
          bg.creator.toLowerCase() === searchTerm
      ).map(bg => ({
        ...bg,
        matchedFields: {
          category: bg.category.toLowerCase() === searchTerm,
          categoryId: bg.categoryId === searchTerm,
          description: false,
          creator: bg.creator.toLowerCase() === searchTerm,
          price: false
        },
        exactMatch: true,
        type: 'background'
      }));
      
      // Then look for partial matches in all fields
      const partialMatches = allFormattedArtNfts.filter(
        bg =>
          // Don't include exact matches again
          !(bg.category.toLowerCase() === searchTerm || 
            bg.categoryId === searchTerm ||
            bg.creator.toLowerCase() === searchTerm) &&
          // Look for partial matches in all fields
          (bg.category.toLowerCase().includes(searchTerm) ||
           bg.categoryId.includes(searchTerm) ||
           bg.description.toLowerCase().includes(searchTerm) ||
           bg.creator.toLowerCase().includes(searchTerm) ||
           bg.price.toLowerCase().includes(searchTerm))
      ).map(bg => ({
        ...bg,
        matchedFields: {
          category: bg.category.toLowerCase().includes(searchTerm),
          categoryId: bg.categoryId.includes(searchTerm),
          description: bg.description.toLowerCase().includes(searchTerm),
          creator: bg.creator.toLowerCase().includes(searchTerm),
          price: bg.price.toLowerCase().includes(searchTerm)
        },
        exactMatch: false,
        type: 'background'
      }));

      // Combine background exact and partial matches
      searchResults = [...exactMatches, ...partialMatches];
    }

    // Search in gift cards if category is 'all' or 'gifts'
    if ((category === 'all' || category === 'gifts') && (receivedGifts.length > 0 || sentGifts.length > 0)) {
      // Combine received and sent gifts
      const allGifts = [...receivedGifts, ...sentGifts];
      
      // Search for exact matches in address, date, and message
      const exactGiftMatches = allGifts.filter(
        gift =>
          gift.senderAddress.toLowerCase() === searchTerm ||
          gift.recipientAddress.toLowerCase() === searchTerm ||
          gift.date === searchTerm ||
          gift.message.toLowerCase() === searchTerm
      ).map(gift => ({
        ...gift,
        matchedFields: {
          address: gift.senderAddress.toLowerCase() === searchTerm || gift.recipientAddress.toLowerCase() === searchTerm,
          date: gift.date === searchTerm,
          message: gift.message.toLowerCase() === searchTerm
        },
        exactMatch: true,
        type: 'gift'
      }));

      // Search for partial matches in address, date, and message
      const partialGiftMatches = allGifts.filter(
        gift =>
          // Don't include exact matches again
          !(gift.senderAddress.toLowerCase() === searchTerm ||
            gift.recipientAddress.toLowerCase() === searchTerm ||
            gift.date === searchTerm ||
            gift.message.toLowerCase() === searchTerm) &&
          // Look for partial matches
          (gift.senderAddress.toLowerCase().includes(searchTerm) ||
           gift.recipientAddress.toLowerCase().includes(searchTerm) ||
           gift.date.includes(searchTerm) ||
           gift.message.toLowerCase().includes(searchTerm) ||
           gift.amount.toLowerCase().includes(searchTerm))
      ).map(gift => ({
        ...gift,
        matchedFields: {
          address: gift.senderAddress.toLowerCase().includes(searchTerm) || gift.recipientAddress.toLowerCase().includes(searchTerm),
          date: gift.date.includes(searchTerm),
          message: gift.message.toLowerCase().includes(searchTerm)
        },
        exactMatch: false,
        type: 'gift'
      }));

      // Add gift matches to search results
      searchResults = [...searchResults, ...exactGiftMatches, ...partialGiftMatches];
    }

    setResults(searchResults);
  };

  return (
    <>
      {/* Main content */}
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Search Results for "{query}"</h1>
        <nav className="flex mb-6 border-b space-x-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              "px-6 py-3 transition-all rounded-t-lg font-medium",
              activeCategory === 'all' 
                ? "text-white bg-[#00b2c7] border-[#00b2c7]" 
                : "text-gray-600 hover:bg-gray-100 hover:text-[#00b2c7]"
            )}
          >
            All
          </button>
          <button
            onClick={() => setActiveCategory('backgrounds')}
            className={cn(
              "px-6 py-3 transition-all rounded-t-lg font-medium",
              activeCategory === 'backgrounds' 
                ? "text-white bg-[#00b2c7] border-[#00b2c7]" 
                : "text-gray-600 hover:bg-gray-100 hover:text-[#00b2c7]"
            )}
          >
            Backgrounds
          </button>
          <button
            onClick={() => setActiveCategory('gifts')}
            className={cn(
              "px-6 py-3 transition-all rounded-t-lg font-medium", 
              activeCategory === 'gifts' 
                ? "text-white bg-[#00b2c7] border-[#00b2c7]" 
                : "text-gray-600 hover:bg-gray-100 hover:text-[#00b2c7]"
            )}
          >
            Received Meeps
          </button>
        </nav>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 mb-4">
              <div className="w-full h-full border-4 border-t-[#00b2c7] border-r-[#00b2c7] border-b-[#00b2c7] border-l-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Loading search results...</h3>
            <p className="text-gray-500">
              {activeCategory === 'all' ? 'Please wait while we search the marketplace and your Meeps.' : 
               activeCategory === 'backgrounds' ? 'Please wait while we search the marketplace backgrounds.' : 
               'Please wait while we search through your Meeps.'}
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {activeCategory === 'all' ? 'No results found' : 
               activeCategory === 'backgrounds' ? 'No backgrounds found' : 
               'No Meeps found'}
            </h3>
            <p className="mt-1 text-gray-500">Try adjusting your search terms or select a different category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((item, index) => {
              // ... (rest of the code remains the same)

              if (!('type' in item) || item.type === 'background') {
                const bg = item as FormattedArtNFT;
                return (
                  <div 
                    key={`bg-${bg.id}-${index}`} 
                    className={cn(
                      "rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border",
                      bg.exactMatch 
                        ? "border-[#00b2c7] ring-1 ring-[#00b2c7]" 
                        : "border-gray-100"
                    )}
                  >
                    <div className="relative">
                      <img 
                        src={bg.imageUrl} 
                        alt={bg.description}
                        className="h-40 w-full object-cover"
                      />
                      <div className={cn(
                        "absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-medium",
                        bg.matchedFields?.price 
                          ? "bg-[#00b2c7] text-white font-bold ring-2 ring-[#00b2c7] ring-offset-1" 
                          : "bg-[#00b2c7] text-white"
                      )}>
                        {bg.price}
                      </div>
                    </div>
                    <div className="p-3 flex flex-col space-y-2">
                      {/* Category - Primary focus for highlighting */}
                      <div className={cn(
                        "px-2 py-1 rounded text-sm inline-block self-start",
                        bg.matchedFields?.category 
                          ? "bg-[#00b2c7] text-white font-medium ring-2 ring-[#00b2c7] ring-offset-1 scale-105 transform" 
                          : "bg-gray-100 text-gray-800"
                      )}>
                        {bg.category}
                      </div>
                      
                      <div className={cn(
                        "px-2 py-1 rounded text-sm inline-block self-start",
                        bg.matchedFields?.description 
                          ? "bg-[#00b2c7] text-white font-medium" 
                          : "bg-gray-100 text-gray-800"
                      )}>
                        {bg.description}
                      </div>
                      
                      {/* Creator Address - Secondary focus for highlighting */}
                      <div className={cn(
                        "px-2 py-1 rounded text-sm inline-block self-start",
                        bg.matchedFields?.creator 
                          ? "bg-[#00b2c7] text-white font-medium ring-2 ring-[#00b2c7] ring-offset-1" 
                          : "bg-gray-100 text-gray-800"
                      )}>
                        By {bg.creator}
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateMeep(bg);
                        }}
                        className="w-full mt-2 bg-[#00b2c7] hover:bg-[#008fa0] text-white py-2 rounded-md font-medium flex items-center justify-center space-x-2"
                      >
                        <Gift size={18} />
                        <span>Generate Meep</span>
                      </button>
                    </div>
                  </div>
                );
              } 
              // Gift Card
              else {
                const gift = item as MappedGiftCard;
                return (
                  <div 
                    key={`gift-${gift.id}-${index}`}
                    className={cn(
                      "rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border",
                      gift.exactMatch 
                        ? "border-[#00b2c7] ring-1 ring-[#00b2c7]" 
                        : "border-gray-100"
                    )}
                  >
                    <div className="relative">
                      <img 
                        src={gift.imageUrl} 
                        alt="Gift Card"
                        className="h-40 w-full object-cover"
                      />
                      <div className="absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-medium bg-[#00b2c7] text-white">
                        {gift.amount}
                      </div>
                      <div className="absolute bottom-2 left-2 px-3 py-1 rounded-full text-sm font-medium bg-[#00b2c7] bg-opacity-90 text-white flex items-center space-x-1">
                        <Gift size={14} />
                        <span>{gift.status === "Received" ? "Received Meep" : "Sent Meep"}</span>
                      </div>
                    </div>
                    <div className="p-3 flex flex-col space-y-2">
                      {/* Address - Primary focus for highlighting */}
                      <div className={cn(
                        "px-2 py-1 rounded text-sm inline-block self-start truncate max-w-full",
                        gift.matchedFields?.address 
                          ? "bg-[#00b2c7] text-white font-medium ring-2 ring-[#00b2c7] ring-offset-1" 
                          : "bg-gray-100 text-gray-800"
                      )}>
                        {gift.status === "Received" 
                          ? `From: ${gift.senderAddress}` 
                          : `To: ${gift.recipientAddress}`}
                      </div>
                      
                      {/* Date */}
                      <div className={cn(
                        "px-2 py-1 rounded text-sm inline-block self-start",
                        gift.matchedFields?.date 
                          ? "bg-[#00b2c7] text-white font-medium ring-2 ring-[#00b2c7] ring-offset-1" 
                          : "bg-gray-100 text-black"
                      )}>
                        Date: {gift.date}
                      </div>
                      
                      {/* Message */}
                      {gift.message && (
                        <div className={cn(
                          "px-2 py-1 rounded text-sm font-bold inline-block self-start",
                          gift.matchedFields?.message 
                            ? "bg-[#00b2c7] text-white ring-2 ring-[#00b2c7] ring-offset-1" 
                            : "bg-gray-100 text-[#00b2c7]"
                        )}>
                          "{gift.message}"
                        </div>
                      )}
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/gallery`);
                        }}
                        className="w-full mt-2 bg-[#00b2c7] hover:bg-[#008fa0] text-white py-2 rounded-md font-medium flex items-center justify-center space-x-2"
                      >
                        <Gift size={18} />
                        <span>View Meep Details</span>
                      </button>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
      
      {/* Background Details Modal */}
      {selectedBackground && (
        <BackgroundDetailsModal
          open={modalOpen}
          onClose={handleCloseModal}
          background={selectedBackground}
        />
      )}
    </>
  );
};

export default SearchResults;

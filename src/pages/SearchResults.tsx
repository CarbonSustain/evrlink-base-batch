import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArtNftsStore } from '@/services/store';
import { ArtNFT, API_BASE_URL } from '@/services/api';
import BackgroundDetailsModal from '@/components/BackgroundDetailsModal';

// Helper function to format ArtNFT data for display and search
const formatArtNFTForDisplay = (artNft: ArtNFT) => {
  return {
    id: artNft.id.toString(),
    category: `Category #${artNft.giftCardCategoryId}`,
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

type SearchCategory = 'all' | 'backgrounds';

interface FormattedArtNFT {
  id: string;
  category: string;
  description: string;
  creator: string;
  price: string;
  imageUrl: string;
  originalNft?: ArtNFT;
  matchedFields?: {
    category: boolean;
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
  const query = searchParams.get('q') || '';
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [results, setResults] = useState<FormattedArtNFT[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Modal state for BackgroundDetailsModal
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedBackground, setSelectedBackground] = useState<any>(null);
  
  // Get actual marketplace data from store
  const { artNftsByCategory, fetchAllArtNfts } = useArtNftsStore();
  
  // Format artNfts for search and display
  const allFormattedArtNfts = useMemo(() => {
    const allArtNfts = Object.values(artNftsByCategory).flat();
    return allArtNfts.map(formatArtNFTForDisplay);
  }, [artNftsByCategory]);
  
  // Fetch all art NFTs when component mounts
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchAllArtNfts();
      setIsLoading(false);
    };
    loadData();
  }, [fetchAllArtNfts]);

  useEffect(() => {
    if (!isLoading) {
      performSearch(query, activeCategory);
    }
  }, [query, activeCategory, allFormattedArtNfts, isLoading]);
  
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
    let searchResults: FormattedArtNFT[] = [];

    if (category === 'all' || category === 'backgrounds') {
      // First look for exact matches in category ID or creator address (the highlighted parts)
      const exactMatches = allFormattedArtNfts.filter(
        bg =>
          bg.category.toLowerCase() === searchTerm ||
          bg.category.split('#')[1] === searchTerm ||
          bg.creator.toLowerCase() === searchTerm
      ).map(bg => ({
        ...bg,
        matchedFields: {
          category: bg.category.toLowerCase() === searchTerm || bg.category.split('#')[1] === searchTerm,
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
            bg.category.split('#')[1] === searchTerm ||
            bg.creator.toLowerCase() === searchTerm) &&
          // Look for partial matches in all fields
          (bg.category.toLowerCase().includes(searchTerm) ||
           bg.description.toLowerCase().includes(searchTerm) ||
           bg.creator.toLowerCase().includes(searchTerm) ||
           bg.price.toLowerCase().includes(searchTerm))
      ).map(bg => ({
        ...bg,
        matchedFields: {
          category: bg.category.toLowerCase().includes(searchTerm),
          description: bg.description.toLowerCase().includes(searchTerm),
          creator: bg.creator.toLowerCase().includes(searchTerm),
          price: bg.price.toLowerCase().includes(searchTerm)
        },
        exactMatch: false,
        type: 'background'
      }));

      // Combine exact and partial matches, with exact matches first
      searchResults = [...exactMatches, ...partialMatches];
    }

    setResults(searchResults);
  };

  return (
    <>
      {/* Main content */}
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Search Results for "{query}"</h1>
        <div className="flex overflow-x-auto space-x-2 pb-4 mb-6">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeCategory === 'all' 
                ? "bg-[#00b2c7] text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            All Results
          </button>
          <button
            onClick={() => setActiveCategory('backgrounds')}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeCategory === 'backgrounds' 
                ? "bg-[#00b2c7] text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Templates
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4 animate-pulse">
              <Search className="h-8 w-8 text-teal-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Loading search results...</h3>
            <p className="mt-1 text-gray-500">Please wait while we search the marketplace.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No results found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map(bg => (
              <div 
                key={bg.id} 
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
                    className="w-full mt-2 bg-[#00b2c7] hover:bg-[#008fa0] text-white py-2 rounded-md font-medium"
                  >
                    Generate Meep
                  </button>
                </div>
              </div>
            ))}
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

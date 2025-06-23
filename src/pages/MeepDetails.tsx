import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import evrlinklogo from '../../public/images/g-Logo.png';
import bell from '../../public/images/Bell.png';
import wallet from '../../public/images/Frame 14.png';
import { useWallet } from '@/contexts/WalletContext';
import birthdayCard from '../../public/images/birthday-card.jpg';
import { useArtNftsStore } from '@/services/store';
import { API_BASE_URL } from '@/services/api';




const getImageUrl = (uri: string) => {
  if (uri.startsWith('http')) return uri;
  const clean = uri.replace(/\\\\/g, '/').replace(/\\/g, '/').replace(/^\/+/, '');
  return `${API_BASE_URL}/${clean}`;
};

const MeepDetails = () => {

  const { id } = useParams<{ id: string }>();
  const meepId = id ? Number(id) : NaN;

  const { artNftsByCategory, fetchAllArtNfts, isLoading } = useArtNftsStore();
  const [nft, setNft] = useState<any>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showWalletAddress, setShowWalletAddress] = useState(false);
  const { address, disconnect } = useWallet();
  const [walletAddress, setWalletAddress] = useState('');
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    // Get wallet address from localStorage or context
    const storedAddress = address || localStorage.getItem('walletAddress');
    if (storedAddress) {
      setWalletAddress(storedAddress);
    }
  }, [address]);
  
  useEffect(() => {
    // Set initial desktop state
    setIsDesktop(window.innerWidth >= 1024);
    
    // Handle resize events
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Function to abbreviate wallet address for display
  const abbreviateAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const toggleWalletAddressDisplay = () => {
    setShowWalletAddress(!showWalletAddress);
  };

  const handleLogout = () => {
    // Clear localStorage items
    localStorage.removeItem('token');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('userEmail');
    
    // Disconnect wallet if connected
    if (disconnect) {
      disconnect();
    } else {
      // If disconnect function is not available, force redirect
      window.location.href = '/';
    }
  };

  useEffect(() => {
    if (Object.keys(artNftsByCategory).length === 0) {
      fetchAllArtNfts();
    }
  }, [fetchAllArtNfts, artNftsByCategory]);

  useEffect(() => {
    const allNfts = Object.values(artNftsByCategory).flat();
    const match = allNfts.find((item) => item.id === meepId);
    setNft(match || null);
  }, [artNftsByCategory, meepId]);

  if (!id || isNaN(meepId)) {
    return <div className="text-red-500 text-center mt-10">Invalid Meep ID</div>;
  }

  if (isLoading || (!nft && Object.keys(artNftsByCategory).length === 0)) {
    return <div className="text-gray-500 text-center mt-10">Loading...</div>;
  }

  if (!nft) {
    return <div className="text-red-500 text-center mt-10">Meep not found.</div>;
  }
// console.log("nft", nft);
// console.log("meepId", meepId);
// console.log("isLoading", isLoading);
// console.log("artNftsByCategory", artNftsByCategory);
// console.log("fetchAllArtNfts", fetchAllArtNfts);
// console.log("id", id);
// console.log("nft", nft);

  return (
    <div className="min-h-screen bg-white flex">
      

        {/* Main Content */}
        <main className="pt-16 px-4 lg:px-8 bg-[#fafbfc] min-h-[90vh] flex justify-center items-start">
          {/* Card Content Layout */}
          <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl lg:max-w-6xl lg:w-[1100px] bg-white rounded-2xl shadow-md p-8 mt-8 mx-auto">
            {/* Left: Card Image */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <button
                className="self-start mb-4 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => navigate('/dashboard')}
              >
                <span className="material-icons mr-1 text-base">arrow_back</span>
                <span className="text-sm">Back</span>
              </button>
              <div className="bg-white rounded-xl shadow p-2">
              <img
                src={getImageUrl(nft.imageUri)}
                alt={`Meep ${nft.id}`}
                className="w-[320px] h-[240px] lg:w-[500px] lg:h-[375px] xl:w-[600px] xl:h-[450px] object-cover rounded-lg border border-gray-100 shadow-sm"
              />
              </div>
            </div>
            {/* Right: Card Details */}
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Birthday Bling <span className="font-normal text-gray-500">by Evrlink</span></h2>
              <div className="text-xs text-gray-400 mb-2">#birthday #celebration</div>
              <button className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full mb-4 flex items-center gap-1 w-fit">
                Personal Message <span className="material-icons text-xs">arrow_drop_down</span>
              </button>
              <div className="text-gray-700 text-base mb-6" style={{ maxWidth: '400px' }}>
                {nft.giftCardCategoryId === 1 ? (
                  <>
                    Happy Birthday! 🎉<br />
                    May your year be filled with joy, love, and endless memories.
                  </>
                ) : (
                  <>
                    Hey there,<br />
                    Just wanted to remind you that you're doing great. Keep shining.
                  </>
                )}
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <strong>Price:</strong> ${parseFloat(nft.price).toFixed(2)} USDC
              </div>
              <button className="bg-[#00B2C7] hover:bg-[#0090a0] text-white font-semibold px-6 py-2 rounded-lg shadow w-fit transition-colors duration-200">
                Share Meep
              </button>
            </div>
          </div>
        </main>
      </div>
  );
};


export default MeepDetails; 
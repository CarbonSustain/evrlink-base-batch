import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import evrlinklogo from '../../public/images/g-Logo.png';
import bell from '../../public/images/Bell.png';
import wallet from '../../public/images/Frame 14.png';
import { useWallet } from '@/contexts/WalletContext';
import { motion, AnimatePresence } from "framer-motion";
import { Box, Typography, Button } from "@mui/material";
import { Card, CardContent } from "@/components/ui/card";
import { Gift as GiftIcon, Send, Download, User } from "lucide-react";
import GiftCardDetailsDialog from "@/components/GiftCardDetailsDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserProfile, getDetailedProfile, GiftCard } from "@/utils/api";
import { API_BASE_URL } from "@/services/api";

// 📦 Interfaces
interface UserStats {
  totalGiftCardsCreated: number;
  totalGiftCardsSent: number;
  totalGiftCardsReceived: number;
  totalBackgroundsMinted: number;
}

interface UserProfileData {
  username: string;
  stats: UserStats;
}

interface MappedGiftCard {
  id: string;
  imageUrl: string;
  senderName: string;
  recipientName: string;
  message: string;
  amount: string;
  date: string;
  status: "Sent" | "Received";
}

interface GiftCardItemProps {
  gift: MappedGiftCard;
}

// 🛠 Utility Function
const getImageUrl = (imageURI: string): string => {
  if (imageURI.startsWith("http")) {
    return imageURI; // S3 URL
  }

  const normalizedPath = imageURI.replace(/\\\\/g, "/").replace(/\\/g, "/");
  const cleanPath = normalizedPath.replace(/^\/+/, "");
  const fullUrl = `${API_BASE_URL}/${cleanPath}`;

  // console.log("Constructed image URL:", fullUrl, "from:", imageURI);
  return fullUrl;
};


const MyGallery = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showWalletAddress, setShowWalletAddress] = useState(false);
  const { address, disconnect } = useWallet();
  const [walletAddress, setWalletAddress] = useState('');
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState(false);
  //new states
  const [selectedGift, setSelectedGift] = useState<MappedGiftCard | null>(null);
const [detailsOpen, setDetailsOpen] = useState(false);
const [sentGifts, setSentGifts] = useState<MappedGiftCard[]>([]);
const [receivedGifts, setReceivedGifts] = useState<MappedGiftCard[]>([]);
const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
useEffect(() => {
  if (walletAddress) {
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [profileData, detailedProfile] = await Promise.all([
          getUserProfile(walletAddress),
          getDetailedProfile(walletAddress),
        ]);

        console.log("✅ Profile Data:", profileData);
        console.log("✅ Detailed Profile:", detailedProfile);

        setUserProfile({
          username: profileData.data.username,
          stats: {
            totalGiftCardsCreated: profileData.data.stats.totalGiftCardsCreated,
            totalGiftCardsSent: profileData.data.stats.totalGiftCardsSent,
            totalGiftCardsReceived: profileData.data.stats.totalGiftCardsReceived,
            totalBackgroundsMinted: profileData.data.stats.totalBackgroundsMinted,
          },
        });

        const mapCard = (card: GiftCard, status: "Sent" | "Received") => ({
          id: card.id,
          imageUrl: getImageUrl(card.Background?.imageURI || card.backgroundUrl),
          senderName: `${card.creatorAddress?.slice(0, 6)}...${card.creatorAddress?.slice(-4)}`,
          recipientName: `${card.currentOwner?.slice(0, 6)}...${card.currentOwner?.slice(-4)}`,
          message: card.message || "",
          amount: `${card.price} USDC`,
          date: card.createdAt ? new Date(card.createdAt).toISOString().split("T")[0] : "",
          status,
        });

        const mappedReceivedCards = detailedProfile.profile.receivedCards.map((card: GiftCard) =>
          mapCard(card, "Received")
        );
        const mappedSentCards = detailedProfile.profile.sentCards.map((card: GiftCard) =>
          mapCard(card, "Sent")
        );

        console.log("🎁 Mapped Received Cards:", mappedReceivedCards);
        console.log("📤 Mapped Sent Cards:", mappedSentCards);

        setSentGifts(mappedSentCards);
        setReceivedGifts(mappedReceivedCards);
      } catch (error) {
        console.error("❌ Error fetching profile data:", error);
        setError(error instanceof Error ? error.message : "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }
}, [walletAddress]);

// const showEmptyState =
//   !walletAddress || (sentGifts.length === 0 && receivedGifts.length === 0);

  // if (showEmptyState) return <Navigate to="/gallerynewuser" replace />; 
  
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

  const GiftCardItem = ({ gift }: GiftCardItemProps) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden mb-4"
    >
      {/* Top Info Row */}
      <div className="flex items-center gap-3 p-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0" />
        <div>
          <h3 className="font-medium">
            {gift.status === "Sent"
              ? `To: ${gift.recipientName}`
              : `From: ${gift.senderName}`}
          </h3>
          <p className="text-sm text-gray-500">{gift.date}</p>
          {gift.message && (
            <div className="text-sm text-gray-400 mt-1 italic">
              "{gift.message}"
            </div>
          )}
        </div>
      </div>
  
      {/* Image Preview */}
      <div className="aspect-w-16 aspect-h-9 bg-gray-100">
        {gift.imageUrl ? (
          <img
            src={gift.imageUrl}
            alt="Gift"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-200">
            <GiftIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
  
      {/* Bottom Actions */}
      <div className="p-4 flex items-center justify-between">
        <button className="flex items-center gap-2 text-gray-600">
          <span className="material-icons">favorite_border</span>
          <span>74</span>
        </button>
        <button className="px-4 py-2 bg-[#00B2C7] text-white rounded-lg hover:bg-[#00a1b3] text-sm">
          Generate Meep
        </button>
      </div>
    </motion.div>
  );
  
  

  return (
    <div className="min-h-screen bg-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 sticky top-0 h-screen overflow-y-auto">
        <div className="p-4 pb-0">
          <img src={evrlinklogo} alt="Evrlink" className="h-12 mb-4" />
        </div>
        <nav className="p-4 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <span className="material-icons">home</span>
            <span>Home</span>
          </Link>
          <Link
            to="/gallery"
            className="flex items-center gap-3 px-4 py-2 text-gray-900 bg-blue-50 rounded-lg"
          >
            <span className="material-icons">collections</span>
            <span>My Gallery</span>
          </Link>
          <Link
            to="/marketplace"
            className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <span className="material-icons">grid_view</span>
            <span>Templates</span>
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <span className="material-icons">settings</span>
            <span>Settings</span>
          </Link>
          <Link
            to="/faqs"
            className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <span className="material-icons">help</span>
            <span>FAQs</span>
          </Link>
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <button className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg w-full">
            <span className="material-icons">logout</span>
            <span>LogOut</span>
          </button>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 w-full max-w-full overflow-x-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 fixed top-0 w-full lg:w-[calc(100%-16rem)] z-10">
          <div className="px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <span className="material-icons">{isSidebarOpen ? 'close' : 'menu'}</span>
              </button>
              {/* Logo - Mobile Only */}
              <img src={evrlinklogo} alt="Evrlink" className="h-8 lg:hidden" />
            </div>
            <div className="hidden lg:block relative mb-8 mt-6 w-full max-w-2xl">
            <span className="absolute inset-y-0 left-3 flex items-center">
              <span className="material-icons text-gray-400">search</span>
            </span>
            <input
              type="text"
              placeholder="Search for a meep or template..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B2C7]"
            />
          </div>
          {/* Mobile Search - Hidden on Desktop */}
          <div className="lg:hidden relative mb-6">
              <span className="absolute inset-y-0 left-3 flex items-center">
                <span className="material-icons text-gray-400">search</span>
              </span>
              <input
                type="text"
                placeholder="Search for a meep or template..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B2C7]"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  className="p-2 hover:bg-gray-100 rounded-full relative"
                  onClick={toggleWalletAddressDisplay}
                  title={abbreviateAddress(walletAddress)}
                >
                  <img src={wallet} alt="wallet" className="w-6 h-6" />
                </button>
                
                {showWalletAddress && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">Your Wallet</div>
                    <div className="text-xs bg-gray-50 p-2 rounded break-all font-mono">
                      {walletAddress || 'No wallet connected'}
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button 
                        className="text-xs text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          navigator.clipboard.writeText(walletAddress);
                          // Could add toast notification here
                        }}
                      >
                        Copy Address
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <img src={bell} alt="bell" className="w-6 h-6" />
              </button>
              
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center relative group">
                <img src="/avatar.jpg" alt="Profile" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-300">
                  <span className="text-white opacity-0 group-hover:opacity-100 text-xs">
                    {abbreviateAddress(walletAddress)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar */}
        <aside 
          className={`fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 p-4 z-30 transition-transform duration-300 lg:hidden ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="space-y-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="material-icons">home</span>
              <span>Home</span>
            </Link>
            <Link
              to="/gallery"
              className="flex items-center gap-3 px-4 py-2 text-gray-900 bg-blue-50 rounded-lg"
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="material-icons">collections</span>
              <span>My Gallery</span>
            </Link>
            <Link
              to="/templates"
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="material-icons">grid_view</span>
              <span>Templates</span>
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="material-icons">settings</span>
              <span>Settings</span>
            </Link>
            <Link
              to="/faqs"
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="material-icons">help</span>
              <span>FAQs</span>
            </Link>
          </nav>
          <div className="absolute bottom-4 left-4 right-4">
            <button
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg w-full"
              onClick={handleLogout}
            >
              <span className="material-icons">logout</span>
              <span>LogOut</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="pt-16 px-4 lg:px-8 bg-white">
         
            {/* Gallery Header Section */}
            <Tabs defaultValue="received" className="w-full">
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8 mb-8">
    <h1 className="text-2xl font-bold">My Gallery</h1>

    <div className="flex items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
  {/* Tab Buttons */}
  <TabsList className="flex bg-gray-100 rounded-lg overflow-hidden border border-gray-200 p-0">
    <TabsTrigger
      value="sent"
      className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-l-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-400"
    >
      Created by Me
    </TabsTrigger>
    <TabsTrigger
      value="received"
      className="px-4 py-2 text-sm font-medium border border-l-0 border-gray-200 rounded-r-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-400"
    >
      Gifted to Me
    </TabsTrigger>
  </TabsList>

  {/* Create Meep Button */}
  <Link to="/marketplace" className="px-5 py-2 rounded-lg bg-[#00B2C7] text-white flex items-center gap-2 font-medium text-sm shadow hover:bg-[#009bb0] transition-colors">
    <span className="material-icons text-base">add</span>
    Create Meep
  </Link>
</div>
</div>
          {/* Templates Card - Mobile Style */}
          <div className="block lg:hidden w-full">
  <TabsContent value="sent" className="m-0">
    <AnimatePresence>
      <div className="flex flex-col gap-4">
        {sentGifts.map((gift) => (
          <GiftCardItem key={gift.id} gift={gift} />
        ))}
      </div>
    </AnimatePresence>
  </TabsContent>

  <TabsContent value="received" className="m-0">
    <AnimatePresence>
      <div className="flex flex-col gap-4">
        {receivedGifts.map((gift) => (
          <GiftCardItem key={gift.id} gift={gift} />
        ))}
      </div>
    </AnimatePresence>
  </TabsContent>
</div>

          {/* Templates Grid - Desktop Style */}
          <div className="hidden lg:block w-full">
  <TabsContent value="sent" className="m-0">
    <AnimatePresence>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sentGifts.map((gift) => (
          <GiftCardItem key={gift.id} gift={gift} />
        ))}
      </div>
    </AnimatePresence>
  </TabsContent>

  <TabsContent value="received" className="m-0">
    <AnimatePresence>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {receivedGifts.map((gift) => (
          <GiftCardItem key={gift.id} gift={gift} />
        ))}
      </div>
    </AnimatePresence>
  </TabsContent>
</div>
</Tabs>

        </main>
      </div>
    </div>
  );
};

export default MyGallery; 
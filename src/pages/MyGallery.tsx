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
import toast from "react-hot-toast";
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
  senderAddress: string;
  recipientAddress: string;
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
          senderAddress: card.creatorAddress || "",
          recipientAddress: card.currentOwner || "",
          senderName: card.creatorAddress || "",
          recipientName: card.currentOwner || "",
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
      className="bg-white rounded-xl shadow-sm overflow-hidden mb-4 max-w-full w-full min-w-[460px]"
    >
      {/* Top Info Row */}
      <div className="flex items-start gap-3 p-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0" />
        <div className="w-full overflow-hidden">
          <div className="flex flex-col">
            <div className="font-medium mb-1">
              {gift.status === "Sent" ? "To:" : "From:"}
            </div>
            <div className="flex items-center gap-2 w-full">
              <div className="font-normal text-sm break-all pr-2">
                {gift.status === "Sent" ? gift.recipientAddress : gift.senderAddress}
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const address = gift.status === "Sent" ? gift.recipientAddress : gift.senderAddress;
                  navigator.clipboard.writeText(address);
                  toast.success('Address copied to clipboard!');
                }}
                className="ml-auto flex-shrink-0 text-[#00B2C7] hover:text-[#008fa0]"
              >
                <span className="material-icons text-sm">content_copy</span>
              </button>
            </div>
          </div>
          <p className="text-sm text-black">{gift.date}</p>
          {gift.message && (
            <div className="text-lg font-bold text-[#00B2C7] mt-2 text-center py-1">
              {gift.message}
            </div>
          )}
        </div>
      </div>
  
      {/* Image Preview */}
      <div className="aspect-w-16 aspect-h-9 bg-gray-100 w-full">
        {gift.imageUrl ? (
          <img
            src={gift.imageUrl}
            alt="Gift"
            className="w-full h-full object-contain"
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
          Share Meep
        </button>
      </div>
    </motion.div>
  );
  
  

  return (
    <div>
      {/* Wallet Address Display popup */}
      {showWalletAddress && (
        <div className="fixed right-4 top-20 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3">
          <div className="text-sm font-medium text-gray-700 mb-1">Your Wallet</div>
          <div className="text-xs bg-gray-50 p-2 rounded break-all font-mono">
            {walletAddress || 'No wallet connected'}
          </div>
          <div className="mt-2 flex justify-end">
            <button 
              className="text-xs text-blue-600 hover:text-blue-800"
              onClick={() => {
                navigator.clipboard.writeText(walletAddress);
                toast.success('Address copied to clipboard!');
              }}
            >
              Copy Address
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full">
         
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
  <Link to="/l/marketplace" className="px-5 py-2 rounded-lg bg-[#00B2C7] text-white flex items-center gap-2 font-medium text-sm shadow hover:bg-[#009bb0] transition-colors">
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

      </div>
    </div>
  );
};

export default MyGallery; 
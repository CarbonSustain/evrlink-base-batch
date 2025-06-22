import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Gift, Wallet, Search, Menu } from 'lucide-react';
import Navbar from './Navbar';
import WalletConnectDialog from './WalletConnectDialog';
import AccountMenu from './AccountMenu';
import Button from './Button';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from 'react-hot-toast';
import bell from '../../public/images/Bell.png';
import evrlinklogo from '../../public/images/g-Logo.png';

const Layout = () => {
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const { address, connect } = useWallet();
  const [connecting, setConnecting] = useState(false);
  // Sidebar is now always visible, so we don't need this state anymore
  // const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleOpenWalletDialog = () => {
    setWalletDialogOpen(true);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/l/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleConnect = async (newAddress: string) => {
    try {
      setConnecting(true);
      await connect(newAddress);
      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  // No longer need sidebar toggle functionality
  // const toggleSidebar = () => {
  //   setIsSidebarOpen(!isSidebarOpen);
  // };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b py-3 px-6 fixed left-[240px] right-0 z-30 shadow-sm">
        <div className="flex items-center justify-between h-10">
          <div className="flex-grow max-w-lg">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search for a meep or template..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-md bg-gray-50 border-0 focus:outline-none focus:ring-1 focus:ring-[#00b2c7]"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <button type="submit" className="hidden">Search</button>
            </form>
          </div>

          <div className="flex items-center gap-4">
            {!address ? (
              <div>
                {connecting ? (
                  <button
                    className="px-4 py-2 rounded-full bg-[#00b2c7] text-white font-medium flex items-center justify-center"
                    disabled
                  >
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </button>
                ) : (
                  <button
                    onClick={handleOpenWalletDialog}
                    className="px-4 py-2 rounded-full bg-[#00b2c7] text-white font-medium hover:bg-opacity-90 transition"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            ) : (
              <AccountMenu address={address} />
            )}

            <button
              onClick={() => setMobileSearchOpen(!isMobileSearchOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-gray-600" />
            </button>

            <button className="p-2 rounded-md hover:bg-gray-100">
              <img src={bell} alt="bell" className="w-6 h-6" />
            </button>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
              <img
                src="/avatar.jpg"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search */}
      {isMobileSearchOpen && (
        <div className="fixed top-16 left-0 right-0 bg-white p-4 z-20 border-b lg:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  setMobileSearchOpen(false);
                  navigate(`/l/search?query=${encodeURIComponent(searchQuery)}`);
                }
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00b2c7] focus:border-transparent"
              autoFocus
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1">
        <Navbar />
        <main className="flex-1 ml-[240px] pt-16">
          <div className="content-container p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Wallet Dialog */}
      <WalletConnectDialog
        open={walletDialogOpen}
        onOpenChange={setWalletDialogOpen}
        onConnect={handleConnect}
      />
    </div>
  );
};

export default Layout;

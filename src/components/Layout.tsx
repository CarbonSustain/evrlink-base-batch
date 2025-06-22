import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Gift, Wallet, Search } from 'lucide-react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleOpenWalletDialog = () => {
    setWalletDialogOpen(true);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
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

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 w-full z-50">
        <div className="px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 transition-opacity hover:opacity-80"
          >
            <div className="flex items-center justify-center">
              <img src="/evrlink_logo.svg" alt="Evrlink Logo" className="h-14 w-14"/>
            </div>
            <span className="text-3xl font-display font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary self-center -mt-3">evrlink</span>
          </Link>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-[#00b2c7]" />
              </div>
              <input 
                type="text" 
                className="bg-white border border-[#00b2c7] text-gray-900 text-sm rounded-full focus:ring-1 focus:ring-[#00b2c7] focus:outline-none block w-full pl-10 p-2" 
                placeholder="Search for a meep or template..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Wallet & Sign In */}
          <div className="flex items-center gap-4">
            {/* Sign In */}
            <Link to="/sign-in">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-[#00b2c7] bg-transparent text-[#00b2c7] hover:bg-[#e6f7f9]"
              >
                Sign In
              </Button>
            </Link>

            {/* Wallet Logic */}
            {address ? (
              <AccountMenu address={address} />
            ) : (
              <Button
                onClick={handleOpenWalletDialog}
                disabled={connecting}
                className="flex items-center gap-2"
              >
                {connecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    Connect Wallet
                  </>
                )}
              </Button>
            )}

            {/* Bell */}
            <button className="p-2 hover:bg-gray-100 rounded-full">
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

        {/* Mobile Search */}
        <div className="px-4 py-2 block lg:hidden">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center">
              <Search className="h-4 w-4 text-[#00b2c7]" />
            </span>
            <input
              type="text"
              placeholder="Search for a meep or template..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#00b2c7] rounded-full focus:ring-1 focus:ring-[#00b2c7] focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className="flex flex-1 pt-20">
        <Navbar />
        <main className="flex-1">
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

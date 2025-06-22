import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Gift, Wallet } from 'lucide-react';
import Navbar from './Navbar';
import WalletConnectDialog from './WalletConnectDialog';
import AccountMenu from './AccountMenu';
import Button from './Button';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from 'react-hot-toast';
import evrlinklogo from '../../public/images/g-Logo.png';
import bell from '../../public/images/Bell.png';
import walletImg from '../../public/images/Frame 14.png';

const Layout = () => {
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const { address, connect } = useWallet();
  const [connecting, setConnecting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleOpenWalletDialog = () => {
    setWalletDialogOpen(true);
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
          <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="p-4 pb-0">
            <img src={evrlinklogo} alt="Evrlink" className="h-12 mb-4" />
          </div>
          </Link>

          {/* Search - desktop */}
          <div className="hidden lg:block relative w-full max-w-2xl mx-8">
            <span className="absolute inset-y-0 left-3 flex items-center">
              <span className="material-icons text-gray-400">search</span>
            </span>
            <input
              type="text"
              placeholder="Search for a meep or template..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B2C7]"
            />
          </div>

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

            {/* Wallet Logic (unchanged, just icon replaced) */}
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
                    <img src={walletImg} alt="wallet" className="w-4 h-4" />
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
              <span className="material-icons text-gray-400">search</span>
            </span>
            <input
              type="text"
              placeholder="Search for a meep or template..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B2C7]"
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

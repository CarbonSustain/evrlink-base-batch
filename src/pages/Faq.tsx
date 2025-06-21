import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import evrlinklogo from '../../public/images/g-Logo.png';
import bell from '../../public/images/Bell.png';
import wallet from '../../public/images/Frame 14.png';
import { useWallet } from '@/contexts/WalletContext';

const Faq = () => {
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
            className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <span className="material-icons">collections</span>
            <span>My Gallery</span>
          </Link>
          <Link
            to="/templates"
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
            className="flex items-center gap-3 px-4 py-2 text-gray-900 bg-blue-50 rounded-lg"
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
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
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
              className="flex items-center gap-3 px-4 py-2 text-gray-900 bg-blue-50 rounded-lg"
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
        <main className="pt-16 px-4 lg:px-8 bg-[#fafbfc] min-h-[90vh]">
          <div className="content-container py-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 md:p-12 max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-display font-semibold mb-2 text-gray-900 mt-6 text-left">FAQs (Frequently Asked Questions)</h2>
              <p className="text-gray-500 mb-8 text-left">We're here to help answer any questions you might have.</p>
              <div className="space-y-4">
                <FAQItem question="What is this app for?">
                  This app lets you create and personalize digital greeting cards and send them to friends and loved ones — all onchain! Think of it as mixing creativity, crypto, and heartfelt messages.
                </FAQItem>
                <FAQItem question="How do I pay for a Meep?">
                  You can pay for a Meep using your connected wallet. Supported payment methods include ETH and other tokens on Base.
                </FAQItem>
                <FAQItem question="What is a Base Smart Wallet?">
                  A Base Smart Wallet is a secure, onchain wallet that allows you to send, receive, and manage your Meeps and other digital assets easily.
                </FAQItem>
                <FAQItem question="What is a Base name?">
                  A Base name is your unique onchain identity, making it easy for friends to find and send you Meeps.
                </FAQItem>
                <FAQItem question="What are key features of Basenames?">
                  Basenames offer unique, memorable identities, easy wallet management, and enhanced security for your onchain activities.
                </FAQItem>
                <FAQItem question="How do Basenames work?">
                  Basenames are registered onchain and linked to your wallet, allowing seamless interaction with Meeps and other features.
                </FAQItem>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

function FAQItem({ question, children }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className={`bg-[#f9fafb] rounded-xl ${open ? 'shadow-md' : ''} transition-all`}>
      <button
        className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="font-medium text-gray-900 text-lg">{question}</span>
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <svg width="28" height="28" fill="none" stroke="#00B2C7" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
        </span>
      </button>
      {open && (
        <div className="px-6 pb-4 text-gray-600 text-base animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

export default Faq; 
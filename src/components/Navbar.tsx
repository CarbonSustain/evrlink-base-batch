import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import evrlinklogo from '/public/images/g-Logo.png';
import { Menu, X, Home, Settings, HelpCircle as QuestionCircle, LayoutGrid, Image, LogOut, Gift, ImagePlus } from 'lucide-react';
import { useArtNftsStore } from '@/services/store';
import { useWallet } from '@/contexts/WalletContext';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { disconnect } = useWallet();

  // Reset sidebar state when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    // First disconnect the wallet using the context function
    disconnect();
    
    // Determine if we're in production or development
    const isProd = window.location.hostname !== 'localhost' && 
                  !window.location.hostname.includes('127.0.0.1');
    
    // Redirect to production URL or localhost based on environment
    window.location.href = isProd ? 'https://evrlink.com/' : 'http://localhost:8001/';
  };

  // Ensure toggle button stays hidden when navbar is open
  useEffect(() => {
    const toggleButton = document.getElementById('navbar-toggle-button');
    if (toggleButton) {
      if (isSidebarOpen) {
        toggleButton.style.display = 'none';
      } else {
        toggleButton.style.display = 'flex';
      }
    }
  }, [isSidebarOpen]);

  const menuItems = [
    { to: '/dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { to: '/gallery', label: 'My Gallery', icon: <Image className="w-5 h-5" /> },
    { to: '/l/marketplace', label: 'Templates', icon: <LayoutGrid className="w-5 h-5" /> },
    { to: '/l/create-background', label: 'Create Background', icon: <ImagePlus className="w-5 h-5" /> },
    { to: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    { to: '/faqs', label: 'FAQs', icon: <QuestionCircle className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* No menu toggle button */}

      {/* Single sidebar for all screen sizes */}
      <div className="min-h-screen bg-white border-r border-gray-200 w-[240px] fixed top-0 left-0 bottom-0 z-10 shadow-sm">
        <aside className="w-full flex flex-col h-full justify-between">
          {/* Logo */}
          <div className="pl-4 pr-6 pt-6 pb-8">
            <Link to="/" className="flex justify-start items-center">
              <div className="flex items-center">
                <img src="/evrlink_logo.svg" alt="Evrlink" className="h-14 mr-1.5" style={{marginTop: '-2px'}} />
                <span className="text-[#00b2c7] text-xl font-medium">evrlink</span>
              </div>
            </Link>
          </div>
          
          <div className="flex flex-col flex-grow">
            {/* Navigation Menu */}
            <nav>
              <ul className="flex flex-col gap-2 px-3 py-4">
                {menuItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.to);
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={cn(
                          "flex items-center px-4 py-2.5 rounded-md transition-all",
                          isActive
                            ? "text-[#00b2c7] bg-[#e6f7f9] border-l-4 border-[#00b2c7] pl-3"
                            : "text-gray-600 hover:text-[#00b2c7] hover:bg-gray-50"
                        )}
                      >
                        <span className={cn("mr-4 opacity-80")}>{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
          
          {/* Logout at bottom */}
          <div className="p-3 pb-6">
            <button 
              onClick={handleLogout}
              className="flex items-center px-4 py-2.5 text-gray-600 hover:text-[#00b2c7] hover:bg-gray-50 rounded-md w-full transition-all"
            >
              <LogOut className="w-5 h-5 mr-4 opacity-80" />
              <span className="font-medium">LogOut</span>
            </button>
          </div>
        </aside>
      </div>
    </>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavLink = ({ to, active, children, onClick }: NavLinkProps) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
      setTimeout(() => {
        navigate(to);
      }, 10);
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={cn(
        'relative px-4 py-2.5 transition-colors rounded-lg flex items-center',
        active ? 'text-[#00b2c7] bg-[#e6f7f9] font-medium' : 'text-gray-600 hover:text-black hover:bg-gray-100'
      )}
    >
      {children}
      {active && (
        <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#00b2c7] rounded-r" />
      )}
    </Link>
  );
};

export default Navbar;

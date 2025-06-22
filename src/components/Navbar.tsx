import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import evrlinklogo from '/public/images/g-Logo.png';
import bell from '/public/images/Bell.png';
import wallet from '/public/images/Frame 14.png';
import { useWallet } from '@/contexts/WalletContext';
import { useArtNftsStore } from '@/services/store';
import { API_BASE_URL } from '@/services/api';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Reset sidebar state when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
    { to: '/dashboard', label: 'Home', icon: 'home' },
    { to: '/gallery', label: 'My Gallery', icon: 'collections' },
    { to: '/l/marketplace', label: 'Templates', icon: 'grid_view' },
    { to: '/settings', label: 'Settings', icon: 'settings' },
    { to: '/faqs', label: 'FAQs', icon: 'help' },
  ];

  return (
    <>
      {/* Menu Toggle Button - only shown when navbar is closed on mobile */}
      <button
        id="navbar-toggle-button"
        onClick={toggleSidebar}
        className={cn(
          "fixed z-50 p-2 rounded-lg bg-white border border-gray-200 transition-all duration-300 left-4 top-20 lg:hidden",
          isSidebarOpen && "opacity-0 pointer-events-none hidden"
        )}
      >
        <Menu className="h-6 w-6 text-black" />
      </button>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed inset-0 bg-white w-64 z-40 transform transition-transform duration-300 ease-in-out',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:hidden'
        )}
      >
        <div className="p-4 pb-0">
          <img src={evrlinklogo} alt="Evrlink" className="h-12 mb-4" />
          <button
            onClick={toggleSidebar}
            className="absolute top-2 right-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              active={item.to === '/marketplace' 
                ? location.pathname.startsWith("/marketplace") 
                : location.pathname === item.to}
              onClick={toggleSidebar}
            >
              <span className="material-icons">{item.icon}</span>
              <span className="ml-3">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <button className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg w-full">
            <span className="material-icons">logout</span>
            <span>LogOut</span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex min-h-screen bg-white border-r w-64 fixed top-0 left-0 pt-16">
        <aside className="w-full p-4 pt-6">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <NavLink 
                key={item.to} 
                to={item.to} 
                active={item.to === '/marketplace' 
                  ? location.pathname.startsWith("/marketplace") 
                  : location.pathname === item.to}
              >
                <span className="material-icons">{item.icon}</span>
                <span className="ml-3">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="absolute bottom-4 left-4 right-4">
            <button className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg w-full">
              <span className="material-icons">logout</span>
              <span>LogOut</span>
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
        'relative px-4 py-2 transition-colors rounded-lg flex items-center',
        active ? 'text-black bg-[#e6f7f9]' : 'text-gray-600 hover:text-black hover:bg-gray-100'
      )}
    >
      {children}
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-secondary" />
      )}
    </Link>
  );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Check if the menu is open when component mounts and when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  // Ensure toggle button stays hidden when navbar is open
  useEffect(() => {
    const toggleButton = document.getElementById('navbar-toggle-button');
    if (toggleButton) {
      if (isOpen) {
        toggleButton.style.display = 'none';
      } else {
        toggleButton.style.display = 'flex';
      }
    }
  }, [isOpen]);

  return (
    <>
      {/* Menu Toggle Button - only shown when navbar is closed */}
      <button
        id="navbar-toggle-button"
        onClick={toggleMenu}
        className={cn(
          "fixed z-50 p-2 rounded-lg bg-white border border-gray-200 transition-all duration-300 left-4 top-20",
          isOpen && "opacity-0 pointer-events-none hidden"
        )}
      >
        <Menu className="h-6 w-6 text-black" />
      </button>

      {/* Navbar */}
      <nav className={cn(
        "fixed left-0 top-16 bottom-0 w-52 z-40 backdrop-blur-sm border-r border-gray-200 flex flex-col bg-white transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        scrolled && "bg-white"
      )}>
        <div className="py-6 px-4 flex flex-col h-full relative">
          {/* Close Button (X) */}
          <button
            onClick={toggleMenu}
            className="absolute top-2 right-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
          
          {/* Main Menu */}
          <div className="flex flex-col space-y-2 flex-1 pt-8">
            <NavLink to="/dashboard" active={location.pathname === "/dashboard"} onClick={() => setIsOpen(false)}>
              Dashboard
            </NavLink>
            <NavLink to="/gallery" active={location.pathname.startsWith("/gallery")} onClick={() => setIsOpen(false)}>
              My Gallery
            </NavLink>
            <NavLink to="/marketplace" active={location.pathname.startsWith("/marketplace")} onClick={() => setIsOpen(false)}>
              Templates
            </NavLink>
            <NavLink to="/settings" active={location.pathname === "/settings"} onClick={() => setIsOpen(false)}>
              Settings
            </NavLink>
            <NavLink to="/faqs" active={location.pathname === "/faqs"} onClick={() => setIsOpen(false)}>
              FAQs
            </NavLink>
            {/* <NavLink to="/create-background" active={location.pathname === "/create-background"} onClick={() => setIsOpen(false)}>
              Create Background
            </NavLink> */}
          </div>
        </div>
      </nav>
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
  
  // Create a handler that prevents default behavior and stops propagation
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      // Call the onClick handler first
      onClick();
      // Then navigate programmatically after a slight delay
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
        "relative px-4 py-2 transition-colors rounded-lg flex items-center",
        active 
          ? "text-black bg-[#e6f7f9]" 
          : "text-gray-600 hover:text-black hover:bg-gray-100"
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

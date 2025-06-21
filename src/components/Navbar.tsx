import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Menu Toggle Button */}
      <button
        onClick={toggleMenu}
        className={cn(
          "fixed z-50 p-2 rounded-lg bg-[#fafafa] border border-gray-200 transition-all duration-300",
          isOpen 
            ? "left-[248px] top-20" 
            : "left-4 top-20",
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-black" />
        ) : (
          <Menu className="h-6 w-6 text-black" />
        )}
      </button>

      {/* Navbar */}
      <nav className={cn(
        "fixed left-0 top-16 bottom-0 w-64 z-40 backdrop-blur-sm border-r border-gray-200 flex flex-col bg-[#fafafa] transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        scrolled && "bg-[#fafafa]"
      )}>
        <div className="py-6 px-4 flex flex-col h-full">
          {/* Main Menu */}
          <div className="flex flex-col space-y-2 flex-1 pt-8">
            <NavLink to="/" active={location.pathname === "/"} onClick={() => setIsOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/marketplace" active={location.pathname.startsWith("/marketplace")} onClick={() => setIsOpen(false)}>
              Templates
            </NavLink>
            <NavLink to="/about" active={location.pathname === "/about"} onClick={() => setIsOpen(false)}>
              About Us
            </NavLink>
            <NavLink to="/create" active={location.pathname === "/create"} onClick={() => setIsOpen(false)}>
              Create Meep
            </NavLink>
            <NavLink to="/claim" active={location.pathname === "/claim"} onClick={() => setIsOpen(false)}>
              Claim Meep
            </NavLink>
            <NavLink to="/create-background" active={location.pathname === "/create-background"} onClick={() => setIsOpen(false)}>
              Create Background
            </NavLink>
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

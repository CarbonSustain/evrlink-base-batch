import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`bg-[#1D1554] py-16 px-4 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12">
          <div className="mb-8 md:mb-0">
            <img 
              src="/images/img_full_logo_white_2_2.png" 
              alt="Overlink Logo" 
              className="h-12 w-auto"
            />
          </div>
          
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
            <Link 
              to="/terms" 
              className="text-gray-300 hover:text-white text-lg transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              to="/privacy" 
              className="text-gray-300 hover:text-white text-lg transition-colors"
            >
              Privacy Policy
            </Link>
            
            <div className="flex items-center space-x-4">
              <a 
                href="#" 
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Social Media"
              >
                <img 
                  src="/images/img_group_1662.png" 
                  alt="Social Media" 
                  className="w-8 h-8"
                />
              </a>
              <a 
                href="#" 
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Social Media"
              >
                <img 
                  src="/images/img_group_1663.svg" 
                  alt="Social Media" 
                  className="w-8 h-8"
                />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left">
            <p className="text-gray-300 mb-4 md:mb-0">
              © 2025 Evrlink. All rights reserved.
            </p>
            <p className="text-gray-300">
              <span>Powered by </span>
              <a
                href="https://base.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline hover:text-cyan-400 transition-colors"
              >
                Base
              </a>
              <span>, an Ethereum Layer 2 solution.</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
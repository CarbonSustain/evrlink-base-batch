import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const handleSignIn = () => {
    console.log('Sign in clicked');
  };

  const handleCreateMeep = () => {
    console.log('Create Meep clicked');
  };

  return (
    <header className={`bg-cyan-100 py-6 px-4 ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/">
            <img 
              src="/images/img_full_logo_teal_2_1.png" 
              alt="Overlink Logo" 
              className="h-9 w-auto"
            />
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">


          <Link to="/sign-in">
            <Button
              variant="outline"
              className="border-gray-600 text-gray-600 hover:bg-gray-50"
            >
              Sign in
            </Button>
          </Link>

          <Link to="/l/marketplace">
          <Button
            variant="primary"
            onClick={handleCreateMeep}
            className="bg-cyan-500 text-white hover:bg-cyan-600 flex items-center space-x-2"
          >
            <span>Create Meep</span>
            <img 
              src="/images/img_systemuiconscreate.svg" 
              alt="Create icon" 
              className="w-5 h-5"
            />
          </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
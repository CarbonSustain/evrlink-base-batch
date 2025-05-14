import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import square from '../../public/images/Group1678.png';
import whitelogo from '../../public/images/white-evrlink-logo.png';
import evrlinklogo from '../../public/images/g-Logo.png';
import { connectCoinbaseWallet, createCoinbaseWallet } from '@/lib/wallet';
import { toast } from 'react-hot-toast';
import { loginWithWallet, loginWithEmail, associateEmailWithWallet, getWalletByEmail } from '@/services/api';
import { useWallet } from '@/contexts/WalletContext';
import WalletConnectDialog from '@/components/WalletConnectDialog';

const SignIn = () => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const navigate = useNavigate();
  const { connect, isConnected } = useWallet();
  const [processingStep, setProcessingStep] = useState<string>('');

  // If already connected, redirect to dashboard
  useEffect(() => {
    if (isConnected) {
      navigate('/dashboard');
    }
  }, [isConnected, navigate]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setConnecting(true);

    try {
      // Validate email
      if (!email) {
        setEmailError('Email is required');
        setConnecting(false);
        return;
      }

      if (!validateEmail(email)) {
        setEmailError('Please enter a valid email address');
        setConnecting(false);
        return;
      }

      // Try to login with email
      setProcessingStep('Checking for existing account...');
      
      try {
        const authResponse = await loginWithEmail(email);
        
        if (authResponse) {
          // Email has an associated wallet, login successful
          setProcessingStep('Connecting to existing wallet...');
          toast.success('Logged in with existing account');
          localStorage.setItem('token', authResponse.token);
          localStorage.setItem('walletAddress', authResponse.user.walletAddress);
          localStorage.setItem('userEmail', email);
          
          // Connect through WalletContext
          await connect(authResponse.user.walletAddress);
          navigate('/dashboard');
          return;
        }
      } catch (loginError: any) {
        console.error('Login with email failed:', loginError);
        toast.error('Login failed: ' + (loginError.message || 'Unknown error'));
        setConnecting(false);
        return;
      }
      
      // No existing wallet for this email, create one
      setProcessingStep('Creating a new wallet...');
      toast.success('Creating a new wallet for this email account...');
      
      let address;
      try {
        // Create a new Coinbase wallet
        address = await createCoinbaseWallet();
        if (!address) {
          throw new Error('Failed to create wallet');
        }
      } catch (walletError: any) {
        console.error('Error creating wallet:', walletError);
        toast.error('Failed to create wallet: ' + (walletError.message || 'Unknown error'));
        setConnecting(false);
        return;
      }
      
      // Associate email with the new wallet address
      setProcessingStep('Associating email with wallet...');
      try {
        console.log('Attempting to associate email with wallet:', { email, address });
        await associateEmailWithWallet(email, address);
        toast.success('Wallet created and associated with your email');
      } catch (associateError: any) {
        console.error('Error associating email with wallet:', associateError);
        toast.error('Failed to associate email with wallet: ' + (associateError.message || 'Unknown error'));
        // Continue anyway, try to authenticate
      }
      
      // Login with the new wallet
      setProcessingStep('Authenticating...');
      try {
        const newAuthResponse = await loginWithWallet(address, `mock_signature_for_${address}`);
        
        if (!newAuthResponse || !newAuthResponse.token) {
          throw new Error('Failed to authenticate with new wallet');
        }
        
        // Store authentication data
        localStorage.setItem('token', newAuthResponse.token);
        localStorage.setItem('walletAddress', address);
        localStorage.setItem('userEmail', email);
        
        // Connect through WalletContext
        await connect(address);
        
        toast.success('Successfully created and authenticated your account!');
        navigate('/dashboard');
      } catch (authError: any) {
        console.error('Authentication error:', authError);
        toast.error('Authentication failed: ' + (authError.message || 'Unknown error'));
        setConnecting(false);
      }
    } catch (error: any) {
      console.error('Email login error:', error);
      toast.error('Login process failed: ' + (error.message || 'Unknown error'));
      setEmailError('Failed to process email. Please try again or use wallet options.');
    } finally {
      setConnecting(false);
      setProcessingStep('');
    }
  };

  // Check if an email has an associated wallet
  const checkWalletForEmail = async (email: string): Promise<boolean> => {
    try {
      const walletAddress = await getWalletByEmail(email);
      return !!walletAddress;
    } catch (error) {
      console.error('Error checking wallet for email:', error);
      return false;
    }
  };

  const handleWalletConnection = async (address: string) => {
    try {
      // Use the connect method from WalletContext
      await connect(address);
      console.log('Wallet connected through WalletContext');
      
      // Navigate to dashboard after successful connection
      navigate('/dashboard');
      return true;
    } catch (error: any) {
      console.error('Wallet context connection error:', error);
      toast.error('Connection error: ' + (error.message || 'Unknown error'));
      return false;
    }
  };

  const handleConnectCoinbaseWallet = async () => {
    try {
      setConnecting(true);
      // Connect to Coinbase Wallet
      const address = await connectCoinbaseWallet();
      console.log('Connected to Coinbase Wallet with address:', address);
      setWalletAddress(address);
      toast.success('Successfully connected to Coinbase Wallet!');
      
      // Connect through WalletContext (this handles backend authentication)
      await handleWalletConnection(address);
    } catch (error: any) {
      console.error('Error connecting Coinbase Wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  const handleCreateCoinbaseWallet = async () => {
    try {
      setConnecting(true);
      // Create a new Coinbase Wallet
      const address = await createCoinbaseWallet();
      console.log('Created new Coinbase Wallet with address:', address);
      setWalletAddress(address);
      toast.success('Successfully created and connected to Coinbase Wallet!');
      
      // Connect through WalletContext (this handles backend authentication)
      await handleWalletConnection(address);
    } catch (error: any) {
      console.error('Error creating Coinbase Wallet:', error);
      toast.error(error.message || 'Failed to create wallet');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Wallet Connect Dialog */}
      <WalletConnectDialog 
        open={showWalletDialog} 
        onOpenChange={setShowWalletDialog}
        onConnect={handleWalletConnection}
      />
      
      {/* Left Section - Illustration */}
      <div className="w-1/2 min-h-screen flex items-center justify-center p-6 bg-white">
        <div className="flex flex-col h-full justify-between p-8 bg-[#00B2C7] w-full rounded-lg">
          <div className="mb-8">
            <img src={whitelogo} alt="Evrlink" className="h-8" />
          </div>

          <div className="flex-grow flex items-center justify-center">
            <img src={square} alt="Evrlink square" className="max-w-full" />
          </div>

          <div className="text-white mt-8">
              <h1 className="text-4xl font-display font-medium mb-4">
            {!showEmailForm ? (
                "Send a Little Magic"
            ):(
              "Build Relationships. Feel Special."
            )}
            </h1>
            <p className="text-lg opacity-90">
              Create beautiful, heartfelt greeting cards in seconds & make
              someone's day, anywhere in the world.
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Login */}
      <div className="w-1/2 flex flex-col items-center justify-center p-12 bg-white">
        {!showEmailForm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Logo */}
            <div className="flex justify-center mb-12">
              <img src={evrlinklogo} alt="Evrlink" className="h-36" />
            </div>

            {/* Login Buttons */}
            <div className="space-y-4">
              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full bg-[#00B2C7] text-white py-4 px-6 rounded-lg text-center font-medium hover:bg-[#5BB6C4] transition-colors"
              >
                Login/Signup with Email
              </button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-600">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              
              <button
                onClick={() => setShowWalletDialog(true)}
                disabled={connecting}
                className="w-full bg-gray-800 text-white py-4 px-6 rounded-lg text-center font-medium hover:bg-gray-700 transition-colors"
              >
                Connect with Wallet
              </button>
              
              <button
                onClick={handleConnectCoinbaseWallet}
                disabled={connecting}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                {connecting ? (
                  <span>Connecting...</span>
                ) : (
                  <span>Connect with Coinbase Wallet</span>
                )}
              </button>
              
              <button
                onClick={handleCreateCoinbaseWallet}
                disabled={connecting}
                className="w-full border border-blue-600 text-blue-600 py-4 px-6 rounded-lg text-center font-medium hover:bg-blue-50 transition-colors"
              >
                {connecting ? (
                  <span>Creating Wallet...</span>
                ) : (
                  <span>Create New Coinbase Wallet</span>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* Help Link */}
            <div className="text-center mb-16 absolute top-8 right-8">
              <span className="text-gray-600">Having any trouble? </span>
              <Link
                to="/help"
                className="text-gray-900 underline underline-offset-2"
              >
                Get Help
              </Link>
            </div>

            <h1 className="text-2xl font-medium text-gray-900 mb-2">
              Login/Signup to Evrlink
            </h1>
            <p className="text-gray-600 mb-8">
              Input your email address below to start creating & receiving
              greeting cards.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(""); // Clear error when user types
                  }}
                  placeholder="Email"
                  className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${
                    emailError ? "border-red-500" : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-[#00B2C7] focus:border-transparent transition-all`}
                  required
                />
                {emailError && (
                  <p className="mt-2 text-sm text-red-500">{emailError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#00B2C7] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#5BB6C4] transition-colors"
                disabled={connecting}
              >
                {connecting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {processingStep || 'Processing...'}
                  </div>
                ) : (
                  'Continue'
                )}
              </button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-600">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowWalletDialog(true)}
                  className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Continue with Wallet
                </button>
                
                <button
                  type="button"
                  onClick={handleConnectCoinbaseWallet}
                  disabled={connecting}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {connecting ? "Connecting..." : "Continue with Coinbase Wallet"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SignIn;
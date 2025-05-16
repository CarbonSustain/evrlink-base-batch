import React, { useState, useEffect } from "react";
import { AgentChat } from "./AgentChat";
import { ChatUI } from "./ChatUI";
import authService from "../../services/auth";

export const AgentButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Generate a consistent user ID for this user
  const [userId] = useState(() => {
    const storageKey = 'evrlink-user-id';
    let storedId = localStorage.getItem(storageKey);
    
    if (!storedId) {
      // Generate a new user ID if none exists
      storedId = `user_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(storageKey, storedId);
    }
    
    return storedId;
  });
  
  // Check authentication status when component mounts or token changes
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      const token = localStorage.getItem('token');
      const walletAddress = localStorage.getItem('walletAddress');
      
      // Default to role 1 if token exists but roleId not explicitly set
      let roleId = localStorage.getItem('userRoleId');
      if (token && !roleId) {
        roleId = '1'; // Default role to offline chatbot
        localStorage.setItem('userRoleId', roleId);
      }
      
      console.log('Auth check:', { isAuth, hasToken: !!token, hasWallet: !!walletAddress, roleId });
      
      // Consider authenticated if token exists (roleId will default)
      const isFullyAuthenticated = isAuth && !!token;
      setIsAuthenticated(isFullyAuthenticated);
    };
    
    checkAuth();
    
    // Set up a listener for token changes
    const handleStorageChange = (e) => {
      console.log('Storage changed:', e?.key);
      checkAuth();
    };
    
    const handleAuthChange = () => {
      console.log('Auth state changed event received');
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('authStateChanged', handleAuthChange);
    
    // Also check periodically in case we missed an event
    const interval = setInterval(checkAuth, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('authStateChanged', handleAuthChange);
      clearInterval(interval);
    };
  }, []);
  
  // Force the chat button to be visible during development regardless of auth state
  // Comment this line out for production
  // const isAuthenticated = true;

  // Only render the component if user is authenticated
  if (!isAuthenticated) {
    console.log('Not rendering AgentButton because user is not authenticated');
    return null; // Don't render anything if not authenticated
  }
  
  console.log('Rendering AgentButton - user is authenticated');

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Display the ChatUI component directly when isOpen is true */}
      {isOpen && (
        <ChatUI 
          isMinimized={isMinimized}
          onMinimize={() => setIsMinimized(!isMinimized)}
          onClose={() => setIsOpen(false)}
        />
      )}
      
      {/* Enhanced agent button with label */}
      <div className="flex flex-col items-end">
        {!isOpen && (
          <div className="bg-blue-800 text-white text-xs px-3 py-1 rounded-full mb-2 shadow-md animate-pulse">
            Chat Assistant
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          title="Chat with Evrlink Assistant"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

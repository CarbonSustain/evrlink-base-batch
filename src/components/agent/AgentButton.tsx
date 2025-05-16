import React, { useState } from "react";
import { AgentChat } from "./AgentChat";
import { ChatUI } from "./ChatUI";

export const AgentButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
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
            Enhanced AgentKit
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          title="Chat with Enhanced AgentKit Chatbot"
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

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useAgent } from "../../hooks/useAgent";
import authService from "../../services/auth";
import { getChatbotMode } from "../../services/chatbot";

// Suggested questions and their answers in offline mode
const SUGGESTED_QA: Record<string, string> = {
  "How do I create a gift card?":
    "To create a gift card in Evrlink, go to the 'Create' page, select an art NFT (background), enter the recipient details, and specify the amount. You can then mint the gift card as an NFT. Gift cards can be personalized with custom messages and art NFT backgrounds to make them more special.",
  "What blockchain networks are supported?":
    "Evrlink currently supports Ethereum, Polygon, and Base networks. You can select your preferred network when connecting your wallet. Base Sepolia is our recommended testnet for trying out features without spending real crypto.",
  "How do I connect my wallet?":
    "To connect your wallet, click on the 'Connect Wallet' button in the top right corner. Evrlink supports MetaMask, WalletConnect, and Coinbase Wallet. Make sure you have one of these wallets installed before attempting to connect.",
  "Tell me about NFT backgrounds":
    "Art NFTs in Evrlink are customizable images that appear behind your gift cards. You can select from pre-made art NFTs or create your own in the 'Create Background' section. Artists can also mint and sell their own art NFT designs on the platform.",
  "What is Evrlink?":
    "Evrlink is a platform that allows you to create and send digital gift cards as NFTs on the blockchain. It combines the personalization of traditional gift cards with the security and ownership benefits of blockchain technology.",
  "How do I claim a gift card?":
    "To claim a gift card, you'll need the gift card ID and the secret code provided by the sender. Go to the 'Claim a Gift' page, enter these details, and connect your wallet to receive the gift card as an NFT.",
  "What are the fees?":
    "Evrlink charges minimal fees for creating and transferring gift cards. The exact fee depends on the blockchain network you're using and current gas prices. We strive to keep our platform affordable for all users.",
  "Tell me about wallet details":
    "In offline mode, I can only provide general information about wallets. To get your specific wallet details, please switch to online mode where I can access your connected wallet information.",
  Help: "I can help you with information about creating gift cards, supported blockchain networks, connecting wallets, art NFTs, claiming gifts, and platform fees. What would you like to know?",
};

// List of questions for display
const SUGGESTED_QUESTIONS = Object.keys(SUGGESTED_QA);

interface SuggestedQuestionProps {
  question: string;
  onClick: (question: string) => void;
  disabled: boolean;
}

const SuggestedQuestion: React.FC<SuggestedQuestionProps> = ({
  question,
  onClick,
  disabled,
}) => (
  <button
    onClick={() => onClick(question)}
    disabled={disabled}
    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg mr-2 mb-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {question}
  </button>
);

interface ChatUIProps {
  isMinimized: boolean;
  onMinimize: () => void;
  onClose: () => void;
}

interface Message {
  text: string;
  sender: "user" | "agent";
}

export const ChatUI: React.FC<ChatUIProps> = ({
  isMinimized,
  onMinimize,
  onClose,
}) => {
  const [input, setInput] = useState("");
  const {
    messages,
    sendMessage,
    isThinking,
    isOfflineMode,
    toggleOfflineMode,
    clearHistory,
    setOfflineMode,
  } = useAgent();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userRoleId, setUserRoleId] = useState<number>(1); // Default to role 1
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Use a ref to track if we've already fetched the mode to prevent repeated API calls
  const modeFetched = useRef<boolean>(false);

  // Initialize the chat mode based on user role from the database - only once per component mount
  useEffect(() => {
    let isMounted = true;

    const fetchChatbotMode = async () => {
      // Skip if we've already fetched the mode or user is not authenticated
      if (modeFetched.current || !authService.isAuthenticated()) {
        setIsLoading(false);
        return;
      }

      try {
        // Mark as fetched immediately to prevent duplicate calls
        modeFetched.current = true;
        setIsLoading(true);

        // Get chatbot mode from API - only once
        const modeResponse = await getChatbotMode();

        // Only update state if component is still mounted
        if (isMounted) {
          if (modeResponse) {
            console.log("Chatbot mode determined from API:", modeResponse);

            // Update the role ID state
            setUserRoleId(modeResponse.roleId || 1);

            // Set the offline mode based on API response
            const shouldBeOffline = modeResponse.mode === "offline";
            setOfflineMode(shouldBeOffline);

            console.log(
              `Setting chatbot to ${
                shouldBeOffline ? "offline" : "online"
              } mode based on role_id ${modeResponse.roleId}`
            );
          } else {
            // Fallback to local storage if API fails
            const localRoleId = authService.getUserRoleId();
            setUserRoleId(localRoleId);

            // Apply role-based access: role_id 1 gets offline, all others get online
            const shouldBeOffline = localRoleId === 1;
            setOfflineMode(shouldBeOffline);

            console.log(
              `Fallback: Setting chatbot to ${
                shouldBeOffline ? "offline" : "online"
              } mode based on local role_id ${localRoleId}`
            );
          }
        }
      } catch (error) {
        console.error("Error fetching chatbot mode:", error);

        if (isMounted) {
          // Fallback to default if there's an error
          const localRoleId = authService.getUserRoleId();
          setUserRoleId(localRoleId);
          setOfflineMode(localRoleId === 1);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchChatbotMode();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [setOfflineMode]);

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSendMessage = async (message: string) => {
    if (message.trim()) {
      setInput("");
      await sendMessage(message);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 overflow-hidden transition-all duration-300">
        <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
          <h3 className="text-sm font-semibold">Evrlink Assistant</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={onMinimize}
              className="text-white hover:text-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-3 text-sm">
          <p>
            {messages.length > 0
              ? "Continue your conversation..."
              : "How can I help you today?"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-full sm:w-96 h-[80vh] sm:h-[70vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 flex flex-col transition-all duration-300 z-50">
      {/* Chat Header */}
      <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
        <h3 className="font-semibold">
          Evrlink Assistant {isOfflineMode && "(Offline Mode)"}
        </h3>
        <div className="flex items-center space-x-1">
          {userRoleId === 1 ? (
            <span className="text-white px-2 py-1 text-xs rounded-full border border-white/30">
              Offline Mode Only
            </span>
          ) : (
            <span className="text-white px-2 py-1 text-xs rounded-full border border-white/30">
              Online Mode
            </span>
          )}
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-white hover:text-gray-200 px-2 py-1 text-xs rounded-full border border-white/30"
            >
              Clear
            </button>
          )}
          <button
            onClick={onMinimize}
            className="text-white hover:text-gray-200 ml-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500 mb-4">
              {isOfflineMode
                ? "Offline mode: Ask common questions about Evrlink..."
                : "Chat with the Evrlink Assistant..."}
            </p>
            {isOfflineMode && (
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <SuggestedQuestion
                    key={index}
                    question={question}
                    onClick={onSendMessage}
                    disabled={isThinking}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-2xl shadow ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white self-end"
                    : "bg-gray-100 dark:bg-gray-700 self-start"
                }`}
              >
                <div
                  className={
                    msg.sender === "user"
                      ? "text-white"
                      : "text-gray-800 dark:text-gray-200"
                  }
                >
                  <ReactMarkdown
                    components={{
                      a: (props) => (
                        <a
                          {...props}
                          className={
                            msg.sender === "user"
                              ? "text-blue-200 underline hover:text-blue-100"
                              : "text-blue-600 underline hover:text-blue-800"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      p: (props) => (
                        <p {...props} className="whitespace-pre-wrap mb-2" />
                      ),
                      code: (props) => (
                        <code
                          {...props}
                          className={
                            msg.sender === "user"
                              ? "bg-blue-700 text-gray-100 px-1 rounded"
                              : "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-1 rounded"
                          }
                        />
                      ),
                      li: (props) => <li {...props} className="ml-4" />,
                      ul: (props) => (
                        <ul {...props} className="list-disc ml-4 mb-2" />
                      ),
                      ol: (props) => (
                        <ol {...props} className="list-decimal ml-4 mb-2" />
                      ),
                      h1: (props) => (
                        <h1 {...props} className="text-xl font-bold mb-2" />
                      ),
                      h2: (props) => (
                        <h2 {...props} className="text-lg font-bold mb-1" />
                      ),
                      h3: (props) => (
                        <h3 {...props} className="text-base font-bold mb-1" />
                      ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {/* Show suggested questions after each agent response in offline mode */}
            {isOfflineMode &&
              messages.length > 0 &&
              messages[messages.length - 1].sender === "agent" && (
                <div className="flex flex-wrap justify-center gap-2 mt-4 p-2 bg-gray-50 rounded-lg">
                  {SUGGESTED_QUESTIONS.map((question, index) => (
                    <SuggestedQuestion
                      key={index}
                      question={question}
                      onClick={onSendMessage}
                      disabled={isThinking}
                    />
                  ))}
                </div>
              )}
          </div>
        )}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="text-center my-3">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mx-1"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        )}

        {/* Invisible div to track the bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 border-t dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="flex-grow p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={isThinking ? "Please wait..." : "Type a message..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isThinking && input.trim()) {
                onSendMessage(input);
              }
            }}
            disabled={isThinking}
          />
          <button
            onClick={() => {
              if (!isThinking && input.trim()) {
                onSendMessage(input);
              }
            }}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              !input.trim() || isThinking
                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            }`}
            disabled={!input.trim() || isThinking}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

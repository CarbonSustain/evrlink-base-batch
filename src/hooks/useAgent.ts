import { useState, useEffect } from "react";
import { AgentMessage, AgentRequest, AgentResponse } from "../types/agent";
import { API_BASE_URL } from "../services/api";

// Offline mode responses for common questions with comprehensive answers
const OFFLINE_RESPONSES: Record<string, string> = {
  "how do i create a gift card":
    "To create a gift card in Evrlink, go to the 'Create' page, select an art NFT (background), enter the recipient details, and specify the amount. You can then mint the gift card as an NFT. Gift cards can be personalized with custom messages and art NFT backgrounds to make them more special.",
  "what blockchain networks are supported":
    "Evrlink currently supports Ethereum, Polygon, and Base networks. You can select your preferred network when connecting your wallet. Base Sepolia is our recommended testnet for trying out features without spending real crypto.",
  "how do i connect my wallet":
    "To connect your wallet, click on the 'Connect Wallet' button in the top right corner. Evrlink supports MetaMask, WalletConnect, and Coinbase Wallet. Make sure you have one of these wallets installed before attempting to connect.",
  "tell me about nft backgrounds":
    "Art NFTs in Evrlink are customizable images that appear behind your gift cards. You can select from pre-made art NFTs or create your own in the 'Create Background' section. Artists can also mint and sell their own art NFT designs on the platform.",
  "what is evrlink":
    "Evrlink is a platform that allows you to create and send digital gift cards as NFTs on the blockchain. It combines the personalization of traditional gift cards with the security and ownership benefits of blockchain technology.",
  "how do i claim a gift card":
    "To claim a gift card, you'll need the gift card ID and the secret code provided by the sender. Go to the 'Claim a Gift' page, enter these details, and connect your wallet to receive the gift card as an NFT.",
  "what are the fees":
    "Evrlink charges minimal fees for creating and transferring gift cards. The exact fee depends on the blockchain network you're using and current gas prices. We strive to keep our platform affordable for all users.",
  "tell me about wallet details":
    "In offline mode, I can only provide general information about wallets. To get your specific wallet details, please switch to online mode where I can access your connected wallet information.",
  help: "I can help you with information about creating gift cards, supported blockchain networks, connecting wallets, art NFTs, claiming gifts, and platform fees. What would you like to know?",
  default:
    "I'm currently in offline mode. When connected to the backend, I can provide more detailed assistance with Evrlink features and functionality.",
};

// Find the best matching response for a query
function findOfflineResponse(query: string): string {
  const normalizedQuery = query.toLowerCase().trim();

  // Check for exact matches first
  if (OFFLINE_RESPONSES[normalizedQuery]) {
    return OFFLINE_RESPONSES[normalizedQuery];
  }

  // Check for questions from the suggested questions UI
  // These come with proper capitalization and question marks
  const strippedQuery = normalizedQuery
    .replace(/\?/g, "")
    .replace(/^how do i |^what |^tell me about |^how |^what are /g, "");

  // Look for key words in the offline responses
  for (const [key, response] of Object.entries(OFFLINE_RESPONSES)) {
    // Convert both strings to simple keyword sets for better matching
    const keyWords = key.replace(/[^a-z0-9\s]/g, "").split(" ");
    const queryWords = strippedQuery.replace(/[^a-z0-9\s]/g, "").split(" ");

    // Count matching words
    const matchCount = keyWords.filter(
      (word) =>
        word.length > 3 &&
        queryWords.some((qw) => qw.includes(word) || word.includes(qw))
    ).length;

    // If we have good matches or the key is fully contained
    if (
      matchCount >= 2 ||
      normalizedQuery.includes(key) ||
      key.includes(strippedQuery)
    ) {
      return response;
    }
  }

  // Return default response if no match found
  return OFFLINE_RESPONSES["default"];
}

/**
 * Sends a user message to the agent API and retrieves the agent's response.
 *
 * @async
 * @function messageAgent
 * @param {string} userMessage - The message sent by the user.
 * @param {boolean} offlineMode - Whether to use offline mode.
 * @param {string} userId - The ID of the user sending the message.
 * @returns {Promise<string | null>} The agent's response message or `null` if an error occurs.
 */
async function messageAgent(
  userMessage: string,
  offlineMode: boolean = false,
  userId: string = "default"
): Promise<string | null> {
  // If in offline mode, return a simulated response
  if (offlineMode) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return findOfflineResponse(userMessage);
  }

  try {
    // Connect to our new onchain agent backend on port 3001
    const agentUrl = "http://localhost:3001/api/agent";

    console.log("Connecting to onchain agent backend at:", agentUrl);
    console.log("Sending message:", userMessage);
    console.log("User ID:", userId);

    const response = await fetch(agentUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
        userId,
        context: {
          platform: "Evrlink",
          features: ["gift_cards", "nft_backgrounds", "wallet_management"],
          userId,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as AgentResponse;
    return data.response ?? data.error ?? null;
  } catch (error) {
    console.error("Error communicating with onchain agent:", error);

    // Try the original backend endpoint as fallback
    try {
      console.log("Falling back to original backend endpoint");
      const response = await fetch(`${API_BASE_URL}/api/agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Original backend expects 'message' instead of 'userMessage'
        // Also include userId for user-specific wallet
        body: JSON.stringify({ message: userMessage, userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as AgentResponse;
      return data.response ?? data.error ?? null;
    } catch (fallbackError) {
      console.error("Error communicating with fallback agent:", fallbackError);

      // If both endpoints fail, fall back to offline mode
      console.log("Falling back to offline mode due to network errors");
      return findOfflineResponse(userMessage);
    }
  }
}

// Storage key for chat history
const STORAGE_KEY = "evrlink-agent-chat-history";

/**
 * This hook manages interactions with the onchain AI agent.
 * It connects to the backend server by default (online mode)
 * but can fall back to offline mode if needed.
 */
export function useAgent(
  userId: string = `user_${Math.random().toString(36).substring(2, 9)}`
) {
  // Initialize state from localStorage if available
  const [messages, setMessages] = useState<AgentMessage[]>(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  const [isThinking, setIsThinking] = useState(false);
  // Default to online mode (false) to use the backend onchain agent
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  /**
   * Sends a user message, updates local state, and retrieves the agent's response.
   *
   * @param {string} input - The message from the user.
   */
  const sendMessage = async (input: string) => {
    if (!input.trim()) return;

    // Add user message to conversation
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    setIsThinking(true);

    // Get response from agent (using offline mode if enabled)
    const responseMessage = await messageAgent(input, isOfflineMode, userId);

    // Add agent response to conversation if received
    if (responseMessage) {
      setMessages((prev) => [
        ...prev,
        { text: responseMessage, sender: "agent" },
      ]);
    }

    setIsThinking(false);
  };

  /**
   * Clears the chat history
   */
  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  /**
   * Toggles offline mode
   */
  const toggleOfflineMode = () => {
    setIsOfflineMode((prev) => !prev);
  };

  /**
   * Sets offline mode directly
   */
  const setOfflineMode = (value: boolean) => {
    setIsOfflineMode(value);
  };

  return {
    messages,
    sendMessage,
    isThinking,
    clearHistory,
    isOfflineMode,
    toggleOfflineMode,
    setOfflineMode,
  };
}

import axios from "axios";
import { useWallet } from "@/contexts/WalletContext";
import { eventBus } from "./eventBus";
import { authLog, apiLog } from "../utils/debug";

// Get API base URL from environment or use fallback with improved error handling
export const getApiBaseUrl = () => {
  // For development environment, use the proxy setup in vite.config.ts or direct URL
  if (import.meta.env.MODE === "development") {
    console.log("Using development API URL");
    // Check if we should use the proxy (empty string) or direct URL
    const useProxy = import.meta.env.VITE_USE_PROXY === "true";
    if (useProxy) {
      console.log("Using proxy configuration");
      return ""; // Empty string will use relative URLs that go through the proxy
    } else {
      console.log("Using direct backend URL");
      return "http://localhost:3001"; // Direct connection to backend
    }
  }

  // For production, use the environment variable
  let baseUrl = import.meta.env.VITE_API_URL;

  // If that's not available, use default
  if (!baseUrl) {
    console.warn("VITE_API_URL not found in environment, using default URL");
    baseUrl = "https://api.evrlink.com";
  }

  // Log the API base URL being used
  console.log("API Base URL:", baseUrl);

  // Remove trailing slash if present
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
};

// Use the function to get the base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL;

// Event system for database changes
export class DatabaseEvents {
  private static listeners = {
    artNftAdded: [] as ((artNft: ArtNFT) => void)[],
    artNftUpdated: [] as ((artNft: ArtNFT) => void)[],
  };

  // Methods to register listeners
  static onArtNftAdded(callback: (artNft: ArtNFT) => void) {
    this.listeners.artNftAdded.push(callback);
    return () => this.offArtNftAdded(callback); // Return unsubscribe function
  }

  static onArtNftUpdated(callback: (artNft: ArtNFT) => void) {
    this.listeners.artNftUpdated.push(callback);
    return () => this.offArtNftUpdated(callback); // Return unsubscribe function
  }

  // Methods to remove listeners
  static offArtNftAdded(callback: (artNft: ArtNFT) => void) {
    this.listeners.artNftAdded = this.listeners.artNftAdded.filter(
      (cb) => cb !== callback
    );
  }

  static offArtNftUpdated(callback: (artNft: ArtNFT) => void) {
    this.listeners.artNftUpdated = this.listeners.artNftUpdated.filter(
      (cb) => cb !== callback
    );
  }

  // Methods to emit events
  static emitArtNftAdded(artNft: ArtNFT) {
    this.listeners.artNftAdded.forEach((callback) => callback(artNft));
  }

  static emitArtNftUpdated(artNft: ArtNFT) {
    this.listeners.artNftUpdated.forEach((callback) => callback(artNft));
  }
}

// --- ArtNFT interface (replaces Background) ---
export interface ArtNFT {
  id: number;
  artistAddress: string;
  imageUri: string;
  price: string;
  giftCardCategoryId: number;
  createdAt?: string;
  updatedAt?: string;
}

// --- Updated GiftCard interface for new DB schema ---
export interface GiftCard {
  id: number;
  creatorAddress: string;
  issuerAddress: string;
  price: string;
  message: string;
  giftCardCategoryId: number;
  createdAt: string;
  updatedAt: string;
  // Optionally, if your API includes these relations:
  artNfts?: ArtNFT[];
  secrets?: GiftCardSecret[];
  settlement?: GiftCardSettlement;
}

// --- New interfaces for related tables (optional, for type safety) ---
export interface GiftCardSecret {
  id: number;
  giftCardId: number;
  secretHash: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GiftCardSettlement {
  id: number;
  giftCardId: number;
  fromAddr: string;
  toAddr: string;
  taxFee: number;
  evrlinkFee: number;
  createdAt?: string;
  updatedAt?: string;
  blockchainTransaction?: BlockchainTransaction;
}

export interface BlockchainTransaction {
  id: number;
  txHash: string;
  giftCardSettlementId: number;
  blockchainTxId: number;
  gasFee: number;
  fromAddr: string;
  toAddr: string;
  amount: string;
  txTimestamp?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: BlockchainTransactionCategory;
}

export interface BlockchainTransactionCategory {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

// Get token from localStorage with more robust error handling
const getToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      authLog("No auth token found in localStorage", null, "warn");
      return null;
    }

    // Check if it looks like a JWT (has 3 parts separated by dots)
    const parts = token.split(".");
    if (parts.length !== 3) {
      authLog(
        "Token does not appear to be in JWT format",
        { token: token.substring(0, 15) + "..." },
        "warn"
      );
    } else {
      authLog("Found valid JWT token format", {
        tokenPreview: token.substring(0, 15) + "...",
      });
    }

    return token;
  } catch (error) {
    authLog("Error accessing localStorage for token", error, "error");
    return null;
  }
};

// Add token to request headers with improved error handling
export const getAuthHeaders = () => {
  apiLog("Getting auth headers for request");
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    apiLog("Added Authorization header to request", {
      headerPreview: `Bearer ${token.substring(0, 15)}...`,
    });
  } else {
    apiLog(
      "No auth token available - request may fail if authentication is required",
      null,
      "warn"
    );
  }

  return headers;
};

// Fetch art NFTs (all or by category)
export const fetchArtNFTs = async (
  giftCardCategoryName?: string, // Now expects category name (string) if filtering
  page: number = 1,
  limit: number = 20
): Promise<ArtNFT[]> => {
  try {
    const params: any = { page, limit };
    // The backend expects 'category' as category name (string)
    if (giftCardCategoryName) params.category = giftCardCategoryName;

    const response = await axios.get(`${API_BASE_URL}/api/backgrounds`, {
      params,
      headers: getAuthHeaders(), // <-- Add this line to ensure Authorization header is sent
    });

    // The backend response shape: { success, backgrounds, ... }
    if (Array.isArray(response.data.backgrounds)) {
      // Map backend fields to ArtNFT interface
      return response.data.backgrounds.map((bg: any) => ({
        id: bg.id,
        artistAddress: bg.artist_address,
        imageUri: bg.image_uri,
        price: bg.price,
        giftCardCategoryId: bg.gift_card_category_id,
        createdAt: bg.created_at,
        updatedAt: bg.updated_at,
      }));
    }
    // Fallback for legacy or error cases
    if (Array.isArray(response.data.artNfts)) {
      return response.data.artNfts;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Fetch art NFTs error:", error);
    // Add more detailed error message if available
    if (error.response?.data?.error) {
      throw new Error("Failed to fetch art NFTs: " + error.response.data.error);
    }
    throw new Error("Failed to fetch art NFTs");
  }
};

// Get art NFT by ID
export const getArtNFTById = async (id: number): Promise<ArtNFT> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/artnft/${id}`);

    // Emit artNft updated event
    DatabaseEvents.emitArtNftUpdated(response.data);

    return response.data;
  } catch (error) {
    console.error("Get art NFT error:", error);
    throw new Error("Failed to get art NFT");
  }
};

// Get all background categories
export const getBackgroundCategories = async (): Promise<string[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/background/categories`
    );
    return response.data.categories || response.data;
  } catch (error) {
    console.error("Get categories error:", error);
    throw new Error("Failed to get categories");
  }
};

// Create art NFT
export const createArtNFT = async (data: {
  image: File;
  giftCardCategoryId: number;
  price: string;
}) => {
  try {
    const formData = new FormData();
    formData.append("image", data.image);
    formData.append("giftCardCategoryId", data.giftCardCategoryId.toString());
    formData.append("price", data.price);
    formData.append(
      "artistAddress",
      localStorage.getItem("walletAddress") || ""
    );

    const response = await axios.post(`${API_BASE_URL}/api/artnft`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });

    // Emit artNft added event
    if (response.data && response.data.artNft) {
      DatabaseEvents.emitArtNftAdded(response.data.artNft);
    }

    return response.data;
  } catch (error) {
    console.error("Create art NFT error:", error);
    throw new Error("Failed to create art NFT");
  }
};

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/images/upload`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.imageUrl || response.data;
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error("Failed to upload image");
  }
};

// Remove or deprecate all Background-related code below this line
// (fetchBackgrounds, getBackgroundById, createBackground, mintBackgroundNFT, verifyBackgroundStatus, etc.)
// and replace usages in your app with the new ArtNFT versions above.

// =====================
// GIFT CARD ENDPOINTS
// =====================

// Get all gift cards with filtering
export const fetchGiftCards = async (
  page: number = 1,
  limit: number = 20,
  status?: string,
  minPrice?: string,
  maxPrice?: string
): Promise<GiftCard[]> => {
  try {
    const params: any = { page, limit };
    if (status) params.status = status;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    const response = await axios.get(`${API_BASE_URL}/api/gift-cards`, {
      params,
      headers: getAuthHeaders(),
    });
    return response.data.giftCards || response.data;
  } catch (error) {
    console.error("Fetch gift cards error:", error);
    throw new Error("Failed to fetch gift cards");
  }
};

// Transfer a gift card
export const transferGiftCard = async (data: {
  giftCardId: string | number;
  recipientAddress: string;
}): Promise<any> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/gift-cards/transfer`,
      {
        giftCardId: data.giftCardId,
        recipientAddress: data.recipientAddress,
      },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Transfer gift card error:", error);
    throw new Error("Failed to transfer gift card");
  }
};

// Set secret key for a gift card
export const setGiftCardSecret = async (data: {
  giftCardId: string | number;
  secret: string;
}): Promise<any> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/gift-cards/${data.giftCardId}/set-secret`,
      {
        secret: data.secret,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error("Set gift card secret error:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to set gift card secret",
    };
  }
};

// Claim a gift card
export const claimGiftCard = async (data: {
  giftCardId: string | number;
  secret: string;
  claimerAddress: string;
}): Promise<any> => {
  try {
    // The backend expects POST /api/giftcard/claim with { giftCardId, secret, claimerAddress }
    const response = await axios.post(
      `${API_BASE_URL}/api/giftcard/claim`,
      {
        giftCardId: data.giftCardId,
        secret: data.secret,
        claimerAddress: data.claimerAddress,
      },
      {
        headers: getAuthHeaders(),
      }
    );

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Claim gift card error:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to claim gift card",
    };
  }
};

// Buy a gift card
export const buyGiftCard = async (data: {
  giftCardId: string | number;
  message?: string;
  price: string;
}): Promise<any> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/gift-cards/buy`,
      {
        giftCardId: data.giftCardId,
        message: data.message,
        price: data.price,
      },
      {
        headers: getAuthHeaders(),
      }
    );

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Buy gift card error:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to buy gift card",
    };
  }
};

// =====================
// USER ENDPOINTS
// =====================

// Create or update a user profile
export const updateUserProfile = async (data: {
  username?: string;
  email?: string;
  bio?: string;
  profileImageUrl?: string;
}): Promise<User> => {
  try {
    const walletAddress = localStorage.getItem("walletAddress");
    if (!walletAddress) {
      throw new Error("No wallet address found - please connect your wallet");
    }

    const userData = {
      walletAddress,
      ...data,
    };

    const response = await axios.post(
      `${API_BASE_URL}/api/user/profile`,
      userData,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data.user || response.data;
  } catch (error) {
    console.error("Update user profile error:", error);
    throw new Error("Failed to update user profile");
  }
};

// Get user profile
export const getUserProfile = async (walletAddress: string): Promise<User> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/user/${walletAddress}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data.user || response.data;
  } catch (error) {
    console.error("Get user profile error:", error);
    throw new Error("Failed to get user profile");
  }
};

// Get all users with pagination and sorting
export const fetchUsers = async (
  page: number = 1,
  limit: number = 20,
  sortBy?: string,
  sortOrder?: "ASC" | "DESC"
): Promise<User[]> => {
  try {
    const params: any = { page, limit };
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;

    const response = await axios.get(`${API_BASE_URL}/api/user`, {
      params,
      headers: getAuthHeaders(),
    });
    return response.data.users || response.data;
  } catch (error) {
    console.error("Fetch users error:", error);
    throw new Error("Failed to fetch users");
  }
};

// Get top users
export const getTopUsers = async (limit: number = 10): Promise<User[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/user/top?limit=${limit}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data.users || response.data;
  } catch (error) {
    console.error("Get top users error:", error);
    throw new Error("Failed to get top users");
  }
};

// Search users
export const searchUsers = async (query: string): Promise<User[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/user/search?query=${encodeURIComponent(query)}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data.users || response.data;
  } catch (error) {
    console.error("Search users error:", error);
    throw new Error("Failed to search users");
  }
};

// Get user activity
export const getUserActivity = async (
  walletAddress: string
): Promise<any[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/user/${walletAddress}/activity`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data.activity || response.data;
  } catch (error) {
    console.error("Get user activity error:", error);
    throw new Error("Failed to get user activity");
  }
};

// =====================
// TRANSACTION ENDPOINTS
// =====================

// Get recent transactions

// =====================
// AUTHENTICATION
// =====================

// Login with wallet
export const loginWithWallet = async (
  walletAddress: string,
  signature: string
): Promise<any> => {
  try {
    // Normalize the address to lowercase to avoid checksum issues
    const normalizedAddress = walletAddress.toLowerCase();

    authLog("Attempting login with wallet", {
      address: normalizedAddress,
      signatureType: signature.startsWith("mock_signature_for_")
        ? "mock"
        : "real",
    });

    apiLog("Sending login request to backend", {
      endpoint: `${API_BASE_URL}/api/auth/login`,
      method: "POST",
    });

    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      address: normalizedAddress, // Use normalized address
      signature,
    });

    // Validate the response
    if (!response.data || !response.data.token) {
      authLog("Invalid login response - missing token", response.data, "error");
      throw new Error("Authentication failed: server response missing token");
    }

    const token = response.data.token;
    authLog("Login successful", {
      tokenPreview: token.substring(0, 15) + "...",
      userInfo: response.data.user,
    });

    // Store token for future requests
    localStorage.setItem("token", token);
    localStorage.setItem("walletAddress", walletAddress); // Store original format

    // Verify token was properly stored
    const storedToken = localStorage.getItem("token");
    if (storedToken !== token) {
      authLog("Token storage verification failed", null, "error");
      throw new Error("Failed to store authentication token");
    }

    authLog("Token stored successfully in localStorage");

    return response.data;
  } catch (error: any) {
    authLog("Login error", error, "error");

    // Extract useful error information if available
    if (error.response) {
      authLog(
        "Server response error",
        {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        },
        "error"
      );

      if (error.response.data && error.response.data.error) {
        throw new Error(`Login failed: ${error.response.data.error}`);
      }
    }

    throw new Error(
      "Failed to login with wallet: " + (error.message || "Unknown error")
    );
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
      headers: getAuthHeaders(),
    });
    return response.data.user || response.data;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};
// Associate email with wallet address
export const associateEmailWithWallet = async (
  email: string,
  walletAddress: string
): Promise<any> => {
  try {
    console.log("Associating email with wallet:", { email, walletAddress });

    // Make the API call without auth headers initially, since this might be called before login
    const headers = {
      "Content-Type": "application/json",
    };

    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Debug the API URL being used
    const apiUrl = `${API_BASE_URL}/api/auth/email-wallet`;
    console.log("API URL for email-wallet association:", apiUrl);

    const response = await axios.post(
      apiUrl,
      { email, walletAddress },
      { headers }
    );

    console.log("Email-wallet association response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error associating email with wallet:", error);
    console.error("Error details:", error.response?.data || error.message);

    // Log the specific error for debugging
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Status Text:", error.response.statusText);
      console.error("Response Data:", error.response.data);
      console.error("Request URL:", error.config?.url);
      console.error("Request Method:", error.config?.method);
    }

    // Throw a more detailed error
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to associate email with wallet: " + error.message);
  }
};

// Get wallet by email
export const getWalletByEmail = async (
  email: string
): Promise<string | null> => {
  try {
    console.log("Getting wallet for email:", email);

    // Make the API call without auth headers initially
    const headers = {
      "Content-Type": "application/json",
    };

    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_BASE_URL}/api/auth/email-wallet`, {
      params: { email },
      headers,
    });

    console.log("Get wallet by email response:", response.data);

    if (response.data && response.data.walletAddress) {
      return response.data.walletAddress;
    }
    return null;
  } catch (error: any) {
    // If the error is 404 (not found), that's an expected case - just return null
    if (error.response && error.response.status === 404) {
      console.log("No wallet found for email:", email);
      return null;
    }

    console.error("Error getting wallet for email:", error);
    console.error("Error details:", error.response?.data || error.message);

    // For other errors, log but don't throw - just return null
    return null;
  }
};

// Login with email
export const loginWithEmail = async (email: string): Promise<any> => {
  try {
    // First check if the email has an associated wallet
    const walletAddress = await getWalletByEmail(email);

    // If no wallet exists, return null indicating we need to create one
    if (!walletAddress) {
      return null;
    }

    // Otherwise, authenticate with the existing wallet
    // Create a mock signature for development
    const signature = `mock_signature_for_${walletAddress}`;
    return await loginWithWallet(walletAddress, signature);
  } catch (error) {
    console.error("Error logging in with email:", error);
    throw new Error("Failed to login with email");
  }
};

// Logout
export const logout = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("walletAddress");
};

// Check and refresh authentication if needed
export const checkAuthState = async (): Promise<{
  isAuthenticated: boolean;
  message: string;
}> => {
  try {
    const token = localStorage.getItem("token");
    const walletAddress = localStorage.getItem("walletAddress");

    // If we don't have both token and wallet address, we're not authenticated
    if (!token || !walletAddress) {
      authLog(
        "Not authenticated - missing token or wallet address",
        {
          hasToken: !!token,
          hasWalletAddress: !!walletAddress,
        },
        "warn"
      );
      return {
        isAuthenticated: false,
        message: "Not authenticated - please connect your wallet",
      };
    }

    // Try to decode the token to check expiration
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));

        // Check if token is expired
        if (payload.exp) {
          const expiryDate = new Date(payload.exp * 1000);
          const now = new Date();

          // If token is expired or about to expire (within 10 minutes)
          if (expiryDate.getTime() - now.getTime() < 10 * 60 * 1000) {
            authLog(
              "Token is expired or about to expire",
              {
                expiry: expiryDate.toISOString(),
                now: now.toISOString(),
              },
              "warn"
            );

            // Try to refresh the token by re-authenticating
            authLog("Attempting to refresh authentication");

            // Create a mock signature for development
            const signature = `mock_signature_for_${walletAddress}`;
            const response = await loginWithWallet(walletAddress, signature);

            if (response && response.token) {
              authLog("Authentication refreshed successfully");
              return {
                isAuthenticated: true,
                message: "Authentication refreshed successfully",
              };
            } else {
              authLog("Failed to refresh authentication", null, "error");
              return {
                isAuthenticated: false,
                message: "Failed to refresh authentication",
              };
            }
          }
        }
      }
    } catch (decodeError) {
      authLog("Error decoding token", decodeError, "error");
      // Continue with the check - we'll try to use the token anyway
    }

    // Validate the current authentication by making a test request
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: getAuthHeaders(),
      });

      if (
        response.data &&
        (response.data.user || response.data.walletAddress)
      ) {
        authLog("Authentication validation successful", response.data);
        return {
          isAuthenticated: true,
          message: "Authentication validated successfully",
        };
      } else {
        authLog(
          "Authentication validation failed - invalid response",
          response.data,
          "warn"
        );
        return {
          isAuthenticated: false,
          message: "Authentication validation failed",
        };
      }
    } catch (error: any) {
      authLog("Error validating authentication", error, "error");

      // Check if it's an authentication error (401)
      if (error.response && error.response.status === 401) {
        // Try to refresh authentication
        try {
          authLog("Authentication validation failed - attempting to refresh");

          // Create a mock signature for development
          const signature = `mock_signature_for_${walletAddress}`;
          const refreshResponse = await loginWithWallet(
            walletAddress,
            signature
          );

          if (refreshResponse && refreshResponse.token) {
            authLog(
              "Authentication refreshed successfully after validation failure"
            );
            return {
              isAuthenticated: true,
              message: "Authentication refreshed successfully",
            };
          }
        } catch (refreshError) {
          authLog(
            "Failed to refresh authentication after validation failure",
            refreshError,
            "error"
          );
        }
      }

      return {
        isAuthenticated: false,
        message:
          "Authentication validation failed: " +
          (error.message || "Unknown error"),
      };
    }
  } catch (error: any) {
    authLog("Unexpected error in checkAuthState", error, "error");
    return {
      isAuthenticated: false,
      message:
        "Authentication check failed: " + (error.message || "Unknown error"),
    };
  }
};

// Get total required price for a gift card (including fees)
export const getGiftCardTotalRequired = async (
  backgroundId: string | number,
  price: string
): Promise<{
  success: boolean;
  totalRequired: string;
  totalRequiredEth: string;
  breakdown: any;
  error?: string;
}> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/giftcard/price`,
      { backgroundId, price },
      { headers: getAuthHeaders() }
    );
    return {
      success: true,
      totalRequired: response.data.totalRequired,
      totalRequiredEth: response.data.totalRequiredEth,
      breakdown: response.data.breakdown,
    };
  } catch (error: any) {
    console.error(
      "Get gift card total required error:",
      error.response?.data || error
    );
    return {
      success: false,
      totalRequired: "0",
      totalRequiredEth: "0",
      breakdown: {},
      error:
        error.response?.data?.error || "Failed to get total required price",
    };
  }
};

// --- Updated User interface for new DB schema ---
export interface User {
  id: number;
  roleId: number;
  walletAddress: string;
  username?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
  // Optional fields for UI/legacy
  bio?: string;
  profileImageUrl?: string;
  totalGiftCardsCreated?: number;
  totalGiftCardsSold?: number;
  totalBackgroundsCreated?: number;
}

// --- Optionally, UserRole interface for type safety ---
export interface UserRole {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

// --- ArtNFT store hook (for correct import in CategoryCards.tsx) ---
// (Already exported as useArtNftsStore in store.ts, do not re-export here.)

// --- CreateGiftCard API for CreateGift.tsx ---
// Updated to match backend: accepts backgroundIds (array), paymentMethod, artNftPricesUSDC, etc.
export const createGiftCard = async ({
  backgroundIds,
  message,
  paymentMethod,
  artNftPricesUSDC,
  price,
  recipientAddress,
  secret,
  transferMethod,
  backgroundId, // Accept single backgroundId for compatibility
}: {
  backgroundIds?: (string | number)[];
  backgroundId?: string | number;
  message?: string;
  paymentMethod?: string;
  artNftPricesUSDC?: string[]; // Array of prices in USDC for each art NFT
  price?: string; // Optional, for ETH payment
  recipientAddress?: string;
  secret?: string;
  transferMethod?: string;
}) => {
  try {
    // Support both backgroundIds (array) and backgroundId (single)
    let ids: (string | number)[] = [];
    if (Array.isArray(backgroundIds) && backgroundIds.length > 0) {
      ids = backgroundIds;
    } else if (backgroundId !== undefined && backgroundId !== null) {
      ids = [backgroundId];
    }

    if (!ids.length || !price) {
      throw new Error("Missing backgroundId or price for gift card creation.");
    }

    // --- Ensure artNftPricesUSDC is provided and matches backgroundIds length ---
    let pricesUSDC: string[] = [];
    if (
      Array.isArray(artNftPricesUSDC) &&
      artNftPricesUSDC.length === ids.length
    ) {
      pricesUSDC = artNftPricesUSDC;
    } else {
      // fallback: use price for each backgroundId as string
      pricesUSDC = ids.map(() => price.toString());
    }

    const payload: any = {
      backgroundIds: ids,
      artNftPricesUSDC: pricesUSDC,
      message,
      price,
    };
    if (paymentMethod) payload.paymentMethod = paymentMethod;
    if (recipientAddress) payload.recipientAddress = recipientAddress;
    if (secret) payload.secret = secret;
    if (transferMethod) payload.transferMethod = transferMethod;

    const response = await axios.post(
      `${API_BASE_URL}/api/gift-cards/create`,
      payload,
      {
        headers: {
          ...getAuthHeaders(),
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Create gift card error:", error.response?.data || error);
    throw new Error(
      error.response?.data?.error || "Failed to create gift card"
    );
  }
};

// --- MintBackgroundNFT API for CreateBackground.tsx ---
export const mintBackgroundNFT = async (data: {
  image: File;
  category: string;
  price: string;
}): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("image", data.image);
    formData.append("category", data.category);
    formData.append("price", data.price);
    formData.append(
      "artistAddress",
      localStorage.getItem("walletAddress") || ""
    );

    const response = await axios.post(
      `${API_BASE_URL}/api/background/mint`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Mint background NFT error:", error.response?.data || error);
    throw new Error(
      error.response?.data?.error || "Failed to mint background NFT"
    );
  }
};

// --- VerifyBackgroundStatus API for CreateBackground.tsx ---
export const verifyBackgroundStatus = async (
  backgroundId: string | number
): Promise<any> => {
  try {
    const id = backgroundId.toString();
    const response = await axios.get(
      `${API_BASE_URL}/api/background/verify/${id}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Verify background status error:", error);
    throw new Error("Failed to verify background status");
  }
};

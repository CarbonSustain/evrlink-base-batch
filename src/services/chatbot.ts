import { API_BASE_URL } from './api';
import { getAuthHeaders } from './api';

/**
 * Interface for chatbot mode response from the server
 */
export interface ChatbotModeResponse {
  userId: string;
  roleId: number;
  mode: 'online' | 'offline';
  error?: string;
}

/**
 * Fetches the appropriate chatbot mode from the server based on the user's role
 * @returns The chatbot mode ('online' or 'offline') based on the user's role_id
 */
export async function getChatbotMode(): Promise<ChatbotModeResponse> {
  try {
    console.log('Fetching chatbot mode from server');
    
    // Get auth headers to include token
    const headers = getAuthHeaders();
    
    // Make API call to get the chatbot mode
    const response = await fetch(`${API_BASE_URL}/api/chatbot/mode`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      // If there's an error, default to offline mode for safety
      console.error('Error fetching chatbot mode:', response.statusText);
      return { 
        userId: 'unknown',
        roleId: 1, 
        mode: 'offline',
        error: `Failed to fetch chatbot mode: ${response.statusText}`
      };
    }
    
    const data = await response.json();
    console.log('Chatbot mode response:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching chatbot mode:', error);
    // Default to offline mode in case of errors
    return { 
      userId: 'unknown',
      roleId: 1, 
      mode: 'offline',
      error: `Exception fetching chatbot mode: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

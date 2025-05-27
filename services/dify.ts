import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_DIFY_API_KEY;
const API_ENDPOINT = Constants.expoConfig?.extra?.EXPO_PUBLIC_DIFY_API_ENDPOINT;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendMessage(message: string, conversationId?: string) {
  try {
    const response = await fetch(`${API_ENDPOINT}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query: message,
        response_mode: 'streaming',
        conversation_id: conversationId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message to Dify AI');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message to Dify AI:', error);
    throw error;
  }
}

export async function getConversationHistory(conversationId: string) {
  try {
    const response = await fetch(`${API_ENDPOINT}/messages/${conversationId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversation history');
    }

    const data = await response.json();
    return data.messages as ChatMessage[];
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    throw error;
  }
}
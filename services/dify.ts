// Temporary test values - replace with your actual API credentials
const API_KEY = 'app-3OpCWrbRkXEDPuDIYlojNVkL';
const API_ENDPOINT = 'https://api.dify.ai/v1';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendMessage(message: string, conversationId?: string) {
  try {
    console.log('Sending to:', API_ENDPOINT);
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
        user: "user123" // TODO: Replace with your actual user identification
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        body: errorBody
      });
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Full Error:', error);
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
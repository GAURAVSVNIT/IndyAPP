// Temporary test values - replace with your actual API credentials
import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_DIFY_API_KEY;
const API_ENDPOINT = Constants.expoConfig?.extra?.EXPO_PUBLIC_DIFY_API_ENDPOINT || 'https://api.dify.ai/v1';
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
interface RequestBody {
inputs: {};
query: string;
response_mode: string;
conversation_id?: string;
user?: string;
}
export async function sendMessage(message: string, conversationId?: string) {
  if (!API_KEY) {
    throw new Error('DIFY_API_KEY is not configured. Please set it in your environment variables.');
  }
  try {
    console.log('Sending to:', API_ENDPOINT);
    console.log('Using API Key:', API_KEY ? 'Set' : 'Not set');
    const requestBody: RequestBody = {
      inputs: {},
      query: message,
      response_mode: 'streaming',
      user: "user123" // TODO: Replace with your actual user identification
    };
    if (conversationId) {
      requestBody.conversation_id = conversationId;
    }
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    const response = await fetch(`${API_ENDPOINT}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    //   body: JSON.stringify({
    //     inputs: {},
    //     query: message,
    //     response_mode: 'streaming', 
    //     conversation_id: conversationId,
    //     user: "user123" // TODO: Replace with your actual user identification
    //   }),
    // });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText}\n${errorBody}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported or response body is null.');
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';
    let answerChunks: string[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
      const lines = result.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const json = line.replace('data: ', '');
          if (json.trim() !== '[DONE]') {
            const parsed = JSON.parse(json);
            console.log('PARSED EVENT:', parsed);
            if (parsed.event === "agent_message" && parsed.answer !== undefined) {
              // Only add if not already present in the array
              if (parsed.answer && !answerChunks.includes(parsed.answer)) {
                answerChunks.push(parsed.answer);
              }
            }
          }
        }
      }
    }
    return answerChunks.join('').trim();
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
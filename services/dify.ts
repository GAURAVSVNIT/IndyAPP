// Dify API Client for chat interactions
import Constants from 'expo-constants';

const API_KEY = process.env.EXPO_PUBLIC_DIFY_API_KEY || 'app-3OpCWrbRkXEDPuDIYlojNVkL';
const API_ENDPOINT = process.env.EXPO_PUBLIC_DIFY_API_ENDPOINT || 'https://api.dify.ai/v1';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface FileData {
  type: string;
  transfer_method: 'local_file';
  upload_file_id: string;
}

interface RequestBody {
  inputs: Record<string, unknown>;
  query: string;
  response_mode: string;
  user: string;
  conversation_id?: string;
  files?: FileData[];
}

interface ChatError {
  message: string;
  stack?: string;
  details?: unknown;
}

interface SendMessageOptions {
  message: string;
  conversationId?: string;
  userId?: string;
  files?: FileData[];
  streaming?: boolean;
}
export async function sendMessage(options: SendMessageOptions | string, conversationId?: string) {
  if (!API_KEY) {
    throw new Error('DIFY_API_KEY is not configured. Please set it in your environment variables.');
  }
  
  try {
    // Handle backward compatibility with old string parameter
    const params: SendMessageOptions = typeof options === 'string' 
      ? { message: options, conversationId } 
      : options;

    const { message, conversationId: convId, userId, files, streaming = true } = params;

    if (!message) {
      throw new Error('Query is required');
    }

    console.log('Sending to:', API_ENDPOINT);
    console.log('Using API Key:', API_KEY ? 'Set' : 'Not set');

    const headers = {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': streaming ? 'text/event-stream' : 'application/json',
    };

    const generatedUserId = userId || "user123"; // Default user ID, can be customized

    const requestBody: RequestBody = {
      inputs: {},
      query: message,
      response_mode: streaming ? "streaming" : "blocking",
      user: generatedUserId,
    };

    // Add conversation ID if provided
    if (convId) {
      requestBody.conversation_id = convId;
    }

    // Validate and add files if provided
    if (files && Array.isArray(files) && files.length > 0) {
      const isValidFiles = files.every(file => 
        typeof file === 'object' && 
        file !== null &&
        typeof file.type === 'string' &&
        file.transfer_method === 'local_file' &&
        typeof file.upload_file_id === 'string'
      );

      if (!isValidFiles) {
        console.error("Invalid file structure received:", JSON.stringify(files, null, 2));
        throw new Error('Invalid file structure provided');
      }
      requestBody.files = files;
    }

    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${API_ENDPOINT}/chat-messages`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorJson: unknown = {};
      try { 
        errorJson = JSON.parse(errorBody); 
      } catch {}
      
      console.error('Dify API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        body: errorBody
      });
      
      throw new Error(`API Error: ${response.status} ${response.statusText}\n${errorBody}`);
    }

    if (!streaming) {
      // For blocking responses, return the JSON data
      const data = await response.json();
      return data;
    }

    // For streaming responses, process the stream
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
            try {
              const parsed = JSON.parse(json);
              console.log('PARSED EVENT:', parsed);
              
              // Handle both event formats (for compatibility)
              if ((parsed.event === "agent_message" || parsed.event === undefined) && 
                  parsed.answer !== undefined) {
                // Only add if not already present in the array
                if (parsed.answer && !answerChunks.includes(parsed.answer)) {
                  answerChunks.push(parsed.answer);
                }
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming data:', parseError);
            }
          }
        }
      }
    }
    
    return answerChunks.join('').trim();
  } catch (error) {
    const chatError = error as ChatError;
    console.error('Full Error:', chatError);
    throw error;
  }
}

export async function sendMessageWithFiles(
  message: string, 
  files: FileData[], 
  conversationId?: string,
  userId?: string
) {
  return sendMessage({
    message,
    files,
    conversationId,
    userId
  });
}

export async function sendMessageBlocking(
  message: string, 
  conversationId?: string,
  userId?: string
) {
  return sendMessage({
    message,
    conversationId,
    userId,
    streaming: false
  });
}

export async function getConversationHistory(conversationId: string) {
  if (!API_KEY) {
    throw new Error('DIFY_API_KEY is not configured. Please set it in your environment variables.');
  }
  
  try {
    const response = await fetch(`${API_ENDPOINT}/messages/${conversationId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch conversation history:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to fetch conversation history: ${response.status}`);
    }

    const data = await response.json();
    return data.messages as ChatMessage[];
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    throw error;
  }
}

// Utility function to process streaming responses
export async function processStreamingResponse(
  response: Response,
  onMessage: (message: string) => void,
  onComplete?: () => void,
  onError?: (error: Error) => void
) {
  try {
    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let answerChunks: string[] = [];

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete?.();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const json = line.replace('data: ', '');
            if (json.trim() !== '[DONE]') {
              const parsed = JSON.parse(json);
              console.log('PARSED EVENT:', parsed);
              
              if ((parsed.event === "agent_message" || parsed.event === undefined) && 
                  parsed.answer !== undefined) {
                if (parsed.answer && !answerChunks.includes(parsed.answer)) {
                  answerChunks.push(parsed.answer);
                  onMessage(parsed.answer);
                }
              }
            }
          } catch (parseError) {
            console.warn('Failed to parse streaming data:', parseError);
          }
        }
      }
    }
  } catch (error) {
    const streamError = error as Error;
    console.error('Streaming error:', streamError);
    onError?.(streamError);
  }
}

// File upload function for file attachments
export async function uploadFile(file: Blob, fileName: string): Promise<string> {
  if (!API_KEY) {
    throw new Error('DIFY_API_KEY is not configured. Please set it in your environment variables.');
  }
  
  try {
    const formData = new FormData();
    formData.append('file', file, fileName);

    const response = await fetch(`${API_ENDPOINT}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('File upload failed:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`File upload failed: ${response.status}`);
    }

    const data = await response.json();
    return data.id; // Return the upload_file_id
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

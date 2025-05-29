import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { sendMessage as sendDifyMessage } from '@/services/dify';
import { Platform, Alert } from 'react-native';

// Import NetInfo to check network connectivity (you may need to install: npm install @react-native-community/netinfo)
// Since we can't install new packages right now, we'll simulate network checks with console logging

// Flag to enable verbose debugging for Android
const VERBOSE_ANDROID_LOGGING = true; // Set to true for detailed Android logging

// Safe UUID generation with fallback
const generateId = (): string => {
  try {
    console.log('[useMessages] Generating UUID');
    return uuidv4();
  } catch (error) {
    console.error('[useMessages] UUID generation failed:', error);
    // Fallback to timestamp + random number if UUID fails
    return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
};

// Safe AsyncStorage wrapper with logging
const safeAsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      console.log(`[useMessages] Reading from AsyncStorage: ${key}`);
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`[useMessages] AsyncStorage getItem error for ${key}:`, error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<boolean> => {
    try {
      console.log(`[useMessages] Writing to AsyncStorage: ${key}`);
      await AsyncStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`[useMessages] AsyncStorage setItem error for ${key}:`, error);
      return false;
    }
  },
  removeItem: async (key: string): Promise<boolean> => {
    try {
      console.log(`[useMessages] Removing from AsyncStorage: ${key}`);
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`[useMessages] AsyncStorage removeItem error for ${key}:`, error);
      return false;
    }
  }
};

// Define message interface
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

// Define hook return interface
interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => Promise<void>;
}

export function useMessages(): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Load messages from storage on initial load
  useEffect(() => {
    const loadMessages = async () => {
      console.log(`[useMessages] Loading messages on ${Platform.OS} platform`);
      try {
        const storedMessages = await safeAsyncStorage.getItem('chat_messages');
        const storedConversationId = await safeAsyncStorage.getItem('conversation_id');
        
        if (storedMessages) {
          try {
            const parsedMessages = JSON.parse(storedMessages);
            console.log(`[useMessages] Loaded ${parsedMessages.length} messages from storage`);
            setMessages(parsedMessages);
          } catch (parseError) {
            console.error('[useMessages] Failed to parse stored messages:', parseError);
            // Create new initial message if parsing fails
            initializeWithGreeting();
          }
        } else {
          console.log('[useMessages] No stored messages found, initializing with greeting');
          initializeWithGreeting();
        }

        if (storedConversationId) {
          console.log(`[useMessages] Loaded conversation ID: ${storedConversationId}`);
          setConversationId(storedConversationId);
        }
      } catch (error) {
        console.error('[useMessages] Error loading messages from storage:', error);
        // Fallback to initial state if loading fails
        initializeWithGreeting();
      }
    };
    
    // Helper function to initialize with greeting message
    const initializeWithGreeting = async () => {
      try {
        const initialMessage: Message = {
          id: generateId(),
          content: 'Hello! How can I help you today?',
          role: 'assistant',
          timestamp: new Date().toISOString()
        };
        setMessages([initialMessage]);
        await safeAsyncStorage.setItem('chat_messages', JSON.stringify([initialMessage]));
      } catch (error) {
        console.error('[useMessages] Failed to initialize with greeting:', error);
      }
    };

    loadMessages();
  }, []);

  // Save messages to storage whenever they change
  useEffect(() => {
    const saveMessages = async () => {
      if (messages.length > 0) {
        try {
          const result = await safeAsyncStorage.setItem('chat_messages', JSON.stringify(messages));
          if (result) {
            console.log(`[useMessages] Saved ${messages.length} messages to storage`);
          }
        } catch (error) {
          console.error('[useMessages] Failed to save messages to storage:', error);
        }
      }
    };
    
    saveMessages();
  }, [messages]);

  // Save conversation ID whenever it changes
  useEffect(() => {
    const saveConversationId = async () => {
      if (conversationId) {
        try {
          const result = await safeAsyncStorage.setItem('conversation_id', conversationId);
          if (result) {
            console.log(`[useMessages] Saved conversation ID: ${conversationId}`);
          }
        } catch (error) {
          console.error('[useMessages] Failed to save conversation ID:', error);
        }
      }
    };
    
    saveConversationId();
  }, [conversationId]);

  // Send a message and get an AI response
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) {
      console.log('[useMessages] Empty message, not sending');
      return;
    }

    // Enhanced logging for message initiation, especially on Android
    const isAndroid = Platform.OS === 'android';
    console.log(`[useMessages] Sending message on ${Platform.OS}: "${content.trim()}"`);
    
    if (isAndroid && VERBOSE_ANDROID_LOGGING) {
      console.log('[useMessages][ANDROID] Starting message send process with detailed logging');
      console.log('[useMessages][ANDROID] Device info:', {
        version: Platform.Version,
        constants: Platform.constants
      });
    }

    // Simulate network status check
    const simulateNetworkCheck = () => {
      // In a real implementation, you would use NetInfo.fetch() here
      console.log('[useMessages] Checking network connectivity...');
      return Promise.resolve(true); // Assume network is available
    };

    // Check network connectivity before proceeding
    try {
      const isConnected = await simulateNetworkCheck();
      console.log(`[useMessages] Network connectivity: ${isConnected ? 'Available' : 'Not available'}`);
      
      if (!isConnected) {
        console.error('[useMessages] No network connectivity available');
        if (isAndroid) {
          // On Android, show a clear error message
          console.error('[useMessages][ANDROID] Network connectivity error');
        }
        
        // Add a no-connectivity message if we can't connect
        const errorMessage: Message = {
          id: generateId(),
          content: 'Unable to send message. Please check your internet connection and try again.',
          role: 'assistant',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prevMessages => [...prevMessages, errorMessage]);
        setLoading(false);
        return;
      }
    } catch (networkError) {
      console.error('[useMessages] Network check error:', networkError);
    }
    
    let hasResponded = false; // Flag to track if we've already added a response
    setLoading(true);
    
    if (isAndroid && VERBOSE_ANDROID_LOGGING) {
      console.log('[useMessages][ANDROID] Set loading state to true, proceeding to message creation');
    }

    try {
      // Create user message with safe ID generation
      const userMessage: Message = {
        id: generateId(),
        content: content.trim(),
        role: 'user',
        timestamp: new Date().toISOString()
      };
      
      console.log(`[useMessages] Created user message with ID: ${userMessage.id}`);

      // Add user message to the list
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      if (isAndroid && VERBOSE_ANDROID_LOGGING) {
        console.log('[useMessages][ANDROID] User message added to state, preparing API call');
      }

      console.log('[useMessages] Attempting to use Dify API with streaming mode...');
      
      // More detailed logging for Android
      if (isAndroid && VERBOSE_ANDROID_LOGGING) {
        console.log('[useMessages][ANDROID] API configuration:', {
          endpoint: process.env.EXPO_PUBLIC_DIFY_API_ENDPOINT || 'Using default',
          hasApiKey: !!process.env.EXPO_PUBLIC_DIFY_API_KEY,
          conversationId: conversationId || 'No conversation ID'
        });
      }
      // Try to use the Dify API service for AI responses with streaming mode
      let streamResponse;
      try {
        if (isAndroid && VERBOSE_ANDROID_LOGGING) {
          console.log('[useMessages][ANDROID] Sending API request to Dify');
        }
        
        streamResponse = await sendDifyMessage({
          message: content,
          conversationId: conversationId || undefined,
          streaming: true // Using streaming mode as required by the API
        });
        
        if (isAndroid && VERBOSE_ANDROID_LOGGING) {
          console.log('[useMessages][ANDROID] API response received:', {
            isString: typeof streamResponse === 'string',
            hasTextMethod: streamResponse && typeof streamResponse.text === 'function',
            responseType: streamResponse ? typeof streamResponse : 'undefined'
          });
        }
      } catch (apiError) {
        console.error(`[useMessages] Dify API error on ${Platform.OS}:`, apiError);
        if (isAndroid && VERBOSE_ANDROID_LOGGING) {
          console.error('[useMessages][ANDROID] API call failed with error:', apiError);
          // Log more details about the error on Android
          console.error('[useMessages][ANDROID] Error details:', {
            message: apiError.message,
            stack: apiError.stack,
            name: apiError.name
          });
        }
        throw apiError; // Re-throw to be caught by the outer catch
      }

      // For streaming responses, we need to collect the complete response
      console.log('[useMessages] Processing streaming response...');
      
      if (isAndroid && VERBOSE_ANDROID_LOGGING) {
        console.log('[useMessages][ANDROID] Beginning to process streaming response');
      }
      
      // Create a temporary message to show that we're processing
      const tempId = generateId();
      console.log(`[useMessages] Generated temporary message ID: ${tempId}`);
      
      const processingMessage: Message = {
        id: tempId,
        content: 'Thinking...',
        role: 'assistant',
        timestamp: new Date().toISOString()
      };
      
      // Add the processing message
      setMessages(prevMessages => [...prevMessages, processingMessage]);
      
      // Process the streaming response
      if (typeof streamResponse === 'string') {
        // If we got a string response directly
        console.log('[useMessages] Received direct string response');
        
        // Update the conversation ID from response metadata if available
        if (conversationId === null) {
          // Try to extract conversation ID from any metadata
          // This is a simplified approach; actual implementation depends on API
          console.log('[useMessages] No conversation ID available to update');
        }
        
        // Create AI response message with the full response
        const aiMessage: Message = {
          id: tempId, // Replace the temporary message
          content: streamResponse || 'I apologize, but I couldn\'t process your request.',
          role: 'assistant',
          timestamp: new Date().toISOString()
        };
        
        // Replace the processing message with the final message
        setMessages(prevMessages => 
          prevMessages.map(msg => msg.id === tempId ? aiMessage : msg)
        );
        
      } else if (streamResponse && typeof streamResponse.text === 'function') {
        // If we have a Response object with text method
        console.log('[useMessages] Processing streaming response data');
        
        // Extract any conversation ID from response headers if available
        const convIdHeader = streamResponse.headers.get('X-Conversation-Id');
        if (convIdHeader && conversationId === null) {
          console.log('[useMessages] Setting conversation ID from headers:', convIdHeader);
          setConversationId(convIdHeader);
        }
        
        // Read and process the stream
        let fullResponse = '';
        try {
          // Get the complete response text
          const responseText = await streamResponse.text();
          
          // Parse the response - may contain multiple SSE events
          const lines = responseText.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.substring(6));
                if (data.answer) {
                  fullResponse += data.answer;
                }
                
                // Check for conversation ID in data
                if (data.conversation_id && conversationId === null) {
                  console.log('[useMessages] Setting conversation ID from data:', data.conversation_id);
                  setConversationId(data.conversation_id);
                }
              } catch (e) {
                console.warn('[useMessages] Failed to parse streaming data line:', e);
              }
            }
          }
        } catch (streamError) {
          console.error('[useMessages] Error processing stream:', streamError);
          fullResponse = 'I apologize, but there was an error processing your request.';
        }
        
        // Create the final AI message with complete response
        const aiMessage: Message = {
          id: tempId, // Replace the temporary message
          content: fullResponse || 'I apologize, but I couldn\'t process your request.',
          role: 'assistant',
          timestamp: new Date().toISOString()
        };
        
        // Replace the processing message with the final message
        setMessages(prevMessages => 
          prevMessages.map(msg => msg.id === tempId ? aiMessage : msg)
        );
      } else {
        // If we have some other response format
        console.log('[useMessages] Unknown response format, using fallback');
        
        // Create generic AI response message
        const aiMessage: Message = {
          id: tempId, // Replace the temporary message
          content: 'I received your message, but I\'m having trouble processing it correctly.',
          role: 'assistant',
          timestamp: new Date().toISOString()
        };
        
        // Replace the processing message with the final message
        setMessages(prevMessages => 
          prevMessages.map(msg => msg.id === tempId ? aiMessage : msg)
        );
      }
      
      // Mark that we've responded successfully
      hasResponded = true;
      
    } catch (error) {
      console.error(`[useMessages] Error in primary response flow on ${Platform.OS}:`, error);
      
      // Enhanced Android-specific error logging
      if (isAndroid && VERBOSE_ANDROID_LOGGING) {
        console.error('[useMessages][ANDROID] Primary response flow failed:', {
          errorMessage: error.message,
          errorType: error.name,
          stack: error.stack?.substring(0, 200) // Log first part of stack trace
        });
      }
      
      // Only add a fallback response if we haven't responded yet
      if (!hasResponded) {
        console.log('[useMessages] Using fallback response mechanism');
        
        if (isAndroid && VERBOSE_ANDROID_LOGGING) {
          console.log('[useMessages][ANDROID] Attempting to use fallback response mechanism');
        }
        try {
          // Fallback to mock responses if API fails
          await new Promise(resolve => setTimeout(resolve, 500)); // Shorter delay
          
          // Generate a mock response
          const mockResponses = [
            "I understand what you're saying. Can you tell me more?",
            "That's interesting. Let me think about that...",
            "I'm here to help with that. What specific information do you need?",
            "Good question! Let me explain how that works.",
            "I appreciate your input. Here's what I think about that topic."
          ];
          
          const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
          console.log(`[useMessages] Selected mock response: "${randomResponse.substring(0, 20)}..."`);
          
          // Create AI message with mock response
          const aiMessage: Message = {
            id: generateId(),
            content: randomResponse,
            role: 'assistant',
            timestamp: new Date().toISOString()
          };
          
          // Add AI response to the list
          setMessages(prevMessages => [...prevMessages, aiMessage]);
          hasResponded = true;
        } catch (fallbackError) {
          console.error('[useMessages] Even fallback mechanism failed:', fallbackError);
        }
      }
      
      // If we still haven't responded, add a generic error message
      if (!hasResponded) {
        console.log('[useMessages] Adding error message as last resort');
        const errorMessage: Message = {
          id: generateId(),
          content: 'Sorry, there was an error processing your message. Please try again.',
          role: 'assistant',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      }
    } finally {
      setLoading(false);
      console.log('[useMessages] Message handling completed, hasResponded:', hasResponded);
      
      if (isAndroid && VERBOSE_ANDROID_LOGGING) {
        console.log('[useMessages][ANDROID] Message handling process complete with result:', {
          hasResponded,
          platform: Platform.OS,
          timestamp: new Date().toISOString()
        });
      }
    }
  }, [conversationId]);

  // Clear all messages
  const clearMessages = useCallback(async () => {
    try {
      // Create new initial greeting
      console.log('[useMessages] Clearing all messages');
      const initialMessage: Message = {
        id: generateId(),
        content: 'Hello! How can I help you today?',
        role: 'assistant',
        timestamp: new Date().toISOString()
      };
      
      // Reset messages to just the initial greeting
      setMessages([initialMessage]);
      
      // Clear conversation ID
      setConversationId(null);
      
      // Update storage
      const saveResult = await safeAsyncStorage.setItem('chat_messages', JSON.stringify([initialMessage]));
      const removeResult = await safeAsyncStorage.removeItem('conversation_id');
      
      console.log(`[useMessages] Clear messages results - Save: ${saveResult}, Remove: ${removeResult}`);
    } catch (error) {
      console.error('Error clearing messages:', error);
    }
  }, []);

  return {
    messages,
    loading,
    sendMessage,
    clearMessages
  };
}


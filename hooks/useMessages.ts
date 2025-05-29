import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { sendMessage as sendDifyMessage } from '@/services/dify';

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
      try {
        const storedMessages = await AsyncStorage.getItem('chat_messages');
        const storedConversationId = await AsyncStorage.getItem('conversation_id');
        
        if (storedMessages) {
          setMessages(JSON.parse(storedMessages));
        } else {
          // Add initial greeting message if no stored messages
          const initialMessage: Message = {
            id: uuidv4(),
            content: 'Hello! How can I help you today?',
            role: 'assistant',
            timestamp: new Date().toISOString()
          };
          setMessages([initialMessage]);
          await AsyncStorage.setItem('chat_messages', JSON.stringify([initialMessage]));
        }

        if (storedConversationId) {
          setConversationId(storedConversationId);
        }
      } catch (error) {
        console.error('Error loading messages from storage:', error);
      }
    };

    loadMessages();
  }, []);

  // Save messages to storage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      AsyncStorage.setItem('chat_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Save conversation ID whenever it changes
  useEffect(() => {
    if (conversationId) {
      AsyncStorage.setItem('conversation_id', conversationId);
    }
  }, [conversationId]);

  // Send a message and get an AI response
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    console.log(`[useMessages] Sending message: "${content.trim()}"`);

    // Create user message
    const userMessage: Message = {
      id: uuidv4(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date().toISOString()
    };

    // Add user message to the list
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setLoading(true);

    let hasResponded = false; // Flag to track if we've already added a response

    try {
      console.log('[useMessages] Attempting to use Dify API with streaming mode...');
      // Try to use the Dify API service for AI responses with streaming mode
      const streamResponse = await sendDifyMessage({
        message: content,
        conversationId: conversationId || undefined,
        streaming: true // Using streaming mode as required by the API
      }).catch(error => {
        console.error('[useMessages] Dify API error:', error);
        throw error; // Re-throw to be caught by the outer catch
      });

      // For streaming responses, we need to collect the complete response
      console.log('[useMessages] Processing streaming response...');
      
      // Create a temporary message to show that we're processing
      const tempId = uuidv4();
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
      console.error('[useMessages] Error in primary response flow:', error);
      
      // Only add a fallback response if we haven't responded yet
      if (!hasResponded) {
        console.log('[useMessages] Using fallback response mechanism');
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
            id: uuidv4(),
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
          id: uuidv4(),
          content: 'Sorry, there was an error processing your message. Please try again.',
          role: 'assistant',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      }
    } finally {
      setLoading(false);
      console.log('[useMessages] Message handling completed, hasResponded:', hasResponded);
    }
  }, [conversationId]);

  // Clear all messages
  const clearMessages = useCallback(async () => {
    try {
      // Create new initial greeting
      const initialMessage: Message = {
        id: uuidv4(),
        content: 'Hello! How can I help you today?',
        role: 'assistant',
        timestamp: new Date().toISOString()
      };
      
      // Reset messages to just the initial greeting
      setMessages([initialMessage]);
      
      // Clear conversation ID
      setConversationId(null);
      
      // Update storage
      await AsyncStorage.setItem('chat_messages', JSON.stringify([initialMessage]));
      await AsyncStorage.removeItem('conversation_id');
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


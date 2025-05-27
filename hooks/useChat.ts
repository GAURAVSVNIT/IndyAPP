import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { Audio } from 'expo-av';

// This is a mock implementation. In a real app, you would fetch data from Firebase
export function useChat(chatId: string) {
  const { user } = useAuth();
  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<{ recording: Audio.Recording | null; duration: number }>({
    recording: null,
    duration: 0
  });
  
  // Timer for recording duration
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);

  // Mock data for the specific chat
  const mockChat = {
    id: chatId,
    name: chatId === '1' ? 'Alice Johnson' : 
          chatId === '2' ? 'Project Team' : 
          'John Smith',
    participantId: chatId,
    participantImage: chatId === '1' ? 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' : 
                      chatId === '3' ? 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' : 
                      null,
    groupImage: chatId === '2' ? 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' : null,
    online: chatId === '1',
    isGroup: chatId === '2' || chatId === '4',
    participantsCount: chatId === '2' ? 5 : chatId === '4' ? 8 : 2,
  };

  // Mock messages for the chat
  const generateMockMessages = () => {
    const baseMessages = [
      {
        id: '1',
        content: 'Hey there! How are you doing?',
        senderId: chatId === '1' ? 'user1' : 'currentUser',
        senderName: chatId === '1' ? 'Alice Johnson' : 'You',
        senderAvatar: chatId === '1' ? 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' : null,
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        type: 'text',
        isConsecutive: false
      },
      {
        id: '2',
        content: 'I\'m good, thanks for asking! How about you?',
        senderId: 'currentUser',
        senderName: 'You',
        senderAvatar: null,
        timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
        type: 'text',
        isConsecutive: false
      },
      {
        id: '3',
        content: 'I\'m doing well! Just working on that project we discussed last week.',
        senderId: chatId === '1' ? 'user1' : 'currentUser',
        senderName: chatId === '1' ? 'Alice Johnson' : 'You',
        senderAvatar: chatId === '1' ? 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' : null,
        timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
        type: 'text',
        isConsecutive: true
      },
      {
        id: '4',
        content: 'By the way, have you seen the latest update?',
        senderId: chatId === '1' ? 'user1' : 'currentUser',
        senderName: chatId === '1' ? 'Alice Johnson' : 'You',
        senderAvatar: chatId === '1' ? 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' : null,
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        type: 'text',
        isConsecutive: true
      },
      {
        id: '5',
        content: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        senderId: 'currentUser',
        senderName: 'You',
        senderAvatar: null,
        timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        type: 'image',
        isConsecutive: false
      },
      {
        id: '6',
        content: 'Looks great! When can we meet to discuss it further?',
        senderId: chatId === '1' ? 'user1' : 'currentUser',
        senderName: chatId === '1' ? 'Alice Johnson' : 'You',
        senderAvatar: chatId === '1' ? 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' : null,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        type: 'text',
        isConsecutive: false
      },
      {
        id: '7',
        content: 'https://example.com/audio.mp3', // Fake URL for mock
        senderId: 'currentUser',
        senderName: 'You',
        senderAvatar: null,
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        type: 'voice',
        duration: '0:15',
        isConsecutive: false
      },
      {
        id: '8',
        content: 'How about tomorrow at 10 AM?',
        senderId: 'currentUser',
        senderName: 'You',
        senderAvatar: null,
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        type: 'text',
        isConsecutive: false
      },
      {
        id: '9',
        content: 'Sounds good to me! I\'ll set up the meeting and send you an invite.',
        senderId: chatId === '1' ? 'user1' : 'currentUser',
        senderName: chatId === '1' ? 'Alice Johnson' : 'You',
        senderAvatar: chatId === '1' ? 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' : null,
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        type: 'text',
        isConsecutive: false
      }
    ];

    // If it's a group chat, add some messages from other participants
    if (mockChat.isGroup) {
      baseMessages.push(
        {
          id: '10',
          content: 'Hey everyone, I just joined the team!',
          senderId: 'user2',
          senderName: 'John Smith',
          senderAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
          type: 'text',
          isConsecutive: false
        },
        {
          id: '11',
          content: 'Welcome to the team, John!',
          senderId: 'user3',
          senderName: 'Sarah Wilson',
          senderAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          timestamp: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
          type: 'text',
          isConsecutive: false
        }
      );
    }

    // Sort messages by timestamp
    return baseMessages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  const fetchChat = async () => {
    setLoading(true);
    
    try {
      // In a real app, you would fetch from Firebase
      // For now, use mock data
      setTimeout(() => {
        setChat(mockChat);
        setMessages(generateMockMessages());
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching chat:', error);
      setLoading(false);
    }
  };

  const sendMessage = (content: string, type: 'text' | 'image' | 'voice') => {
    const newMessage = {
      id: Date.now().toString(),
      content,
      senderId: 'currentUser',
      senderName: 'You',
      senderAvatar: null,
      timestamp: new Date().toISOString(),
      type,
      isConsecutive: false
    };

    // Check if the last message was from the same sender to set isConsecutive
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.senderId === 'currentUser') {
        newMessage.isConsecutive = true;
      }
    }

    // In a real app, you would send this to Firebase
    // For now, just update the local state
    setMessages(prevMessages => [...prevMessages, newMessage]);
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording({ recording, duration: 0 });
      setIsRecording(true);
      
      // Start a timer to track recording duration
      const timer = setInterval(() => {
        setRecording(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
      
      setRecordingTimer(timer);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recording.recording) return;
    
    try {
      await recording.recording.stopAndUnloadAsync();
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
      
      const uri = recording.recording.getURI();
      setIsRecording(false);
      
      if (uri) {
        // In a real app, you would upload this file to Firebase Storage
        // and then send the URL as a message
        sendMessage(uri, 'voice');
      }
      
      setRecording({ recording: null, duration: 0 });
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  useEffect(() => {
    if (user && chatId) {
      fetchChat();
    }
    
    return () => {
      // Clean up recording when unmounting
      if (recording.recording) {
        recording.recording.stopAndUnloadAsync();
      }
      
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
    };
  }, [user, chatId]);

  return {
    chat,
    messages,
    loading,
    sendMessage,
    isRecording,
    recording,
    startRecording,
    stopRecording,
  };
}
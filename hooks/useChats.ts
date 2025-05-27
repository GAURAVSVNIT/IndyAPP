import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { firestore } from '@/config/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

// This is a mock implementation. In a real app, you would fetch data from Firebase
export function useChats() {
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for development
  const mockChats = [
    {
      id: '1',
      name: 'Alice Johnson',
      participantImage: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      lastMessage: 'Hey there! How are you doing?',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      unreadCount: 2,
      online: true,
      isGroup: false,
      lastMessageType: 'text'
    },
    {
      id: '2',
      name: 'Project Team',
      groupImage: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      lastMessage: 'Let\'s meet tomorrow at 10 AM',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      unreadCount: 0,
      online: false,
      isGroup: true,
      lastMessageType: 'text'
    },
    {
      id: '3',
      name: 'John Smith',
      participantImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      lastMessage: '',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      unreadCount: 0,
      online: false,
      isGroup: false,
      lastMessageType: 'voice'
    },
    {
      id: '4',
      name: 'Marketing Group',
      groupImage: null,
      lastMessage: 'The new campaign looks great!',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      unreadCount: 5,
      online: false,
      isGroup: true,
      lastMessageType: 'text'
    },
    {
      id: '5',
      name: 'Sarah Wilson',
      participantImage: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      lastMessage: 'Can you send me the document?',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      unreadCount: 0,
      online: true,
      isGroup: false,
      lastMessageType: 'text'
    }
  ];

  const fetchChats = async () => {
    setLoading(true);
    
    try {
      // In a real app, you would fetch from Firebase
      // const chatQuery = query(
      //   collection(firestore, 'chats'),
      //   where('participants', 'array-contains', user?.uid),
      //   orderBy('lastMessageTime', 'desc')
      // );
      
      // const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      //   const chatData = snapshot.docs.map((doc) => ({
      //     id: doc.id,
      //     ...doc.data()
      //   }));
      //   setChats(chatData);
      //   setLoading(false);
      // });
      
      // For now, use mock data
      setTimeout(() => {
        setChats(mockChats);
        setLoading(false);
      }, 1000);
      
      // return unsubscribe;
    } catch (error) {
      console.error('Error fetching chats:', error);
      setLoading(false);
    }
  };

  const refreshChats = async () => {
    setRefreshing(true);
    await fetchChats();
    setRefreshing(false);
  };

  useEffect(() => {
    if (user) {
      fetchChats();
    }
    
    // Cleanup function
    // return () => {
    //   if (unsubscribe) {
    //     unsubscribe();
    //   }
    // };
  }, [user]);

  // Filter chats based on search query
  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    chats: filteredChats,
    loading,
    refreshing,
    searchQuery,
    setSearchQuery,
    fetchChats,
    refreshChats
  };
}
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

// This is a mock implementation. In a real app, you would fetch data from Firebase
export function useContacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for development
  const mockContacts = [
    {
      id: '1',
      name: 'Alice Johnson',
      avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      status: 'Available for chat',
      online: true,
    },
    {
      id: '2',
      name: 'John Smith',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      status: 'In a meeting',
      online: false,
    },
    {
      id: '3',
      name: 'Sarah Wilson',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      status: 'Working from home today',
      online: true,
    },
    {
      id: '4',
      name: 'Michael Brown',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      status: 'Busy',
      online: false,
    },
    {
      id: '5',
      name: 'Emma Davis',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      status: 'On vacation until next week',
      online: false,
    }
  ];

  const mockGroups = [
    {
      id: 'g1',
      name: 'Project Team',
      avatar: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      membersCount: 5,
    },
    {
      id: 'g2',
      name: 'Marketing Group',
      avatar: null,
      membersCount: 8,
    },
    {
      id: 'g3',
      name: 'Friends Hangout',
      avatar: 'https://images.pexels.com/photos/7149165/pexels-photo-7149165.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      membersCount: 12,
    }
  ];

  const fetchContacts = async () => {
    setLoading(true);
    
    try {
      // In a real app, you would fetch from Firebase
      // const contactsQuery = query(
      //   collection(firestore, 'contacts'),
      //   where('userId', '==', user?.uid)
      // );
      
      // For now, use mock data
      setTimeout(() => {
        setContacts(mockContacts);
        setGroups(mockGroups);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setLoading(false);
    }
  };

  const refreshContacts = async () => {
    setRefreshing(true);
    await fetchContacts();
    setRefreshing(false);
  };

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  // Filter contacts and groups based on search query
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    contacts: filteredContacts,
    groups: filteredGroups,
    loading,
    refreshing,
    searchQuery,
    setSearchQuery,
    refreshContacts
  };
}
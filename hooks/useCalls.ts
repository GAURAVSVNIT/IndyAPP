import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

// This is a mock implementation. In a real app, you would fetch data from Firebase
export function useCalls() {
  const { user } = useAuth();
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for development
  const mockCalls = [
    {
      id: '1',
      name: 'Alice Johnson',
      participantImage: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      time: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      duration: '3:45',
      incoming: true,
      missed: false,
      videoCall: false
    },
    {
      id: '2',
      name: 'John Smith',
      participantImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      duration: '0:00',
      incoming: false,
      missed: true,
      videoCall: true
    },
    {
      id: '3',
      name: 'Sarah Wilson',
      participantImage: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      duration: '12:08',
      incoming: false,
      missed: false,
      videoCall: false
    },
    {
      id: '4',
      name: 'Michael Brown',
      participantImage: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      duration: '1:23',
      incoming: true,
      missed: false,
      videoCall: true
    },
    {
      id: '5',
      name: 'Emma Davis',
      participantImage: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      duration: '0:00',
      incoming: true,
      missed: true,
      videoCall: false
    }
  ];

  const fetchCalls = async () => {
    setLoading(true);
    
    try {
      // In a real app, you would fetch from Firebase
      // const callsQuery = query(
      //   collection(firestore, 'calls'),
      //   where('participants', 'array-contains', user?.uid),
      //   orderBy('time', 'desc')
      // );
      
      // For now, use mock data
      setTimeout(() => {
        setCalls(mockCalls);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching calls:', error);
      setLoading(false);
    }
  };

  const refreshCalls = async () => {
    setRefreshing(true);
    await fetchCalls();
    setRefreshing(false);
  };

  useEffect(() => {
    if (user) {
      fetchCalls();
    }
  }, [user]);

  return {
    calls,
    loading,
    refreshing,
    refreshCalls
  };
}
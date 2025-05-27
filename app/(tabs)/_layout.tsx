import { Tabs } from 'expo-router';
import { Chrome as Home, User, Phone, MessageSquare } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#ffffff',
        borderTopColor: '#e5e5e5',
        height: Platform.OS === 'ios' ? 88 : 60,
        paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        paddingTop: 8,
      },
      tabBarActiveTintColor: '#0A84FF',
      tabBarInactiveTintColor: '#8E8E93',
      tabBarLabelStyle: {
        fontFamily: 'Inter500',
        fontSize: 12,
      },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <MessageSquare size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calls"
        options={{
          title: 'Calls',
          tabBarIcon: ({ color, size }) => (
            <Phone size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
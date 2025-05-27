import { Tabs } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { MessageSquare, Users, Phone, Settings } from 'lucide-react-native';
import TabBarIcon from '@/components/navigation/TabBarIcon';

export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.text.secondary,
        tabBarStyle: { 
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTitleStyle: {
          fontFamily: 'Inter-Bold',
          fontSize: 18,
          color: theme.text.primary,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon Icon={MessageSquare} color={color} size={size} />
          ),
          headerTitle: 'Messages',
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon Icon={Users} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="calls"
        options={{
          title: 'Calls',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon Icon={Phone} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon Icon={Settings} color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
import { Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function AppLayout() {
  const { user, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace('/(auth)/login');
    }
  }, [isInitialized, user]);

  if (!isInitialized) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="chat/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="user/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="group/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="call/[id]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="settings/theme" />
      <Stack.Screen name="settings/privacy" />
      <Stack.Screen name="settings/notifications" />
    </Stack>
  );
}
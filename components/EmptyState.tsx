import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { MessageSquare, User, Phone } from 'lucide-react-native';

interface EmptyStateProps {
  icon: 'message-square' | 'user' | 'phone';
  title: string;
  message: string;
  loading?: boolean;
}

export default function EmptyState({ icon, title, message, loading }: EmptyStateProps) {
  const { theme } = useTheme();
  
  const renderIcon = () => {
    const iconSize = 60;
    const iconColor = theme.text.tertiary;
    
    switch (icon) {
      case 'message-square':
        return <MessageSquare size={iconSize} color={iconColor} />;
      case 'user':
        return <User size={iconSize} color={iconColor} />;
      case 'phone':
        return <Phone size={iconSize} color={iconColor} />;
      default:
        return <MessageSquare size={iconSize} color={iconColor} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} />
        ) : (
          renderIcon()
        )}
        <Text style={[styles.title, { color: theme.text.primary }]}>
          {title}
        </Text>
        <Text style={[styles.message, { color: theme.text.secondary }]}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 300,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 22,
  },
});
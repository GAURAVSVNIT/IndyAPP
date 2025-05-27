import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface LogoProps {
  size?: number;
}

export function Logo({ size = 50 }: LogoProps) {
  const { theme } = useTheme();

  return (
    <View style={[
      styles.container, 
      { 
        width: size, 
        height: size, 
        borderRadius: size / 2,
        backgroundColor: theme.primary 
      }
    ]}>
      <MessageSquare size={size * 0.5} color="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
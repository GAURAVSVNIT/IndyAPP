import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface AvatarProps {
  uri?: string;
  name: string;
  size?: number;
  online?: boolean;
  isGroup?: boolean;
  style?: any;
}

export default function Avatar({ uri, name, size = 40, online, isGroup, style }: AvatarProps) {
  const { theme } = useTheme();
  
  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return '?';
    
    const words = name.split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    } else {
      return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    }
  };
  
  // Generate a deterministic color from the name
  const getAvatarColor = (name: string) => {
    const colors = [
      '#0A84FF', // Blue
      '#5E5CE6', // Indigo
      '#BF5AF2', // Purple
      '#FF2D55', // Pink
      '#FF9F0A', // Orange
      '#30D158', // Green
      '#64D2FF', // Teal
      '#5856D6', // Violet
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <View style={[styles.container, style]}>
      {uri ? (
        <Image 
          source={{ uri }} 
          style={[
            styles.image, 
            { 
              width: size, 
              height: size, 
              borderRadius: isGroup ? size / 4 : size / 2,
              borderColor: theme.border,
            }
          ]} 
        />
      ) : (
        <View 
          style={[
            styles.placeholder, 
            { 
              width: size, 
              height: size, 
              borderRadius: isGroup ? size / 4 : size / 2,
              backgroundColor: getAvatarColor(name),
            }
          ]}
        >
          <Text style={[styles.initials, { fontSize: size / 2.5 }]}>
            {getInitials(name)}
          </Text>
        </View>
      )}
      
      {online && (
        <View 
          style={[
            styles.onlineIndicator, 
            { 
              width: size / 4, 
              height: size / 4, 
              borderWidth: size > 40 ? 2 : 1,
              backgroundColor: theme.success,
              borderColor: theme.background
            }
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 12,
  },
});
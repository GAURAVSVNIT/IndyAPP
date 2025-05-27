import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface TabBarIconProps {
  Icon: LucideIcon;
  color: string;
  size: number;
  focused?: boolean;
}

export default function TabBarIcon({ Icon, color, size, focused }: TabBarIconProps) {
  return (
    <View style={styles.container}>
      <Icon size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, Theme } from '@/constants/theme';

interface ThemeContextProps {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  themeMode: 'light' | 'dark' | 'system';
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: themes.light,
  isDark: false,
  toggleTheme: () => {},
  setThemeMode: () => {},
  themeMode: 'system',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
  
  const [theme, setTheme] = useState<Theme>(
    systemColorScheme === 'dark' ? themes.dark : themes.light
  );
  
  const isDark = theme === themes.dark;
  
  useEffect(() => {
    // Load saved theme preference
    AsyncStorage.getItem('themeMode').then(savedThemeMode => {
      if (savedThemeMode) {
        setThemeMode(savedThemeMode as 'light' | 'dark' | 'system');
      }
    });
  }, []);
  
  useEffect(() => {
    // Apply theme based on mode
    if (themeMode === 'system') {
      setTheme(systemColorScheme === 'dark' ? themes.dark : themes.light);
    } else {
      setTheme(themeMode === 'dark' ? themes.dark : themes.light);
    }
    
    // Save theme preference
    AsyncStorage.setItem('themeMode', themeMode);
  }, [themeMode, systemColorScheme]);
  
  const toggleTheme = () => {
    if (themeMode === 'system') {
      setThemeMode(systemColorScheme === 'dark' ? 'light' : 'dark');
    } else {
      setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setThemeMode, themeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
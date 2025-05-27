export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  backgroundSecondary: string;
  border: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    placeholder: string;
  };
}

export const themes: { light: Theme; dark: Theme } = {
  light: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    accent: '#BF5AF2',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    background: '#FFFFFF',
    backgroundSecondary: '#F2F2F7',
    border: '#D1D1D6',
    text: {
      primary: '#000000',
      secondary: '#3C3C43',
      tertiary: '#8E8E93',
      placeholder: '#C7C7CC',
    },
  },
  dark: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    accent: '#BF5AF2',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    background: '#1C1C1E',
    backgroundSecondary: '#2C2C2E',
    border: '#38383A',
    text: {
      primary: '#FFFFFF',
      secondary: '#EBEBF5',
      tertiary: '#8E8E93',
      placeholder: '#636366',
    },
  },
};
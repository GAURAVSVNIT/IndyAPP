import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'IndyChat',
  slug: 'indychat',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'indychat',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/images/icon.png', // Fallback to icon.png since splash.png is missing
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.yourcompany.indychat'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.yourcompany.indychat'
  },
  web: {
    favicon: './assets/images/favicon.png',
    bundler: 'metro'
  },
  extra: {
    EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    EXPO_PUBLIC_DIFY_API_KEY: process.env.EXPO_PUBLIC_DIFY_API_KEY,
    EXPO_PUBLIC_DIFY_API_ENDPOINT: process.env.EXPO_PUBLIC_DIFY_API_ENDPOINT,
    EXPO_PUBLIC_ELEVENLABS_API_KEY: process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY,
  },
  plugins: [
    'expo-router',
    [
      'expo-av',
      {
        microphonePermission: 'Allow IndyChat to access your microphone.'
      }
    ]
  ]
});
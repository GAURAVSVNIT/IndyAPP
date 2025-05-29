import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'IndyApp',
  slug: 'indyapp',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'indyapp',
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
    bundleIdentifier: 'com.yourcompany.indyapp'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.yourcompany.indyapp',
    permissions: [
      "INTERNET",
      "ACCESS_NETWORK_STATE"
    ]
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
        microphonePermission: 'Allow IndyApp to access your microphone.'
      }
    ],
    [
      'expo-build-properties',
      {
        android: {
          googleServicesFile: './google-services.json',
        },
      },
    ],
    'expo-firebase-core',
    'expo-font',
    'expo-web-browser'
  ]
});
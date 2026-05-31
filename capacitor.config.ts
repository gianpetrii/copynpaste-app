import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.copynpaste.mobile',
  appName: 'CopyNPaste',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false,
    },
  },
  ios: {
    scheme: 'CopyNPaste',
    contentInset: 'automatic',
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.toolsverse.app',
  appName: 'ToolsVerse',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  android: {
    path: 'android'
  }
};

export default config;

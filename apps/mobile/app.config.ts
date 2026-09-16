import type { ExpoConfig } from 'expo/config';

const environment = process.env.EXPO_PUBLIC_APP_ENV ?? 'development';

if (!['development', 'staging', 'production'].includes(environment)) {
  throw new Error('EXPO_PUBLIC_APP_ENV inválido.');
}

if (environment !== 'development') {
  throw new Error('Staging e production ainda não foram provisionados ou autorizados.');
}

const config: ExpoConfig = {
  name: 'Projeto Match Alvinegro',
  slug: 'social-foundation',
  version: '0.0.0',
  platforms: ['android', 'ios'],
  userInterfaceStyle: 'light',
  android: {
    permissions: [],
    blockedPermissions: [
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_BACKGROUND_LOCATION',
    ],
  },
  ios: { supportsTablet: false },
  extra: { environment },
};

export default config;

import { Platform } from 'react-native';
import Constants from 'expo-constants';

const DEFAULT_BACKEND_PORT = '8001';

const normalizeUrl = (url: string): string => url.replace(/\/+$/, '');

const getHostFromExpo = (): string | null => {
  const constants = Constants as unknown as {
    expoConfig?: { hostUri?: string };
    expoGoConfig?: { debuggerHost?: string };
  };

  const hostUri = constants.expoConfig?.hostUri || constants.expoGoConfig?.debuggerHost;
  if (!hostUri) {
    return null;
  }

  return hostUri.split(':')[0] || null;
};

export const getBackendUrl = (): string => {
  const explicitUrl = process.env.EXPO_PUBLIC_BACKEND_URL?.trim();
  if (explicitUrl) {
    return normalizeUrl(explicitUrl);
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    return `http://${window.location.hostname}:${DEFAULT_BACKEND_PORT}`;
  }

  const expoHost = getHostFromExpo();
  if (expoHost) {
    return `http://${expoHost}:${DEFAULT_BACKEND_PORT}`;
  }

  return `http://localhost:${DEFAULT_BACKEND_PORT}`;
};

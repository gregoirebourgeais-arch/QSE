import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendUrl } from './backendUrl';

const BACKEND_URL_KEY = 'backend_url_override';

let currentBackendUrl = getBackendUrl();

const normalizeUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) {
    return '';
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
  return withProtocol.replace(/\/+$/, '');
};

export const initializeBackendUrlConfig = async (): Promise<string> => {
  try {
    const saved = await AsyncStorage.getItem(BACKEND_URL_KEY);
    if (saved) {
      currentBackendUrl = normalizeUrl(saved);
    }
  } catch (e) {
    console.log('Could not load backend override URL');
  }

  return currentBackendUrl;
};

export const getCurrentBackendUrl = (): string => currentBackendUrl;

export const setBackendUrlOverride = async (url: string): Promise<string> => {
  const normalized = normalizeUrl(url);
  if (!normalized) {
    throw new Error('URL backend vide');
  }

  await AsyncStorage.setItem(BACKEND_URL_KEY, normalized);
  currentBackendUrl = normalized;
  return currentBackendUrl;
};

export const clearBackendUrlOverride = async (): Promise<void> => {
  await AsyncStorage.removeItem(BACKEND_URL_KEY);
  currentBackendUrl = getBackendUrl();
};

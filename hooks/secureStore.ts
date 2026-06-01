import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

async function getNativeModule(): Promise<any> {
  return await import('expo-secure-store');
}

export const secureStore = {
  async getItemAsync(key: string): Promise<string | null> {
    if (isWeb) return localStorage.getItem(key);
    const store = await getNativeModule();
    return store.getItemAsync(key);
  },
  async setItemAsync(key: string, value: string): Promise<void> {
    if (isWeb) { localStorage.setItem(key, value); return; }
    const store = await getNativeModule();
    return store.setItemAsync(key, value);
  },
  async deleteItemAsync(key: string): Promise<void> {
    if (isWeb) { localStorage.removeItem(key); return; }
    const store = await getNativeModule();
    return store.deleteItemAsync(key);
  },
};

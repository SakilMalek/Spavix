interface StorageItem {
  data: any;
  timestamp: number;
  ttl?: number;
}

class StorageManager {
  private prefix = 'spavix_';

  setItem(key: string, value: any, ttlMinutes?: number) {
    try {
      const item: StorageItem = {
        data: value,
        timestamp: Date.now(),
        ttl: ttlMinutes ? ttlMinutes * 60 * 1000 : undefined,
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to set item in localStorage:', error);
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const parsed: StorageItem = JSON.parse(item);

      // Check if item has expired
      if (parsed.ttl && Date.now() - parsed.timestamp > parsed.ttl) {
        this.removeItem(key);
        return null;
      }

      return parsed.data as T;
    } catch (error) {
      console.error('Failed to get item from localStorage:', error);
      return null;
    }
  }

  removeItem(key: string) {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Failed to remove item from localStorage:', error);
    }
  }

  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  getAllItems(): Record<string, any> {
    try {
      const items: Record<string, any> = {};
      const keys = Object.keys(localStorage);

      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          const cleanKey = key.replace(this.prefix, '');
          const item = this.getItem(cleanKey);
          if (item !== null) {
            items[cleanKey] = item;
          }
        }
      });

      return items;
    } catch (error) {
      console.error('Failed to get all items from localStorage:', error);
      return {};
    }
  }

  getStorageSize(): number {
    try {
      let size = 0;
      const keys = Object.keys(localStorage);

      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          size += localStorage.getItem(key)?.length || 0;
        }
      });

      return size;
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
      return 0;
    }
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  onOnline(callback: () => void) {
    window.addEventListener('online', callback);
    return () => window.removeEventListener('online', callback);
  }

  onOffline(callback: () => void) {
    window.addEventListener('offline', callback);
    return () => window.removeEventListener('offline', callback);
  }
}

export const storage = new StorageManager();

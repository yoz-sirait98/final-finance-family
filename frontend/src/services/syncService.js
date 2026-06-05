import { get, set, update, del, entries } from 'idb-keyval';
import api from './api';

const SYNC_STORE = 'offline_transactions';

export const syncService = {
  async saveOfflineTransaction(transaction) {
    const id = `temp_${Date.now()}`;
    await set(id, { ...transaction, id, _status: 'pending' });
    
    // Register background sync if supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const sw = await navigator.serviceWorker.ready;
      try {
        await sw.sync.register('sync-transactions');
      } catch (e) {
        console.warn('Background sync could not be registered', e);
      }
    }
    
    return id;
  },

  async syncPendingTransactions() {
    const pending = await entries();
    if (!pending.length) return;

    for (const [key, tx] of pending) {
      if (tx._status === 'pending') {
        try {
          const payload = { ...tx };
          delete payload.id;
          delete payload._status;

          await api.post('/transactions', payload);
          await del(key);
        } catch (error) {
          console.error(`Failed to sync transaction ${key}`, error);
        }
      }
    }
  }
};

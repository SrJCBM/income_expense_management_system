import { useCallback, useEffect, useState } from 'react';
import offlineQueueService, {
  OFFLINE_QUEUE_CHANGE_EVENT,
} from '../services/offlineQueueService.js';

export const useOfflineQueue = (type) => {
  const [pendingItems, setPendingItems] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueError, setQueueError] = useState(null);

  const refreshPending = useCallback(async () => {
    try {
      const items = await offlineQueueService.listPending(type);
      setPendingItems(items);
      setQueueError(null);
    } catch (error) {
      setQueueError(error.message);
    }
  }, [type]);

  useEffect(() => {
    refreshPending();
    window.addEventListener(OFFLINE_QUEUE_CHANGE_EVENT, refreshPending);

    return () => {
      window.removeEventListener(OFFLINE_QUEUE_CHANGE_EVENT, refreshPending);
    };
  }, [refreshPending]);

  const enqueueCreate = async (payload) => {
    const item = await offlineQueueService.enqueueCreate(type, payload);
    await refreshPending();
    return item;
  };

  const updatePending = async (localId, payload) => {
    await offlineQueueService.updatePending(localId, {
      payload,
      status: 'pending',
      error: null,
    });
    await refreshPending();
  };

  const discardPending = async (localId) => {
    await offlineQueueService.deletePending(localId);
    await refreshPending();
  };

  const syncOne = async (item, createFn) => {
    await offlineQueueService.updatePending(item.localId, { status: 'syncing', error: null });
    await refreshPending();

    try {
      await createFn({
        ...item.payload,
        clientRequestId: item.clientRequestId,
      });
      await offlineQueueService.deletePending(item.localId);
      await refreshPending();
      return true;
    } catch (error) {
      await offlineQueueService.markFailed(item.localId, error);
      await refreshPending();
      return false;
    }
  };

  const retryPending = async (item, createFn) => syncOne(item, createFn);

  const syncAll = async (createFn) => {
    setIsSyncing(true);
    setQueueError(null);
    try {
      const items = await offlineQueueService.listPending(type);
      for (const item of items) {
        await syncOne(item, createFn);
      }
    } catch (error) {
      setQueueError(error.message);
    } finally {
      setIsSyncing(false);
      await refreshPending();
    }
  };

  return {
    pendingItems,
    isSyncing,
    queueError,
    enqueueCreate,
    updatePending,
    discardPending,
    retryPending,
    syncAll,
    refreshPending,
  };
};

export default useOfflineQueue;

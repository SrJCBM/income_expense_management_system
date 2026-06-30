const DB_NAME = 'financeapp-offline';
const DB_VERSION = 1;
const STORE_NAME = 'pendingOperations';
export const OFFLINE_QUEUE_CHANGE_EVENT = 'financeapp-offline-queue-change';

const canUseIndexedDB = () => typeof window !== 'undefined' && 'indexedDB' in window;

const emitQueueChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OFFLINE_QUEUE_CHANGE_EVENT));
  }
};

const createLocalId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const openDatabase = () => new Promise((resolve, reject) => {
  if (!canUseIndexedDB()) {
    reject(new Error('IndexedDB no esta disponible en este navegador.'));
    return;
  }

  const request = window.indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'localId' });
      store.createIndex('type', 'type', { unique: false });
      store.createIndex('status', 'status', { unique: false });
      store.createIndex('createdAt', 'createdAt', { unique: false });
    }
  };

  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error || new Error('No se pudo abrir IndexedDB.'));
});

const withStore = async (mode, callback) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const result = callback(store);

    transaction.oncomplete = () => {
      db.close();
      resolve(result);
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error || new Error('Error al acceder a la cola offline.'));
    };
    transaction.onabort = () => {
      db.close();
      reject(transaction.error || new Error('Operacion offline cancelada.'));
    };
  });
};

const requestToPromise = (request) => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

export const enqueueCreate = async (type, payload) => {
  const now = new Date().toISOString();
  const item = {
    localId: createLocalId(),
    clientRequestId: createLocalId(),
    type,
    action: 'create',
    payload,
    status: 'pending',
    error: null,
    createdAt: now,
    updatedAt: now,
  };

  await withStore('readwrite', (store) => store.add(item));
  emitQueueChange();
  return item;
};

export const listPending = async (type) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const items = (request.result || [])
        .filter((item) => !type || item.type === type)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      resolve(items);
    };
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error || new Error('No se pudieron listar pendientes.'));
    };
  });
};

export const countPending = async () => {
  const items = await listPending();
  return items.length;
};

export const updatePending = async (localId, changes) => {
  const updated = await withStore('readwrite', (store) => {
    const request = store.get(localId);
    request.onsuccess = () => {
      const current = request.result;
      if (!current) return;

      store.put({
        ...current,
        ...changes,
        updatedAt: new Date().toISOString(),
      });
    };
    return requestToPromise(request);
  });

  emitQueueChange();
  return updated;
};

export const deletePending = async (localId) => {
  await withStore('readwrite', (store) => store.delete(localId));
  emitQueueChange();
};

export const markFailed = (localId, error) => updatePending(localId, {
  status: 'failed',
  error: error?.message || String(error || 'Error de sincronizacion.'),
});

export default {
  enqueueCreate,
  listPending,
  countPending,
  updatePending,
  deletePending,
  markFailed,
};

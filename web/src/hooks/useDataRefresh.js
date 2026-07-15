import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_INTERVAL_MS = 30000;
const DEFAULT_AUTOMATIC_GAP_MS = 1000;

export const createDataRefreshController = ({
  refresh,
  enabled = true,
  intervalMs = DEFAULT_INTERVAL_MS,
  minAutomaticGapMs = DEFAULT_AUTOMATIC_GAP_MS,
  windowTarget = globalThis.window,
  documentTarget = globalThis.document,
  now = () => Date.now(),
  onRefreshingChange = () => {},
  onRefreshed = () => {},
}) => {
  let intervalId = null;
  let isStarted = false;
  let isInFlight = false;
  let lastAutomaticRefreshAt = Number.NEGATIVE_INFINITY;

  const isAvailable = () => (
    documentTarget?.visibilityState !== 'hidden'
    && windowTarget?.navigator?.onLine !== false
  );

  const runRefresh = async ({ automatic }) => {
    if (!enabled || !isStarted || isInFlight || !isAvailable()) {
      return false;
    }

    const startedAt = now();
    if (automatic && startedAt - lastAutomaticRefreshAt < minAutomaticGapMs) {
      return false;
    }

    if (automatic) {
      lastAutomaticRefreshAt = startedAt;
    }

    isInFlight = true;
    onRefreshingChange(true);

    try {
      await refresh();
      if (isStarted) {
        onRefreshed(new Date(now()));
      }
      return true;
    } catch {
      return false;
    } finally {
      isInFlight = false;
      if (isStarted) {
        onRefreshingChange(false);
      }
    }
  };

  const runAutomaticRefresh = () => {
    void runRefresh({ automatic: true });
  };

  const start = () => {
    if (isStarted || !enabled) return;

    isStarted = true;
    intervalId = globalThis.setInterval(runAutomaticRefresh, intervalMs);
    windowTarget?.addEventListener?.('focus', runAutomaticRefresh);
    windowTarget?.addEventListener?.('online', runAutomaticRefresh);
    documentTarget?.addEventListener?.('visibilitychange', runAutomaticRefresh);
  };

  const stop = () => {
    if (!isStarted) return;

    isStarted = false;
    if (intervalId !== null) {
      globalThis.clearInterval(intervalId);
      intervalId = null;
    }
    windowTarget?.removeEventListener?.('focus', runAutomaticRefresh);
    windowTarget?.removeEventListener?.('online', runAutomaticRefresh);
    documentTarget?.removeEventListener?.('visibilitychange', runAutomaticRefresh);
  };

  const refreshNow = () => runRefresh({ automatic: false });

  return { start, stop, refreshNow };
};

export const useDataRefresh = (refreshCallback, {
  enabled = true,
  intervalMs = DEFAULT_INTERVAL_MS,
} = {}) => {
  const callbackRef = useRef(refreshCallback);
  const controllerRef = useRef(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);

  useEffect(() => {
    callbackRef.current = refreshCallback;
  }, [refreshCallback]);

  useEffect(() => {
    const controller = createDataRefreshController({
      refresh: () => callbackRef.current?.(),
      enabled,
      intervalMs,
      onRefreshingChange: setIsRefreshing,
      onRefreshed: setLastRefreshedAt,
    });

    controllerRef.current = controller;
    controller.start();

    return () => {
      controller.stop();
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
    };
  }, [enabled, intervalMs]);

  const refreshNow = useCallback(
    () => controllerRef.current?.refreshNow() ?? Promise.resolve(false),
    [],
  );

  return { refreshNow, isRefreshing, lastRefreshedAt };
};

export default useDataRefresh;

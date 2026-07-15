import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDataRefreshController } from './useDataRefresh.js';

class FakeEventTarget {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    this.listeners.get(type)?.delete(listener);
  }

  dispatch(type) {
    this.listeners.get(type)?.forEach((listener) => listener({ type }));
  }

  listenerCount(type) {
    return this.listeners.get(type)?.size || 0;
  }
}

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const createTargets = () => {
  const windowTarget = new FakeEventTarget();
  windowTarget.navigator = { onLine: true };

  const documentTarget = new FakeEventTarget();
  documentTarget.visibilityState = 'visible';

  return { windowTarget, documentTarget };
};

describe('createDataRefreshController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('no refresca al iniciar', () => {
    const refresh = vi.fn();
    const controller = createDataRefreshController({ refresh, ...createTargets() });

    controller.start();

    expect(refresh).not.toHaveBeenCalled();
    controller.stop();
  });

  it('refresca a los 30 segundos cuando la vista está visible', async () => {
    const refresh = vi.fn().mockResolvedValue(undefined);
    const controller = createDataRefreshController({ refresh, ...createTargets() });
    controller.start();

    await vi.advanceTimersByTimeAsync(30000);

    expect(refresh).toHaveBeenCalledTimes(1);
    controller.stop();
  });

  it('no hace polling cuando la vista está oculta u offline', async () => {
    const refresh = vi.fn().mockResolvedValue(undefined);
    const targets = createTargets();
    const controller = createDataRefreshController({ refresh, ...targets });
    controller.start();

    targets.documentTarget.visibilityState = 'hidden';
    await vi.advanceTimersByTimeAsync(30000);
    targets.documentTarget.visibilityState = 'visible';
    targets.windowTarget.navigator.onLine = false;
    await vi.advanceTimersByTimeAsync(30000);

    expect(refresh).not.toHaveBeenCalled();
    controller.stop();
  });

  it.each([
    ['focus', 'windowTarget'],
    ['visibilitychange', 'documentTarget'],
    ['online', 'windowTarget'],
  ])('refresca con %s', async (eventName, targetName) => {
    const refresh = vi.fn().mockResolvedValue(undefined);
    const targets = createTargets();
    const controller = createDataRefreshController({ refresh, ...targets });
    controller.start();

    targets[targetName].dispatch(eventName);
    await flushPromises();

    expect(refresh).toHaveBeenCalledTimes(1);
    controller.stop();
  });

  it('deduplica solicitudes simultáneas y eventos automáticos muy cercanos', async () => {
    let finishRefresh;
    const refresh = vi.fn(() => new Promise((resolve) => {
      finishRefresh = resolve;
    }));
    const targets = createTargets();
    const controller = createDataRefreshController({ refresh, ...targets });
    controller.start();

    targets.windowTarget.dispatch('focus');
    targets.documentTarget.dispatch('visibilitychange');
    expect(refresh).toHaveBeenCalledTimes(1);

    finishRefresh();
    await flushPromises();
    targets.windowTarget.dispatch('online');
    await flushPromises();
    expect(refresh).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1000);
    targets.windowTarget.dispatch('online');
    await flushPromises();
    expect(refresh).toHaveBeenCalledTimes(2);
    controller.stop();
  });

  it('permite refreshNow sin esperar el intervalo', async () => {
    const refresh = vi.fn().mockResolvedValue(undefined);
    const controller = createDataRefreshController({ refresh, ...createTargets() });
    controller.start();

    await controller.refreshNow();

    expect(refresh).toHaveBeenCalledTimes(1);
    controller.stop();
  });

  it('no actúa cuando enabled es false', async () => {
    const refresh = vi.fn().mockResolvedValue(undefined);
    const targets = createTargets();
    const controller = createDataRefreshController({
      refresh,
      enabled: false,
      ...targets,
    });
    controller.start();

    await vi.advanceTimersByTimeAsync(30000);
    targets.windowTarget.dispatch('focus');
    await controller.refreshNow();

    expect(refresh).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('elimina el intervalo y los listeners al detenerse', async () => {
    const refresh = vi.fn().mockResolvedValue(undefined);
    const targets = createTargets();
    const controller = createDataRefreshController({ refresh, ...targets });
    controller.start();

    expect(targets.windowTarget.listenerCount('focus')).toBe(1);
    expect(targets.windowTarget.listenerCount('online')).toBe(1);
    expect(targets.documentTarget.listenerCount('visibilitychange')).toBe(1);
    expect(vi.getTimerCount()).toBe(1);

    controller.stop();
    await vi.advanceTimersByTimeAsync(30000);
    targets.windowTarget.dispatch('focus');

    expect(targets.windowTarget.listenerCount('focus')).toBe(0);
    expect(targets.windowTarget.listenerCount('online')).toBe(0);
    expect(targets.documentTarget.listenerCount('visibilitychange')).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    expect(refresh).not.toHaveBeenCalled();
  });

  it('continúa funcionando después de un rechazo del callback', async () => {
    const refresh = vi.fn()
      .mockRejectedValueOnce(new Error('sin conexión'))
      .mockResolvedValueOnce(undefined);
    const targets = createTargets();
    const controller = createDataRefreshController({ refresh, ...targets });
    controller.start();

    targets.windowTarget.dispatch('focus');
    await flushPromises();
    await vi.advanceTimersByTimeAsync(1000);
    targets.windowTarget.dispatch('focus');
    await flushPromises();

    expect(refresh).toHaveBeenCalledTimes(2);
    controller.stop();
  });
});

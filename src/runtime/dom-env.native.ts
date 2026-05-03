/**
 * React Native implementation of DOM environment helpers.
 *
 * Mouse-based drag / resize interactions have no equivalent on native, so all
 * helpers are safe no-ops. This prevents "window.addEventListener is not a
 * function" when the component library is imported in an RN bundle.
 */

const noop = (): void => {};

export const domEnv = {
  addEventListener: noop as unknown as typeof window.addEventListener,
  removeEventListener: noop as unknown as typeof window.removeEventListener,
  setTimeout: ((cb: (...args: unknown[]) => void, ms?: number) =>
    globalThis.setTimeout(cb, ms)) as unknown as typeof window.setTimeout,
} as const;

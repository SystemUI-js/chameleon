/**
 * Web implementation of DOM environment helpers.
 *
 * In the web / jsdom runtime these delegate directly to the global `window`.
 * The `.native.ts` counterpart provides safe no-ops so that components which
 * rely on drag / resize behaviour can still be imported on React Native
 * without throwing "window.addEventListener is not a function".
 */

export const domEnv = {
  addEventListener: window.addEventListener.bind(window),
  removeEventListener: window.removeEventListener.bind(window),
  setTimeout: window.setTimeout.bind(window),
} as const;

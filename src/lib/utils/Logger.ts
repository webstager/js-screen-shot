let debugEnabled = false;

export const setDebugLogging = (enabled: boolean) => {
  debugEnabled = enabled;
};

export const logger = {
  debug: (...args: unknown[]) => {
    if (!debugEnabled) return;
    console.debug(...args);
  },
  warn: (...args: unknown[]) => {
    if (!debugEnabled) return;
    console.warn(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  }
};

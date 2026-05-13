export function isBrowserEnv(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function getDevicePixelRatio(defaultValue = 1): number {
  if (!isBrowserEnv()) {
    return defaultValue;
  }

  return window.devicePixelRatio || defaultValue;
}

export function getNavigator(): Navigator | null {
  if (typeof navigator === "undefined") {
    return null;
  }

  return navigator;
}

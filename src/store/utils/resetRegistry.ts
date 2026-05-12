type ResetFn = () => void;

const resetters: ResetFn[] = [];

export function registerStoreReset(fn: ResetFn) {
  resetters.push(fn);
}

export function resetAllStores() {
  resetters.forEach(reset => reset());
}

type DomDisposer = () => void;

const disposers: DomDisposer[] = [];

export function registerDomDisposer(disposer: DomDisposer) {
  disposers.push(disposer);
  return disposer;
}

export function disposeDomDisposers() {
  while (disposers.length > 0) {
    const dispose = disposers.pop();
    try {
      dispose?.();
    } catch (error) {
      console.error("[domDisposers] cleanup failed", error);
    }
  }
}

export function initializeStoreState<T extends object, S extends object>(
  target: S,
  factory: () => T
) {
  const apply = () => {
    Object.assign(target, factory());
  };
  apply();
  return apply;
}

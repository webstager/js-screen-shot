export type OptionApplicator<T extends Record<string, any>> = {
  keys?: Array<keyof T>;
  always?: boolean;
  when?: (options: Partial<T>) => boolean;
  apply: (options: Partial<T>) => void;
};

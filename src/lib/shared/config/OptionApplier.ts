import { OptionApplicator } from "@/lib/type/config/OptionApplicator";

const hasOwn = Object.prototype.hasOwnProperty;

export function applyOptions<T extends Record<string, any>>(
  options: Partial<T> | undefined,
  applicators: Array<OptionApplicator<T>>
) {
  if (options == null) {
    return;
  }

  applicators.forEach(({ keys = [], always = false, when, apply }) => {
    const hasDefinedKey =
      keys.length > 0
        ? keys.some(key => hasOwn.call(options, key))
        : false;
    const conditionSatisfied =
      when != null ? when(options) : hasDefinedKey;

    if (always || conditionSatisfied) {
      apply(options);
    }
  });
}

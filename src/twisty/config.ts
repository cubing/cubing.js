// TODO: Turn this into a property accessor with a default object template.
export function getConfigWithDefault<T>(value: T | undefined, defaultValue: T): T {
  return (typeof value === "undefined") ? defaultValue : value;
}

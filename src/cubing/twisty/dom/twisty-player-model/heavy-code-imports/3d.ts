// TODO can we remove the cached proxy?
// In theory we can, but we've run into situations where imports are not properly cached.
let cachedConstructorProxy: Promise<
  typeof import("./dynamic-entries/3d")
> | null = null;

export async function proxy3D(): Promise<
  typeof import("./dynamic-entries/3d")
> {
  return (cachedConstructorProxy ??= import("./dynamic-entries/3d"));
}

export async function THREE(): Promise<
  typeof import("./dynamic-entries/3d").THREE
> {
  return (await proxy3D()).THREE;
}

// TOFO: Catch?
export const THEESRY = {
  then: (
    callback: (v: typeof import("./dynamic-entries/3d").THREE) => void,
  ): void => {
    THREE().then(callback);
  },
};

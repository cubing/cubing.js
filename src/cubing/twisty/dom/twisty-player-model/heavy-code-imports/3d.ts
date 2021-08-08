import PLazy from "p-lazy";

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

export const THREEJS = PLazy.from(async () => (await proxy3D()).T3I);

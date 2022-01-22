import { from } from "../../vendor/p-lazy/p-lazy";

// TODO can we remove the cached proxy?

// In theory we can, but we've run into situations where imports are not properly cached.
let cachedConstructorProxy: Promise<
  typeof import("./dynamic-entries/3d-dynamic-inside")
> | null = null;

export async function proxy3D(): Promise<
  typeof import("./dynamic-entries/3d-dynamic-inside")
> {
  return (cachedConstructorProxy ??= import(
    "./dynamic-entries/3d-dynamic-inside"
  ));
}

export const THREEJS: Promise<typeof import("three")> = from(
  async () => (await proxy3D()).T3I,
);

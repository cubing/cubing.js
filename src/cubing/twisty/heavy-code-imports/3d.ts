// TODO can we remove the cached proxy?

// In theory we can, but we've run into situations where imports are not properly cached.
let cachedConstructorProxy: Promise<
  typeof import("./dynamic-entries/twisty-dynamic-3d")
> | null = null;

export async function bulk3DCode(): Promise<
  typeof import("./dynamic-entries/twisty-dynamic-3d")
> {
  return (cachedConstructorProxy ??= import(
    "./dynamic-entries/twisty-dynamic-3d"
  ));
}

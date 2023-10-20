function getNumber(configName: string, defaultValue: number): number {
  const value = parseFloat(
    new URL(location.href).searchParams.get(configName) ||
      defaultValue.toString(),
  );
  return Number.isNaN(value) ? defaultValue : value;
}

function getBoolean(configName: string, defaultValue: boolean): boolean {
  return (
    "true" ===
    (new URL(location.href).searchParams.get(configName) ||
      (defaultValue ? "true" : "false"))
  );
}

export const initialHeight = getNumber("height", 1.5);
export const initialScale = getNumber("scale", 10);
export const showControlPlanes = getBoolean("showControlPlanes", true);
export const daydream = getBoolean("daydream", false);
export const usePG3D = getBoolean("pg3d", false);
export const socketOrigin: string | null =
  new URL(location.href).searchParams.get("socketOrigin") || null;

console.table({
  initialHeight,
  initialScale,
  showControlPlanes,
  daydream,
  usePG3D,
  socketOrigin,
});

let globalPixelRatioOverride: number | null = null;
export function setGlobalPixelRatioOverride(override: number | null): void {
  globalPixelRatioOverride = override;
}

// TODO: Handle if you move across screens?
export function pixelRatio(): number {
  return globalPixelRatioOverride ?? (devicePixelRatio || 1);
}

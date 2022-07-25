export const twistyDebugGlobals: {
  animateRaiseHintFacelets: boolean;
  // WARNING: The current shared renderer implementation has performanc issues, especially in Safari.
  // Avoid using for players that are likely to have dimensions approaching 1 megapixel or higher.
  // TODO: use a dedicated renderer while fullscreen?
  // - "auto": Default heuristics.
  // - "always": Force all new (i.e. constructed in the future) renderers to be shared
  // - "never": Force all new (i.e. constructed in the future) renderers to be dedicated
  shareAllNewRenderers: "auto" | "always" | "never";
  showRenderStats: boolean;
} = {
  animateRaiseHintFacelets: true,
  shareAllNewRenderers: "auto",
  showRenderStats: false,
};

export function setTwistyDebug(
  options: Partial<typeof twistyDebugGlobals>,
): void {
  for (const [key, value] of Object.entries(options)) {
    if (key in twistyDebugGlobals) {
      (twistyDebugGlobals as any)[key] = value;
    }
  }
}

export const twistyDebugGlobals: { animateRaiseHintFacelets: boolean } = {
  animateRaiseHintFacelets: true,
};

export function setTwistyDebug(options: {
  animateRaiseHintFacelets?: boolean;
}): void {
  if ("animateRaiseHintFacelets" in options) {
    twistyDebugGlobals.animateRaiseHintFacelets =
      !!options.animateRaiseHintFacelets;
  }
}

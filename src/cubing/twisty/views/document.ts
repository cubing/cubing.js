// Use like this:
// const enabled = globalSafeDocument?.fullscreenEnabled;
export const globalSafeDocument: Document | null =
  typeof document === "undefined" ? null : document;

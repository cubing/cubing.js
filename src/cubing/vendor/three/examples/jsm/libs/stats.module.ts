// This is an extra wrapper to work around a Snowpack bug where it trips on importing a `.js` with an accompanying `.d.ts` file.
export { Stats } from "./stats.module.wrapped.js";

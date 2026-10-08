import { TwizzleExplorerApp } from "./app.ts";

// Expose as a global for debugging.
(globalThis as any).app = new TwizzleExplorerApp();

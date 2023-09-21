(globalThis as any).EventTarget = (await import("happy-dom")).EventTarget;

import { GlobalRegistrator } from "@happy-dom/global-registrator";
GlobalRegistrator.register();

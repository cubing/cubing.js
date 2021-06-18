import { workerConstructorBrowser } from "../../worker/getWorkerConstructor/browser";
import { outsideStrategy } from "../../worker/strategy/outside";
import { trampolineBrowser } from "../../worker/trampoline/browser";
import { workerInstantiatorESM } from "../../worker/workerInstantiator/esm";

outsideStrategy.url.esm = new URL("./scrambles-worker.js", import.meta.url);

outsideStrategy.getWorkerConstructor.browser = workerConstructorBrowser;

outsideStrategy.workerInstantiator.esm = workerInstantiatorESM;
outsideStrategy.trampoline.browser = trampolineBrowser;

import * as scrambles from "../../index";
export * from "../../index";
(globalThis as any).scrambles = scrambles;

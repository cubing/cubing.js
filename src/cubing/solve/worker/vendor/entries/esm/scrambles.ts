import { getNodeAdapterESM } from "../../worker/getNodeAdapter/esm";
import { workerConstructorBrowser } from "../../worker/getWorkerConstructor/browser";
import { workerConstructorNode } from "../../worker/getWorkerConstructor/node";
import { outsideStrategy } from "../../worker/strategy/outside";
import { trampolineBrowser } from "../../worker/trampoline/browser";
import { workerInstantiatorESM } from "../../worker/workerInstantiator/esm";

outsideStrategy.url.esm = new URL("./scrambles-worker.js", import.meta.url);
outsideStrategy.getNodeAdapter.esm = getNodeAdapterESM;

outsideStrategy.getWorkerConstructor.browser = workerConstructorBrowser;
outsideStrategy.getWorkerConstructor.node = workerConstructorNode;

outsideStrategy.workerInstantiator.esm = workerInstantiatorESM;
outsideStrategy.trampoline.browser = trampolineBrowser;

export * from "../../index";

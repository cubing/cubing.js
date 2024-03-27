import type { Worker as NodeWorker } from "node:worker_threads";

/**
 * Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

type EventHandler = EventListenerObject | ((event: any) => void);

function nodeEndpoint(nep: NodeWorker): Worker & {
  nodeWorker?: import("worker_threads").Worker;
} {
  const listeners = new WeakMap();
  return {
    postMessage: nep.postMessage.bind(nep),
    addEventListener: (_: string, eh: EventHandler) => {
      const l = (data: Event) => {
        if ("handleEvent" in eh) {
          eh.handleEvent({ data } as any);
        } else {
          eh({ data });
        }
      };
      nep.on("message", l);
      listeners.set(eh, l);
    },
    removeEventListener: (_: string, eh: EventHandler) => {
      const l = listeners.get(eh);
      if (!l) {
        return;
      }
      nep.off("message", l);
      listeners.delete(eh);
    },
    nodeWorker: nep,
    terminate: () => {
      nep.terminate();
    },
    // start: nep.start && nep.start.bind(nep),
  } as Worker & {
    nodeWorker?: import("worker_threads").Worker;
  };
}

export default nodeEndpoint;
//# sourceMappingURL=node-adapter.mjs.map

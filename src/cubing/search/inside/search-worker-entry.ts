// TODO: can we avoid this?
async function getNodeMessagePort() {
  return (
    await import("../../vendor/comlink-everywhere/inside/node.js")
  ).port();
}

if (!(globalThis as any).DO_NOT_EXPOSE_API) {
  (async () => {
    await import("./entry.js");

    // // Workaround for `node`
    const messagePort = (globalThis as any).postMessage
      ? globalThis
      : await getNodeMessagePort();
    messagePort.postMessage("comlink-exposed");
  })();
}

export const WORKER_ENTRY_FILE_URL = import.meta.url;

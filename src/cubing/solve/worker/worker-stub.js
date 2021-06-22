// console.log("in stub");

if (typeof self !== "undefined") {
  self.onmessage = (message) => {
    if (message.data === "to worker") {
      self.postMessage("from worker");
    }
  };
} else {
  (async () => {
    // console.log("asyncey");
    const { parentPort } = await import("worker_threads");
    parentPort.once("message", (message) => {
      // console.log("psyncey", message);
      if (message === "to worker") {
        // console.log("flinkey", message);
        parentPort.postMessage("from worker");
      }
    });
  })();
}

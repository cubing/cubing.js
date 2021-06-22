console.log("in stub");
self.onmessage = (a) => {
  if (a.data === "to worker") {
    self.postMessage("from worker");
  }
};

//

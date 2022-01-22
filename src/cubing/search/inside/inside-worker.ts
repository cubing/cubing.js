let isInsideWorker = false;

export function setIsInsideWorker(inside: boolean) {
  isInsideWorker = inside;
}

export function mustBeInsideWorker(): void {
  if (!isInsideWorker) {
    throw new Error(
      "Must be called from inside a worker, to avoid impact on page performance. Try importing from the top level of `cubing/solve`?",
    );
  }
}

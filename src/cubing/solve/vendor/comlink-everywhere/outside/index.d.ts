export { wrap } from "comlink";
export function workerFileConstructor(): Promise<typeof Worker>;
export function constructWorkerFromString(
  stringSource: string,
  options?: { type: "classic" | "module" }
): Promise<Worker>;

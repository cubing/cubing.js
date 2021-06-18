import type { Worker } from "worker_threads";

export async function workerConstructorNode(): Promise<typeof Worker> {
  return 1 as any; // (await import("worker_threads")).Worker;
}

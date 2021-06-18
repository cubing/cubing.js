import type { Worker } from "worker_threads";

export async function workerConstructorNode(): Promise<typeof Worker> {
  return (await import("worker_threads")).Worker;
}

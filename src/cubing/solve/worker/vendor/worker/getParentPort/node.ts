export async function getParentPortNode(): Promise<MessagePort> {
  return 1 as any; // ((await import("worker_threads")).parentPort! as any) as MessagePort;
}

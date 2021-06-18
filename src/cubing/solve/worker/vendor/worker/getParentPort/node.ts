export async function getParentPortNode(): Promise<MessagePort> {
  return ((await import("worker_threads")).parentPort! as any) as MessagePort;
}

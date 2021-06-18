export async function workerConstructorBrowser(): Promise<typeof Worker> {
  return Worker;
}

export function instantiate(): void {
  console.log("instantiating!!!!");
  new Worker(new URL("../inside/generated/worker-inside.js", import.meta.url), {
    type: "classic",
  });
}

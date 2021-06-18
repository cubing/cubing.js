export function instantiate(): void {
  console.log("instantiating!!!!");
  new Worker(new URL("./worker-inside-generated.cjs", import.meta.url), {
    type: "classic",
  });
}

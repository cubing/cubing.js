export function instantiate(): void {
  console.log("instantiating!!!!");
  new Worker(new URL("./worker-inside-generated.js", import.meta.url), {
    type: "classic",
  });
}

// @ts-ignore https://github.com/developit/web-worker/issues/13
import { default as Worker } from "web-worker";

export function instantiate(): void {
  console.log("instantiating ing!!!!");
  console.log("Worker", Worker);
  console.log("import.meta.url", import.meta.url);
  const url = new URL(
    "./worker-inside-generated.cjs",
    import.meta.url,
  ).toString();
  console.log("url", url);
  new Worker(url, {
    type: "classic",
  });
}

// @ts-ignore https://github.com/developit/web-worker/issues/13
import * as Worker from "web-worker";

export function instantiate(): void {
  console.log("instantiating ing!!!!");
  const url = new URL("./worker-inside-generated.js", import.meta.url);
  console.log("url", url);
  console.log("import.meta.url", import.meta.url);
  new Worker(url, {
    type: "classic",
  });
}

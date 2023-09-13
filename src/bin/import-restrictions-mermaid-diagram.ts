// To run this file directly:
// bun run src/bin/import-restrictions-mermaid-diagram.ts

import { allowedImports } from "../../script/test/src/import-restrictions/allowedImports";

console.log("graph BT");
for (const [target, targetInfo] of Object.entries(allowedImports)) {
  // @ts-ignore
  for (const staticImport of targetInfo.static ?? []) {
    console.log(`  ${target} --> ${staticImport}`);
  }
  // @ts-ignore
  for (const dynamic of targetInfo.dynamic ?? []) {
    console.log(`  ${target} -.-> ${dynamic}`);
  }
}
console.log("%% Paste into: https://mermaid.live/");
console.log(
  "%% Note: this diagram is currently more complex than intended. TODO: show relationships purely between top-level `src/cubing` folders.",
);

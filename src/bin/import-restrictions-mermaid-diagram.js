import { targetInfos } from "../../script/test/src/internal-import-restrictions/target-infos";

console.log("graph BT");
for (const [target, targetInfo] of Object.entries(targetInfos)) {
  for (const direct of targetInfo.deps.direct) {
    console.log(`  ${target} --> ${direct}`);
  }
  for (const dynamic of targetInfo.deps.dynamic) {
    console.log(`  ${target} -.-> ${dynamic}`);
  }
}
console.log("%% Paste into: https://mermaid.live/");

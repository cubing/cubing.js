import { targetNames } from "./target-infos.js";
import { exec } from "child_process";

for (const targetName of targetNames) {
  exec(`rm ./${targetName}/*.js`);
}

// async imports
exec(`rm -rf ./puzzles/implementations/`);

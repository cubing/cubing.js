import { build, SolveWorker } from "./targets.js";

const target = process.argv[2];
if (!target) {
  console.error("not a target:", target);
  process.exit(1);
}

const targets /*: Record<String, SolverWorker>*/ = {
  workers: SolveWorker,
};

(async () => {
  // console.log(targets[target]);
  await build(targets[target]);
})();

import { Alg } from "../../../../alg";
import { mustBeInsideWorker } from "../../inside-worker";

export async function randomMasterTetraminxScramble(): Promise<Alg> {
  const { randomMasterTetraminxScrambleString } = await import(
    "../../../../vendor/xyzzy/master_tetraminx-solver.js"
  );
  mustBeInsideWorker();
  return new Alg(await randomMasterTetraminxScrambleString());
}

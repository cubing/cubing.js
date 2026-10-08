import { Alg } from "../../../../alg/index.ts";
import { mustBeInsideWorker } from "../../inside-worker.ts";
import { dynamicMasterTetraminxSolver } from "./dynamic/master_tetraminx/index.ts";

export async function randomMasterTetraminxScramble(): Promise<Alg> {
  mustBeInsideWorker();
  return new Alg(
    await (
      await dynamicMasterTetraminxSolver
    ).randomMasterTetraminxScrambleString(),
  );
}

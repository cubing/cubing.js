import { Alg } from "../../../../alg";
import { mustBeInsideWorker } from "../../inside-worker";
import { dynamicMasterTetraminxSolver } from "./dynamic/master_tetraminx";

export async function randomMasterTetraminxScramble(): Promise<Alg> {
  mustBeInsideWorker();
  return new Alg(
    await (
      await dynamicMasterTetraminxSolver
    ).randomMasterTetraminxScrambleString(),
  );
}

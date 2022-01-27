import { Alg } from "../../../../alg";

export async function randomMasterTetraminxScramble(): Promise<Alg> {
  const { randomMasterTetraminxScrambleString } = await import(
    "../../../../vendor/xyzzy/master_tetraminx-solver.js"
  );
  return new Alg(await randomMasterTetraminxScrambleString());
}

import { Alg } from "../../../../alg";

export async function randomMasterTetraminxScramble(): Promise<Alg> {
  const { randomMasterTetraminxScrambleString } = await import(
    "../../../../vendor/xyzzy/masterpyra.js"
  );
  return new Alg(await randomMasterTetraminxScrambleString());
}

import { Alg } from "../../../alg";

export function workerInside() {
  console.log("inside worker!", this);
  console.log("inside worker alg:", new Alg("R U R'").invert().toString());
}

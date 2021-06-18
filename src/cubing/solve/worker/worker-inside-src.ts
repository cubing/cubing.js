import { Alg } from "../../alg";

function workerInside() {
  console.log("inside worker!", this);
  console.log("inside worker alg:", new Alg("R U F D2").invert().toString());
}

workerInside();

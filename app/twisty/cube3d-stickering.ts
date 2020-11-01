import { parse } from "../../src/alg";
import {
  Cube3D,
  experimentalSetShareAllNewRenderers,
  ExperimentalStickering,
  TwistyPlayer,
} from "../../src/twisty";

experimentalSetShareAllNewRenderers(true);

const content = document.querySelector(".content")!;

function addAlg(stickering: ExperimentalStickering, s: string): Cube3D {
  const div = content.appendChild(document.createElement("div"));
  div.classList.add("case");
  const twistyPlayer = new TwistyPlayer({
    alg: parse(s),
    experimentalStickering: stickering,
  });
  div.appendChild(document.createElement("h1")).textContent = stickering;
  div.appendChild(twistyPlayer);
  return twistyPlayer.twisty3D as Cube3D;
}

addAlg("PLL", "R U R' U' R' F R2 U' R' U' R U R' F'");
addAlg("CLS", "R U R' U' R U R' U R U' R'");
addAlg("OLL", "r U R' U R U2 r'");
addAlg("ELS", "[r U' r': U]");
addAlg("LL", "R' F R F2' U F R U R' F' U' F");
addAlg("ZBLL", "R' F R U' R' U' R U R' F' R U R' U' R' F R F' R");
addAlg("ZBLS", "x' R2 U' R' U l'");
addAlg("WVLS", "R U R' U R U' R'");
addAlg("VLS", "R' F2 R F2' L' U2 L");
addAlg("LS", "R U' R'");
addAlg("EO", "");
addAlg("L6EO", "(U' M U' M')2");
addAlg("Daisy", "S2 R2 L2");
addAlg("2x2x2", "y2'");
addAlg("2x2x3", "y'");

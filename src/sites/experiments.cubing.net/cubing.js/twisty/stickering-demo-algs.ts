import { Alg } from "../../../../cubing/alg";
import {
  type ExperimentalStickering,
  TwistyPlayer,
} from "../../../../cubing/twisty";
import type { VisualizationFormat } from "../../../../cubing/twisty/model/props/viewer/VisualizationProp";

export function demo(visualization: VisualizationFormat): void {
  const content = document.querySelector(".content")!;

  function addAlg(stickering: ExperimentalStickering, s: string): void {
    const div = content.appendChild(document.createElement("div"));
    div.classList.add("case");
    const twistyPlayer = new TwistyPlayer({
      experimentalSetupAnchor: "end",
      alg: Alg.fromString(s),
      visualization,
      experimentalStickering: stickering,
    });
    div.appendChild(document.createElement("h2")).textContent = stickering;
    div.appendChild(twistyPlayer);
  }

  addAlg("full", "y L' U R' F' U L2 U2' L' U' L U2' D R' D' F2 R2 U'");
  addAlg("centers-only", "(x y)3");
  addAlg("PLL", "R U R' U' R' F R2 U' R' U' R U R' F'");
  addAlg("CLS", "R U R' U' R U R' U R U' R'");
  addAlg("OLL", "r U R' U R U2 r'");
  addAlg("COLL", "L R' U' R U L' U2 R' U2 R");
  addAlg("OCLL", "R U R' U R U2 R'");
  addAlg("CLL", "R U' L' U R' U' L (U)");
  addAlg("EPLL", "R2 U R U R' U' R' U' R' U R'");
  addAlg("ELL", "M U' M' U2 M U' M'");
  addAlg("ELS", "[r U' r': U]");
  addAlg("LL", "R' F R F2' U F R U R' F' U' F");
  addAlg("F2L", "R2' u R2 u' R2'");
  addAlg("ZBLL", "R' F R U' R' U' R U R' F' R U R' U' R' F R F' R");
  addAlg("ZBLS", "r' R U' R U (R2' r)");
  addAlg("VLS", "x' R2 U' R' U l'");
  addAlg("WVLS", "R' F2 R F2' L' U2 L");
  addAlg("LS", "U' R U' R' U R U R'");
  addAlg("LSOLL", "R' F R F'");
  addAlg("LSOCLL", "R' F' R U R U' R' F");
  addAlg("EO", "R' F R");
  addAlg("EOline", "B U B' D F R' L D'");
  addAlg("EOcross", "B U B' D F R' L D'");
  addAlg("CMLL", "F R U R' U' F'");
  addAlg("L10P", "r U' r' F R' F' R");
  addAlg("L6E", "U M2' U' M2'");
  addAlg("L6EO", "(U' M U' M')2");
  addAlg("Daisy", "S2 R2 L2");
  addAlg("Cross", "(y' R)5 D");
  addAlg("2x2x2", "y2");
  addAlg("2x2x3", "y");
  addAlg("Void Cube", "M' U M' U M' U' M' U' M' U2' M' U' M' U'");
  addAlg("invisible", "");
}

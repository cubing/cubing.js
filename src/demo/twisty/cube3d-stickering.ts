import { invert, parseAlg } from "../../cubing/alg";
import {
  Cube3D,
  experimentalSetShareAllNewRenderers,
  ExperimentalStickering,
  TwistyPlayer,
} from "../../cubing/twisty";
import { VisualizationFormat } from "../../cubing/twisty/dom/TwistyPlayerConfig";

function demo(visualization: VisualizationFormat): void {
  experimentalSetShareAllNewRenderers(true);

  const content = document.querySelector(".content")!;

  function addAlg(stickering: ExperimentalStickering, s: string): Cube3D {
    const div = content.appendChild(document.createElement("div"));
    div.classList.add("case");
    const twistyPlayer = new TwistyPlayer({
      experimentalStartSetup: invert(parseAlg(s)),
      alg: parseAlg(s),
      visualization,
      experimentalStickering: stickering,
    });
    div.appendChild(document.createElement("h2")).textContent = stickering;
    div.appendChild(twistyPlayer);
    return twistyPlayer.twisty3D as Cube3D;
  }

  addAlg("full", "y L' U R' F' U L2 U2' L' U' L U2' D R' D' F2 R2 U'");
  addAlg("centers-only", "(x y)3");
  addAlg("PLL", "R U R' U' R' F R2 U' R' U' R U R' F'");
  addAlg("CLS", "R U R' U' R U R' U R U' R'");
  addAlg("OLL", "r U R' U R U2 r'");
  addAlg("COLL", "L R' U' R U L' U2 R' U2 R");
  addAlg("OCLL", "R U R' U R U2 R'");
  addAlg("ELL", "M U' M' U2 M U' M'");
  addAlg("ELS", "[r U' r': U]");
  addAlg("LL", "R' F R F2' U F R U R' F' U' F");
  addAlg("F2L", "R2' u R2 u' R2'");
  addAlg("ZBLL", "R' F R U' R' U' R U R' F' R U R' U' R' F R F' R");
  addAlg("ZBLS", "x' R2 U' R' U l'");
  addAlg("WVLS", "R U R' U R U' R'");
  addAlg("VLS", "R' F2 R F2' L' U2 L");
  addAlg("LS", "U' R U' R' U R U R'");
  addAlg("EO", "R' F R");
  addAlg("CMLL", "F R U R' U' F'");
  addAlg("L6E", "U M2' U' M2'");
  addAlg("L6EO", "(U' M U' M')2");
  addAlg("Daisy", "S2 R2 L2");
  addAlg("Cross", "(y' R)5 D");
  addAlg("2x2x2", "y2");
  addAlg("2x2x3", "y");
  addAlg("Void Cube", "M' U M' U M' U' M' U' M' U2' M' U' M' U'");
  addAlg("invisible", "");
}

demo("3D");

import { setAlgDebug } from "../../../../cubing/alg";
import type { TwistyPlayer } from "../../../../cubing/twisty";

setAlgDebug({ caretNISSNotationEnabled: true });

(document.querySelector("#caret-niss-notation") as TwistyPlayer).alg = `^(B L' U F2) // Nice start on inverse scramble
D' B' U B2 R2 // Nice continuation
^(R B R' U R' U2 R B) // F2L
^(U2 R' U2 R' D' L F2 L' D R2) // LL

// From https://fmcsolves.cubing.net/fmc_tutorial_ENG.pdf (page 45)`;

import type { PuzzleLoader } from "../../../../../puzzles";
import type { ExperimentalStickeringMask } from "../../../../../puzzles/cubing-private";
import type {
  PieceStickeringMask,
  StickeringMask,
} from "../../../../../puzzles/stickerings/mask";
import { TwistyPropDerived } from "../../TwistyProp";
import type { ExperimentalStickering } from "./StickeringRequestProp";

interface StickeringMaskPropInputs {
  stickeringMaskRequest: StickeringMask | null;
  stickeringRequest: ExperimentalStickering | null;
  puzzleLoader: PuzzleLoader;
}

const r: PieceStickeringMask = {
  facelets: ["regular", "regular", "regular", "regular", "regular"],
};

async function fullStickeringMask(
  puzzleLoader: PuzzleLoader,
): Promise<ExperimentalStickeringMask> {
  const { definition } = await puzzleLoader.kpuzzle();
  const fullStickeringMask: ExperimentalStickeringMask = { orbits: {} };
  for (const [orbitName, orbitDef] of Object.entries(definition.orbits)) {
    fullStickeringMask.orbits[orbitName] = {
      pieces: new Array(orbitDef.numPieces).fill(r),
    };
  }
  return fullStickeringMask;
}

export class StickeringMaskProp extends TwistyPropDerived<
  StickeringMaskPropInputs,
  StickeringMask
> {
  getDefaultValue(): ExperimentalStickeringMask {
    return { orbits: {} }; // TODO: auto
  }

  async derive(inputs: StickeringMaskPropInputs): Promise<StickeringMask> {
    if (inputs.stickeringMaskRequest) {
      return inputs.stickeringMaskRequest;
    }
    if (inputs.stickeringRequest === "picture") {
      return {
        specialBehaviour: "picture",
        orbits: {},
      };
    }
    return (
      inputs.puzzleLoader.stickeringMask?.(
        inputs.stickeringRequest ?? "full",
      ) ?? fullStickeringMask(inputs.puzzleLoader)
    );
  }
}

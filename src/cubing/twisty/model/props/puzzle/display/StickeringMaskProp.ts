import type { PuzzleLoader } from "../../../../../puzzles";
import type {
  ExperimentalPieceStickeringMask,
  ExperimentalStickeringMask,
} from "../../../../../puzzles/cubing-private";
import { TwistyPropDerived } from "../../TwistyProp";
import type { ExperimentalStickering } from "./StickeringRequestProp";

interface StickeringMaskPropInputs {
  stickeringMaskRequest: ExperimentalStickeringMask | null;
  stickeringRequest: ExperimentalStickering | null;
  puzzleLoader: PuzzleLoader;
}

const r: ExperimentalPieceStickeringMask = {
  facelets: ["regular", "regular", "regular", "regular", "regular"],
};

async function fullStickeringMask(
  puzzleLoader: PuzzleLoader,
): Promise<ExperimentalStickeringMask> {
  const { definition } = await puzzleLoader.kpuzzle();
  const fullStickeringMask: ExperimentalStickeringMask = { orbits: {} };
  for (const orbitDefinition of definition.orbits) {
    fullStickeringMask.orbits[orbitDefinition.orbitName] = {
      pieces: new Array(orbitDefinition.numPieces).fill(r),
    };
  }
  return fullStickeringMask;
}

export class StickeringMaskProp extends TwistyPropDerived<
  StickeringMaskPropInputs,
  ExperimentalStickeringMask
> {
  getDefaultValue(): ExperimentalStickeringMask {
    return { orbits: {} }; // TODO: auto
  }

  async derive(
    inputs: StickeringMaskPropInputs,
  ): Promise<ExperimentalStickeringMask> {
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
  // TODO: Implement canReuseValue?
}

import { Alg, Move } from "../../../../cubing/alg";
import { TwistyAlgViewer, TwistyPlayer } from "../../../../cubing/twisty";

{
  const alg = Alg.fromString("R U R' U R U2' R'");
  const player = new TwistyPlayer({
    alg,
  });
  const algNodes = Array.from(alg.childAlgNodes());
  player.experimentalModel.animationTimelineLeavesRequest.set([
    { animLeaf: algNodes[0], start: 0, end: 120 },
    { animLeaf: algNodes[1], start: 150, end: 235 },
    { animLeaf: algNodes[2], start: 240, end: 270 },
    { animLeaf: algNodes[3], start: 270, end: 310 },
    { animLeaf: algNodes[4], start: 335, end: 380 },
    { animLeaf: algNodes[5], start: 380, end: 470 },
    { animLeaf: algNodes[6], start: 470, end: 535 },
  ]);
  document.querySelector(".demo1")!.appendChild(player);
  document
    .querySelector(".demo1")!
    .appendChild(new TwistyAlgViewer({ twistyPlayer: player }));
}

{
  const solutionString = `x' x' y' y U' L' D' F' D' F // Cross (0.572s)
y' L U' L' // F2L Slot 1 (0.536s)
y' U' y' U U' R' U' R // F2L Slot 2 (adjacent) (1.289s)
U U L U' L' // F2L Slot 3 (0.381s)
y' U R U' R' F' U' F // EOLL (0.991s)
U U R' F' L F R F' L' F // OLL (1.623s)
U U // PLL (0.240s)`;
  const solutionMoveTimestamps = [
    0, 0, 0, 0, 0, 47, 196, 284, 397, 572, 870, 959, 1034, 1108, 1226, 1518,
    1693, 1796, 2142, 2249, 2303, 2397, 2416, 2542, 2614, 2682, 2778, 2919,
    3370, 3454, 3518, 3577, 3667, 3718, 3769, 3912, 4671, 4775, 4843, 4996,
    5068, 5122, 5187, 5337, 5392, 5526, 5632,
  ];
  const duration = solutionMoveTimestamps.at(-1);
  const parsedAlg = Alg.fromString(solutionString);

  // `.filter(…)` on iterators is not generally available yet: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/filter
  const moves = Array.from(parsedAlg.childAlgNodes()).filter((algNode) =>
    // We don't have any pauses in this alg, so we just filter out moves for now.
    algNode.is(Move),
  );
  if (moves.length !== solutionMoveTimestamps.length) {
    throw new Error("Unexpected mismatch");
  }

  const animationTimelineLeaves = moves.map((move, i) => {
    return {
      animLeaf: move,
      start:
        ((solutionMoveTimestamps[i] ?? 0) + solutionMoveTimestamps[i - 1]) / 2,
      end:
        // Note: this assumes that it's reasonable for each move to bump up against the start of the next one. If there's a gap over, say, 1 second, it would be worth putting a limit.
        (solutionMoveTimestamps[i] +
          (solutionMoveTimestamps[i + 1] ?? duration)) /
        2,
    };
  });

  const player = new TwistyPlayer({
    alg: parsedAlg,
    experimentalSetupAnchor: "end",
  });
  player.experimentalModel.animationTimelineLeavesRequest.set(
    animationTimelineLeaves,
  );
  document.querySelector(".demo2")!.appendChild(player);
  document
    .querySelector(".demo2")!
    .appendChild(new TwistyAlgViewer({ twistyPlayer: player }));
}

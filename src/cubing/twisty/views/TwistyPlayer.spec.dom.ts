import { expect } from "../../../test/chai-workarounds";
import { Alg } from "../../alg";
import { TwistyPlayer } from "..";

const test = it;

test("can construct TwistyPlayer via constructor with default config", () => {
  new TwistyPlayer();
});

test("can construct TwistyPlayer via constructor with empty config", () => {
  new TwistyPlayer({});
});

test("can construct TwistyPlayer via constructor with fancy config", async () => {
  // Example from https://js.cubing.net/cubing/twisty/#parameters
  expect(
    await new TwistyPlayer({
      puzzle: "4x4x4",
      alg: "r U2 x r U2 r U2 r' U2 l U2 r' U2 r U2 r' U2 r'",
      hintFacelets: "none",
      backView: "top-right",
      background: "none",
    }).experimentalModel.puzzleID.get(),
  ).to.equal("4x4x4");
});

test("can construct TwistyPlayer with various algs", () => {
  new TwistyPlayer({ alg: "R U R'" });
  new TwistyPlayer({ alg: new Alg("(R y)1260") });
});

test("can construct TwistyPlayer using `document.createElement(…)` and set attributes", async () => {
  const player = document.createElement("twisty-player");
  player.alg = "R U R' U R U2' R'";
  expect(
    (await player.experimentalModel.detailedTimelineInfo.get()).timeRange,
  ).to.deep.equal({ start: 0, end: 7500 });
});

test("can add a TwistyPlayer to the DOM", () => {
  document.body.appendChild(new TwistyPlayer());
});

// TODO: test changing 2D and 3D (and check for some appropriate internal updates to the player)

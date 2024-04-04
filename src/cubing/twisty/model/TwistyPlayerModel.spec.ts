import { expect, test } from "bun:test";
import { Alg, Move, Pause } from "../../alg";
import { TwistyPlayerModel } from "./TwistyPlayerModel";

test("generates Twizzle links", async () => {
  const twistyPlayerModel = new TwistyPlayerModel();
  expect(await twistyPlayerModel.twizzleLink()).toStrictEqual(
    "https://alpha.twizzle.net/edit/",
  );
  twistyPlayerModel.alg.set("R U R'");
  expect(await twistyPlayerModel.twizzleLink()).toStrictEqual(
    "https://alpha.twizzle.net/edit/?alg=R+U+R%27",
  );
  twistyPlayerModel.puzzleIDRequest.set("4x4x4");
  expect(await twistyPlayerModel.twizzleLink()).toStrictEqual(
    "https://alpha.twizzle.net/edit/?alg=R+U+R%27&puzzle=4x4x4",
  );
});

test("adds alg leaves and moves properly", async () => {
  const twistyPlayerModel = new TwistyPlayerModel();
  twistyPlayerModel.alg.set("R U R'");

  twistyPlayerModel.experimentalAddAlgLeaf(new Move("D2"));
  expect(
    (await twistyPlayerModel.alg.get()).alg.isIdentical(new Alg("R U R' D2")),
  ).toBeTrue();

  // This should be the same as `.experimentalAddAlgLeaf()`;
  twistyPlayerModel.experimentalAddMove(new Move("F'"));
  expect(
    (await twistyPlayerModel.alg.get()).alg.isIdentical(
      new Alg("R U R' D2 F'"),
    ),
  ).toBeTrue();

  twistyPlayerModel.experimentalAddMove(new Move("F2"), {
    cancel: true,
  });
  expect(
    (await twistyPlayerModel.alg.get()).alg.isIdentical(new Alg("R U R' D2 F")),
  ).toBeTrue();

  twistyPlayerModel.experimentalAddAlgLeaf(new Pause());
  expect(
    (await twistyPlayerModel.alg.get()).alg.isIdentical(
      new Alg("R U R' D2 F ."),
    ),
  ).toBeTrue();
});

test("can handle async timestamp setting", async () => {
  const twistyPlayerModel = new TwistyPlayerModel();
  twistyPlayerModel.alg.set("R U R'");
  expect(
    (await twistyPlayerModel.detailedTimelineInfo.get()).timestamp,
  ).toStrictEqual(3000);
  twistyPlayerModel.timestampRequest.set((async () => 500)());
  expect(
    (await twistyPlayerModel.detailedTimelineInfo.get()).timestamp,
  ).toStrictEqual(500);
});

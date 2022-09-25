import { expect } from "../../../test/chai-workarounds";
import { Alg, Move, Pause } from "../../alg";
import { TwistyPlayerModel } from "./TwistyPlayerModel";

it("generates Twizzle links", async () => {
  const twistyPlayerModel = new TwistyPlayerModel();
  expect(await twistyPlayerModel.twizzleLink()).to.equal(
    "https://alpha.twizzle.net/edit/",
  );
  twistyPlayerModel.alg.set("R U R'");
  expect(await twistyPlayerModel.twizzleLink()).to.equal(
    "https://alpha.twizzle.net/edit/?alg=R+U+R%27",
  );
  twistyPlayerModel.puzzleIDRequest.set("4x4x4");
  expect(await twistyPlayerModel.twizzleLink()).to.equal(
    "https://alpha.twizzle.net/edit/?alg=R+U+R%27&puzzle=4x4x4",
  );
});

it("adds alg leaves and moves properly", async () => {
  const twistyPlayerModel = new TwistyPlayerModel();
  twistyPlayerModel.alg.set("R U R'");

  twistyPlayerModel.experimentalAddAlgLeaf(new Move("D2"));
  expect((await twistyPlayerModel.alg.get()).alg).to.be.identicalAlg(
    new Alg("R U R' D2"),
  );

  // This should be the same as `.experimentalAddAlgLeaf()`;
  twistyPlayerModel.experimentalAddMove(new Move("F'"));
  expect((await twistyPlayerModel.alg.get()).alg).to.be.identicalAlg(
    new Alg("R U R' D2 F'"),
  );

  twistyPlayerModel.experimentalAddMove(new Move("F2"), {
    cancel: true,
  });
  expect((await twistyPlayerModel.alg.get()).alg).to.be.identicalAlg(
    new Alg("R U R' D2 F"),
  );

  twistyPlayerModel.experimentalAddAlgLeaf(new Pause());
  expect((await twistyPlayerModel.alg.get()).alg).to.be.identicalAlg(
    new Alg("R U R' D2 F ."),
  );
});

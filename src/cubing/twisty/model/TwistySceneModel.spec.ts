import { expect, test } from "bun:test";
import { TwistyPlayerModel } from "./TwistyPlayerModel";

const R = { facelets: new Array(5).fill("regular") };
const D = { facelets: new Array(5).fill("dim") };
const I = { facelets: new Array(5).fill("ignored") };
const O = { facelets: ["regular", ...new Array(4).fill("ignored")] };

test("computes stickering masks correctly.", async () => {
  // TODO: Mock out the `TwistyPlayerModel` and just instantiate a TwistySceneModel
  const twistyPlayerModel = new TwistyPlayerModel();
  const { twistySceneModel } = twistyPlayerModel;
  expect(await twistySceneModel.stickeringMask.get()).toEqual({
    orbits: {
      EDGES: {
        pieces: [R, R, R, R, R, R, R, R, R, R, R, R],
      },
      CORNERS: {
        pieces: [R, R, R, R, R, R, R, R],
      },
      CENTERS: {
        pieces: [R, R, R, R, R, R],
      },
    },
  });
  twistySceneModel.stickeringMaskRequest.set(
    "EDGES:DD----DDD--D,CORNERS:I-----I-,CENTERS:DDDDDD",
  );
  expect(await twistySceneModel.stickeringMask.get()).toEqual({
    orbits: {
      EDGES: {
        pieces: [D, D, R, R, R, R, D, D, D, R, R, D],
      },
      CORNERS: {
        pieces: [I, R, R, R, R, R, I, R],
      },
      CENTERS: {
        pieces: [D, D, D, D, D, D],
      },
    },
  });
  twistySceneModel.stickeringRequest.set("OLL");
  expect(await twistySceneModel.stickeringMask.get()).toEqual({
    orbits: {
      EDGES: {
        pieces: [D, D, R, R, R, R, D, D, D, R, R, D],
      },
      CORNERS: {
        pieces: [I, R, R, R, R, R, I, R],
      },
      CENTERS: {
        pieces: [D, D, D, D, D, D],
      },
    },
  });
  twistySceneModel.stickeringMaskRequest.set(null);
  expect(await twistySceneModel.stickeringMask.get()).toEqual({
    orbits: {
      EDGES: {
        pieces: [O, O, O, O, D, D, D, D, D, D, D, D],
      },
      CORNERS: {
        pieces: [O, O, O, O, D, D, D, D],
      },
      CENTERS: {
        pieces: [R, D, D, D, D, D],
      },
    },
  });
});

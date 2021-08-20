import { Alg } from "../../../../cubing/alg";
import { useNewFaceNames } from "../../../../cubing/puzzle-geometry";
import { TwistyPlayerV2 } from "../../../../cubing/twisty";
import "../../../../cubing/twisty/old/dom/TwistyPlayer";

useNewFaceNames(true);

window.addEventListener("DOMContentLoaded", () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const elem = document.querySelector("#js-init-example")!;
  // tslint:disable-next-line: no-unused-expression
  elem.appendChild(
    new TwistyPlayerV2({
      puzzle: "2x2x2",
      visualization: "2D",
      alg: "R2 F2 U2 R2",
      // playerConfig: {
      //   experimentalBackgroundCheckered: false,
      // },
    }),
  );
});

window.addEventListener("DOMContentLoaded", () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const elem = document.querySelector("#custom-pg3d")!;
  // tslint:disable-next-line: no-unused-expression
  elem.appendChild(
    new TwistyPlayerV2({
      alg: Alg.fromString("[[U', R], [U, R']]"),
      puzzle: "megaminx",
      visualization: "PG3D",
      backView: "top-right",
      background: "none",
    }),
  );
});

import { useNewFaceNames } from "../../cubing/puzzle-geometry";

useNewFaceNames(true);

import { BareBlockMove, parse, Sequence } from "../../cubing/alg/index";
import "../../cubing/twisty/dom/TwistyPlayer";
import { TwistyPlayer } from "../../cubing/twisty/index";

window.addEventListener("load", () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const elem = document.querySelector("#js-init-example")!;
  // tslint:disable-next-line: no-unused-expression
  elem.appendChild(
    new TwistyPlayer({
      puzzle: "2x2x2",
      visualization: "2D",
      alg: new Sequence([
        BareBlockMove("R", 2),
        BareBlockMove("F", 2),
        BareBlockMove("U", 2),
        BareBlockMove("R", 2),
      ]),
      // playerConfig: {
      //   experimentalBackgroundCheckered: false,
      // },
    }),
  );
});

window.addEventListener("load", () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const elem = document.querySelector("#custom-pg3d")!;
  // tslint:disable-next-line: no-unused-expression
  elem.appendChild(
    new TwistyPlayer({
      alg: parse("[[U', R], [U, R']]"),
      puzzle: "megaminx",
      visualization: "PG3D",
      backView: "upper-right",
      background: "none",
      // playerConfig: {
      //   showFoundation: true,
      // },
    }),
  );
});

import { Alg } from "../../../../cubing/alg";
import { TwistyPlayer } from "../../../../cubing/twisty";

window.addEventListener("DOMContentLoaded", () => {
  const elem = document.querySelector("#js-init-example")!;
  // tslint:disable-next-line: no-unused-expression
  elem.appendChild(
    new TwistyPlayer({
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
  const elem = document.querySelector("#custom-pg3d")!;
  // tslint:disable-next-line: no-unused-expression
  elem.appendChild(
    new TwistyPlayer({
      alg: Alg.fromString("[[U', R], [U, R']]"),
      puzzle: "megaminx",
      visualization: "PG3D",
      backView: "top-right",
      background: "none",
    }),
  );
});

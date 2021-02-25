// tslint:disable-next-line no-namespace // TODO: nested module

import { Alg } from "./Alg";
import { Commutator } from "./units/containers/Commutator";
import { Conjugate } from "./units/containers/Conjugate";
import { Turn } from "./units/leaves/Turn";
import { Pause } from "./units/leaves/Pause";

// eslint-disable-next-line @typescript-eslint/no-namespace
export const Example = {
  Sune: new Alg([
    new Turn("R", 1),
    new Turn("U", 1),
    new Turn("R", -1),
    new Turn("U", 1),
    new Turn("R", 1),
    new Turn("U", -2),
    new Turn("R", -1),
  ]),

  AntiSune: new Alg([
    new Turn("R", 1),
    new Turn("U", 2),
    new Turn("R", -1),
    new Turn("U", -1),
    new Turn("R", 1),
    new Turn("U", -1),
    new Turn("R", -1),
  ]),

  SuneCommutator: new Alg([
    new Commutator(
      new Alg([new Turn("R", 1), new Turn("U", 1), new Turn("R", -2)]),
      new Alg([
        new Conjugate(
          new Alg([new Turn("R", 1)]),
          new Alg([new Turn("U", 1)]),
          1,
        ),
      ]),
      1,
    ),
  ]),

  Niklas: new Alg([
    new Turn("R", 1),
    new Turn("U", -1),
    new Turn("L", -1),
    new Turn("U", 1),
    new Turn("R", -1),
    new Turn("U", -1),
    new Turn("L", 1),
    new Turn("U", 1),
  ]),

  EPerm: new Alg([
    new Turn("x", -1),
    new Commutator(
      new Alg([
        new Conjugate(
          new Alg([new Turn("R", 1)]),
          new Alg([new Turn("U", -1)]),
        ),
      ]),
      new Alg([new Turn("D", 1)]),
      1,
    ),
    new Commutator(
      new Alg([
        new Conjugate(new Alg([new Turn("R", 1)]), new Alg([new Turn("U", 1)])),
      ]),
      new Alg([new Turn("D", 1)]),
      1,
    ),
    new Turn("x", 1),
  ]),

  FURURFCompact: new Alg([
    new Conjugate(
      new Alg([new Turn("F", 1)]),
      new Alg([
        new Commutator(
          new Alg([new Turn("U", 1)]),
          new Alg([new Turn("R", 1)]),
          1,
        ),
      ]),
      1,
    ),
  ]),

  APermCompact: new Alg([
    new Conjugate(
      new Alg([new Turn("R", 2)]),
      new Alg([
        new Commutator(
          new Alg([new Turn("F", 2)]),
          new Alg([new Turn("R", -1), new Turn("B", -1), new Turn("R", 1)]),
          1,
        ),
      ]),
      1,
    ),
  ]),

  FURURFMoves: new Alg([
    new Turn("F", 1),
    new Turn("U", 1),
    new Turn("R", 1),
    new Turn("U", -1),
    new Turn("R", -1),
    new Turn("F", -1),
  ]),

  TPerm: new Alg([
    new Turn("R", 1),
    new Turn("U", 1),
    new Turn("R", -1),
    new Turn("U", -1),
    new Turn("R", -1),
    new Turn("F", 1),
    new Turn("R", 2),
    new Turn("U", -1),
    new Turn("R", -1),
    new Turn("U", -1),
    new Turn("R", 1),
    new Turn("U", 1),
    new Turn("R", -1),
    new Turn("F", -1),
  ]),

  HeadlightSwaps: new Alg([
    new Conjugate(
      new Alg([new Turn("F", 1)]),
      new Alg([
        new Commutator(
          new Alg([new Turn("R", 1)]),
          new Alg([new Turn("U", 1)]),
          3,
        ),
      ]),
      1,
    ),
  ]),

  TriplePause: new Alg([new Pause(), new Pause(), new Pause()]),

  // AllAlgParts: [
  //   new Alg([new Move("R", 1), new Move("U", -1)]),
  //   new Grouping(new Alg([new Move("F", 1)]), 2),
  //   // new Rotation("y", -1),
  //   new Move("R", 2),
  //   new Commutator(new Alg([new Move("R", 2)]), new Alg([new Move("U", 2)]), 2),
  //   new Conjugate(new Alg([new Move("L", 2)]), new Alg([new Move("D", -1)]), 2),
  //   new Pause(),
  //   new Newline(),
  //   new LineComment("line comment"),
  // ],
};

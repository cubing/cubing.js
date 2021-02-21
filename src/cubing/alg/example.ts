// tslint:disable-next-line no-namespace // TODO: nested module

import { Move } from "./new/Move";

// eslint-disable-next-line @typescript-eslint/no-namespace
export const Example = {
  Sune: new Sequence([
    new Move("R", 1),
    new Move("U", 1),
    new Move("R", -1),
    new Move("U", 1),
    new Move("R", 1),
    new Move("U", -2),
    new Move("R", -1),
  ]),

  AntiSune: new Sequence([
    new Move("R", 1),
    new Move("U", 2),
    new Move("R", -1),
    new Move("U", -1),
    new Move("R", 1),
    new Move("U", -1),
    new Move("R", -1),
  ]),

  SuneCommutator: new Sequence([
    new Commutator(
      new Sequence([new Move("R", 1), new Move("U", 1), new Move("R", -2)]),
      new Sequence([
        new Conjugate(
          new Sequence([new Move("R", 1)]),
          new Sequence([new Move("U", 1)]),
          1,
        ),
      ]),
      1,
    ),
  ]),

  Niklas: new Sequence([
    new Move("R", 1),
    new Move("U", -1),
    new Move("L", -1),
    new Move("U", 1),
    new Move("R", -1),
    new Move("U", -1),
    new Move("L", 1),
    new Move("U", 1),
  ]),

  EPerm: new Sequence([
    new Move("x", -1),
    new Commutator(
      new Sequence([
        new Conjugate(
          new Sequence([new Move("R", 1)]),
          new Sequence([new Move("U", -1)]),
        ),
      ]),
      new Sequence([new Move("D", 1)]),
      1,
    ),
    new Commutator(
      new Sequence([
        new Conjugate(
          new Sequence([new Move("R", 1)]),
          new Sequence([new Move("U", 1)]),
        ),
      ]),
      new Sequence([new Move("D", 1)]),
      1,
    ),
    new Move("x", 1),
  ]),

  FURURFCompact: new Sequence([
    new Conjugate(
      new Sequence([new Move("F", 1)]),
      new Sequence([
        new Commutator(
          new Sequence([new Move("U", 1)]),
          new Sequence([new Move("R", 1)]),
          1,
        ),
      ]),
      1,
    ),
  ]),

  APermCompact: new Sequence([
    new Conjugate(
      new Sequence([new Move("R", 2)]),
      new Sequence([
        new Commutator(
          new Sequence([new Move("F", 2)]),
          new Sequence([
            new Move("R", -1),
            new Move("B", -1),
            new Move("R", 1),
          ]),
          1,
        ),
      ]),
      1,
    ),
  ]),

  FURURFMoves: new Sequence([
    new Move("F", 1),
    new Move("U", 1),
    new Move("R", 1),
    new Move("U", -1),
    new Move("R", -1),
    new Move("F", -1),
  ]),

  TPerm: new Sequence([
    new Move("R", 1),
    new Move("U", 1),
    new Move("R", -1),
    new Move("U", -1),
    new Move("R", -1),
    new Move("F", 1),
    new Move("R", 2),
    new Move("U", -1),
    new Move("R", -1),
    new Move("U", -1),
    new Move("R", 1),
    new Move("U", 1),
    new Move("R", -1),
    new Move("F", -1),
  ]),

  HeadlightSwaps: new Sequence([
    new Conjugate(
      new Sequence([new Move("F", 1)]),
      new Sequence([
        new Commutator(
          new Sequence([new Move("R", 1)]),
          new Sequence([new Move("U", 1)]),
          3,
        ),
      ]),
      1,
    ),
  ]),

  TriplePause: new Sequence([new Pause(), new Pause(), new Pause()]),

  AllAlgParts: [
    new Sequence([new Move("R", 1), new Move("U", -1)]),
    new Group(new Sequence([new Move("F", 1)]), 2),
    // new Rotation("y", -1),
    new Move("R", 2),
    new Commutator(
      new Sequence([new Move("R", 2)]),
      new Sequence([new Move("U", 2)]),
      2,
    ),
    new Conjugate(
      new Sequence([new Move("L", 2)]),
      new Sequence([new Move("D", -1)]),
      2,
    ),
    new Pause(),
    new NewLine(),
    new Comment("short comment"),
  ],
};

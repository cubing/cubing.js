import {
  BareBlockMove,
  Comment,
  Commutator,
  Conjugate,
  Group,
  NewLine,
  Pause,
  Sequence,
} from "./algorithm";

// tslint:disable-next-line no-namespace // TODO: nested module
// eslint-disable-next-line @typescript-eslint/no-namespace
export const Example = {
  Sune: new Sequence([
    BareBlockMove("R", 1),
    BareBlockMove("U", 1),
    BareBlockMove("R", -1),
    BareBlockMove("U", 1),
    BareBlockMove("R", 1),
    BareBlockMove("U", -2),
    BareBlockMove("R", -1),
  ]),

  AntiSune: new Sequence([
    BareBlockMove("R", 1),
    BareBlockMove("U", 2),
    BareBlockMove("R", -1),
    BareBlockMove("U", -1),
    BareBlockMove("R", 1),
    BareBlockMove("U", -1),
    BareBlockMove("R", -1),
  ]),

  SuneCommutator: new Sequence([
    new Commutator(
      new Sequence([
        BareBlockMove("R", 1),
        BareBlockMove("U", 1),
        BareBlockMove("R", -2),
      ]),
      new Sequence([
        new Conjugate(
          new Sequence([BareBlockMove("R", 1)]),
          new Sequence([BareBlockMove("U", 1)]),
          1,
        ),
      ]),
      1,
    ),
  ]),

  Niklas: new Sequence([
    BareBlockMove("R", 1),
    BareBlockMove("U", -1),
    BareBlockMove("L", -1),
    BareBlockMove("U", 1),
    BareBlockMove("R", -1),
    BareBlockMove("U", -1),
    BareBlockMove("L", 1),
    BareBlockMove("U", 1),
  ]),

  EPerm: new Sequence([
    BareBlockMove("x", -1),
    new Commutator(
      new Sequence([
        new Conjugate(
          new Sequence([BareBlockMove("R", 1)]),
          new Sequence([BareBlockMove("U", -1)]),
        ),
      ]),
      new Sequence([BareBlockMove("D", 1)]),
      1,
    ),
    new Commutator(
      new Sequence([
        new Conjugate(
          new Sequence([BareBlockMove("R", 1)]),
          new Sequence([BareBlockMove("U", 1)]),
        ),
      ]),
      new Sequence([BareBlockMove("D", 1)]),
      1,
    ),
    BareBlockMove("x", 1),
  ]),

  FURURFCompact: new Sequence([
    new Conjugate(
      new Sequence([BareBlockMove("F", 1)]),
      new Sequence([
        new Commutator(
          new Sequence([BareBlockMove("U", 1)]),
          new Sequence([BareBlockMove("R", 1)]),
          1,
        ),
      ]),
      1,
    ),
  ]),

  APermCompact: new Sequence([
    new Conjugate(
      new Sequence([BareBlockMove("R", 2)]),
      new Sequence([
        new Commutator(
          new Sequence([BareBlockMove("F", 2)]),
          new Sequence([
            BareBlockMove("R", -1),
            BareBlockMove("B", -1),
            BareBlockMove("R", 1),
          ]),
          1,
        ),
      ]),
      1,
    ),
  ]),

  FURURFMoves: new Sequence([
    BareBlockMove("F", 1),
    BareBlockMove("U", 1),
    BareBlockMove("R", 1),
    BareBlockMove("U", -1),
    BareBlockMove("R", -1),
    BareBlockMove("F", -1),
  ]),

  TPerm: new Sequence([
    BareBlockMove("R", 1),
    BareBlockMove("U", 1),
    BareBlockMove("R", -1),
    BareBlockMove("U", -1),
    BareBlockMove("R", -1),
    BareBlockMove("F", 1),
    BareBlockMove("R", 2),
    BareBlockMove("U", -1),
    BareBlockMove("R", -1),
    BareBlockMove("U", -1),
    BareBlockMove("R", 1),
    BareBlockMove("U", 1),
    BareBlockMove("R", -1),
    BareBlockMove("F", -1),
  ]),

  HeadlightSwaps: new Sequence([
    new Conjugate(
      new Sequence([BareBlockMove("F", 1)]),
      new Sequence([
        new Commutator(
          new Sequence([BareBlockMove("R", 1)]),
          new Sequence([BareBlockMove("U", 1)]),
          3,
        ),
      ]),
      1,
    ),
  ]),

  TriplePause: new Sequence([new Pause(), new Pause(), new Pause()]),

  AllAlgParts: [
    new Sequence([BareBlockMove("R", 1), BareBlockMove("U", -1)]),
    new Group(new Sequence([BareBlockMove("F", 1)]), 2),
    // new Rotation("y", -1),
    BareBlockMove("R", 2),
    new Commutator(
      new Sequence([BareBlockMove("R", 2)]),
      new Sequence([BareBlockMove("U", 2)]),
      2,
    ),
    new Conjugate(
      new Sequence([BareBlockMove("L", 2)]),
      new Sequence([BareBlockMove("D", -1)]),
      2,
    ),
    new Pause(),
    new NewLine(),
    new Comment("short comment"),
  ],
};

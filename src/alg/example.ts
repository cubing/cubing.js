import {
  AlgPart,
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
export namespace Example {

  export const Sune: Sequence = new Sequence([
    BareBlockMove("R", 1),
    BareBlockMove("U", 1),
    BareBlockMove("R", -1),
    BareBlockMove("U", 1),
    BareBlockMove("R", 1),
    BareBlockMove("U", -2),
    BareBlockMove("R", -1),
  ]);

  export const AntiSune: Sequence = new Sequence([
    BareBlockMove("R", 1),
    BareBlockMove("U", 2),
    BareBlockMove("R", -1),
    BareBlockMove("U", -1),
    BareBlockMove("R", 1),
    BareBlockMove("U", -1),
    BareBlockMove("R", -1),
  ]);

  export const SuneCommutator: Sequence = new Sequence([new Commutator(
    new Sequence([
      BareBlockMove("R", 1),
      BareBlockMove("U", 1),
      BareBlockMove("R", -2),
    ]),
    new Sequence([new Conjugate(
      new Sequence([BareBlockMove("R", 1)]),
      new Sequence([BareBlockMove("U", 1)]),
      1,
    )]),
    1,
  )]);

  export const Niklas: Sequence = new Sequence([
    BareBlockMove("R", 1),
    BareBlockMove("U", -1),
    BareBlockMove("L", -1),
    BareBlockMove("U", 1),
    BareBlockMove("R", -1),
    BareBlockMove("U", -1),
    BareBlockMove("L", 1),
    BareBlockMove("U", 1),
  ]);

  export const EPerm: Sequence = new Sequence([
    BareBlockMove("x", -1),
    new Commutator(
      new Sequence([new Conjugate(
        new Sequence([BareBlockMove("R", 1)]),
        new Sequence([BareBlockMove("U", -1)]),
      )]),
      new Sequence([BareBlockMove("D", 1)]),
      1,
    ),
    new Commutator(
      new Sequence([new Conjugate(
        new Sequence([BareBlockMove("R", 1)]),
        new Sequence([BareBlockMove("U", 1)]),
      )]),
      new Sequence([BareBlockMove("D", 1)]),
      1,
    ),
    BareBlockMove("x", 1),
  ]);

  export const FURURFCompact: Sequence = new Sequence([new Conjugate(
    new Sequence([BareBlockMove("F", 1)]),
    new Sequence([new Commutator(
      new Sequence([BareBlockMove("U", 1)]),
      new Sequence([BareBlockMove("R", 1)]),
      1,
    )]),
    1,
  )]);

  export const APermCompact: Sequence = new Sequence([new Conjugate(
    new Sequence([BareBlockMove("R", 2)]),
    new Sequence([new Commutator(
      new Sequence([BareBlockMove("F", 2)]),
      new Sequence([
        BareBlockMove("R", -1),
        BareBlockMove("B", -1),
        BareBlockMove("R", 1),
      ]),
      1,
    )]),
    1,
  )]);

  export const FURURFMoves: Sequence = new Sequence([
    BareBlockMove("F", 1),
    BareBlockMove("U", 1),
    BareBlockMove("R", 1),
    BareBlockMove("U", -1),
    BareBlockMove("R", -1),
    BareBlockMove("F", -1),
  ]);

  export const TPerm: Sequence = new Sequence([
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
  ]);

  export const HeadlightSwaps: Sequence = new Sequence([new Conjugate(
    new Sequence([BareBlockMove("F", 1)]),
    new Sequence([new Commutator(
      new Sequence([BareBlockMove("R", 1)]),
      new Sequence([BareBlockMove("U", 1)]),
      3,
    )]),
    1,
  )]);

  export const TriplePause: Sequence = new Sequence([
    new Pause(),
    new Pause(),
    new Pause(),
  ],
  );

  export const AllAlgParts: AlgPart[] = [
    new Sequence([BareBlockMove("R", 1), BareBlockMove("U", -1)]),
    new Group(new Sequence([BareBlockMove("F", 1)]), 2),
    // new Rotation("y", -1),
    BareBlockMove("R", 2),
    new Commutator(new Sequence([BareBlockMove("R", 2)]), new Sequence([BareBlockMove("U", 2)]), 2),
    new Conjugate(new Sequence([BareBlockMove("L", 2)]), new Sequence([BareBlockMove("D", -1)]), 2),
    new Pause(),
    new NewLine(),
    new Comment("short comment"),
  ];

}

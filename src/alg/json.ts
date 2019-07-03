import {
  Unit,
  Sequence,
  Group,
  BlockMove,
  Commutator,
  Conjugate,
  Pause,
  NewLine,
  CommentShort,
  CommentLong
} from "./algorithm/index";

// TODO: Turn this into a union.
export interface AlgJSON {
  type: string;
  nestedSequence?: AlgJSON;
  nestedUnits?: AlgJSON[];
  innerLayer?: number;
  outerLayer?: number;
  family?: string;
  amount?: number;
  A?: AlgJSON;
  B?: AlgJSON;
  comment?: string;
}

export function fromJSON(json: AlgJSON): Sequence {
  if (json.type !== "sequence") {
    throw `Expected Sequence while parsing, got: ${json.type}`
  }
  if (!json.nestedUnits) { throw "Missing nestedUnits" }
  return new Sequence(json.nestedUnits.map(j => unitFromJSON(j)));
}

function unitFromJSON(json: AlgJSON): Unit {
  switch (json.type) {
    case "sequence":
      throw `Expected AlgPart while parsing, got \`Sequence\`.`
    case "group":
      if (!json.nestedSequence) { throw "Missing nestedSequence" }
      if (!json.amount) { throw "Missing amount" }
      return new Group(fromJSON(json.nestedSequence), json.amount);
    case "blockMove":
      // TODO: Double-check that there is no outer layer without an inner layer?
      if (!json.family) { throw "Missing family" }
      if (!json.amount) { throw "Missing amount" }
      return new BlockMove(json.outerLayer, json.innerLayer, json.family, json.amount);
    case "commutator":
      if (!json.A) { throw "Missing A" }
      if (!json.B) { throw "Missing B" }
      if (!json.amount) { throw "Missing amount" }
      return new Commutator(fromJSON(json.A), fromJSON(json.B), json.amount);
    case "conjugate":
      if (!json.A) { throw "Missing A" }
      if (!json.B) { throw "Missing B" }
      if (!json.amount) { throw "Missing amount" }
      return new Conjugate(fromJSON(json.A), fromJSON(json.B), json.amount);
    case "pause":
      return new Pause();
    case "newLine":
      return new NewLine();
    case "commentShort":
      if (!json.comment) { throw "Missing comment" }
      return new CommentShort(json.comment);
    case "commentLong":
      if (!json.comment) { throw "Missing comment" }
      return new CommentLong(json.comment);
    default:
      throw `Unknown alg type: ${json.type}`;
  }
}

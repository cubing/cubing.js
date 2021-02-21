import {
  BlockMove,
  Comment,
  Commutator,
  Conjugate,
  Group,
  NewLine,
  Pause,
  Sequence,
  Unit,
} from "./algorithm";

// TODO: Turn this into a union.
export interface OldAlgJSON {
  type: string;
  nestedSequence?: OldAlgJSON;
  nestedUnits?: OldAlgJSON[];
  innerLayer?: number;
  outerLayer?: number;
  family?: string;
  amount?: number;
  A?: OldAlgJSON;
  B?: OldAlgJSON;
  comment?: string;
}

export function fromJSON(json: OldAlgJSON): Sequence {
  if (json.type !== "sequence") {
    throw new Error(`Expected Sequence while parsing, got: ${json.type}`);
  }
  if (!json.nestedUnits) {
    throw new Error("Missing nestedUnits");
  }
  return new Sequence(json.nestedUnits.map((j) => unitFromJSON(j)));
}

function unitFromJSON(json: OldAlgJSON): Unit {
  switch (json.type) {
    case "sequence":
      throw new Error(`Expected AlgPart while parsing, got \`Sequence\`.`);
    case "group":
      if (!json.nestedSequence) {
        throw new Error("Missing nestedSequence");
      }
      if (!json.amount) {
        throw new Error("Missing amount");
      }
      return new Group(fromJSON(json.nestedSequence), json.amount);
    case "blockMove":
      // TODO: Double-check that there is no outer layer without an inner layer?
      if (!json.family) {
        throw new Error("Missing family");
      }
      if (!json.amount) {
        throw new Error("Missing amount");
      }
      return new BlockMove(
        json.outerLayer,
        json.innerLayer,
        json.family,
        json.amount,
      );
    case "commutator":
      if (!json.A) {
        throw new Error("Missing A");
      }
      if (!json.B) {
        throw new Error("Missing B");
      }
      if (!json.amount) {
        throw new Error("Missing amount");
      }
      return new Commutator(fromJSON(json.A), fromJSON(json.B), json.amount);
    case "conjugate":
      if (!json.A) {
        throw new Error("Missing A");
      }
      if (!json.B) {
        throw new Error("Missing B");
      }
      if (!json.amount) {
        throw new Error("Missing amount");
      }
      return new Conjugate(fromJSON(json.A), fromJSON(json.B), json.amount);
    case "pause":
      return new Pause();
    case "newLine":
      return new NewLine();
    case "comment":
      // The empty string is nullish, so we check for it separately.
      if (!json.comment && json.comment !== "") {
        throw new Error("Missing comment");
      }
      return new Comment(json.comment);
    default:
      throw new Error(`Unknown alg type: ${json.type}`);
  }
}

export interface MoveJSON {
  type: "move";
  family: string;
  innerLayer?: number;
  outerLayer?: number;
}

export interface BunchJSON {
  type: "bunch";
  alg: AlgJSON;
}

export interface CommentJSON {
  type: "comment";
  text: string;
}

export type UnitJSON = MoveJSON | BunchJSON;

export interface AlgJSON {
  type: "alg";
  units: UnitJSON[];
}

export interface Serializable {
  toString(): string;
  toJSON(): AlgJSON | UnitJSON; // TODO
}

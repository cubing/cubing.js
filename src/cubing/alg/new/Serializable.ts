export interface MoveJSON {
  type: "move";
  family: string;
  innerLayer?: number;
  outerLayer?: number;
}

export type UnitJSON = MoveJSON;

export interface AlgJSON {
  type: "alg";
  units: UnitJSON[];
}

export interface Serializable {
  toString(): string;
  toJSON(): AlgJSON | UnitJSON; // TODO
}

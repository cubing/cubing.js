// // type ConfigAttributes = Record<string, any>;

import { Vector3 } from "three";
import { algToString, parse, Sequence } from "../../../alg";

export class AlgAttribute {
  string: string;
  value: Sequence;
  constructor(initialValue?: Sequence) {
    this.setValue(initialValue ?? this.defaultValue());
  }

  // Return value indicates if the attribute changed.
  setString(str: string): boolean {
    if (this.string === str) {
      return false;
    }
    this.string = str;
    this.value = this.toValue(str);
    return true;
  }

  // Return value indicates if the attribute changed.
  setValue(val: Sequence): boolean {
    const str = this.toString(val);
    if (this.string === str) {
      return false;
    }
    this.string = str;
    this.value = val;
    return true;
  }

  private defaultValue(): Sequence {
    return new Sequence([]);
  }

  private toValue(s: string): Sequence {
    return parse(s);
  }

  private toString(s: Sequence): string {
    return algToString(s);
  }
}

// TODO: subset of string rather than `extends`
export class StringEnumAttribute<E extends string> {
  string: string;
  value: E;
  valid: boolean;
  constructor(private enumVal: { [key: string]: boolean }, initialValue?: E) {
    this.setString(initialValue ?? this.defaultValue());
  }

  // Return value indicates if the attribute changed.
  setString(str: string): boolean {
    if (this.string === str) {
      return false;
    }
    if (!(str in this.enumVal)) {
      throw new Error(`Invalid string for attribute!: ${str}`);
    }
    this.string = str;
    this.value = this.toValue(str);
    return true;
  }

  // Return value indicates if the attribute changed.
  setValue(val: string): boolean {
    return this.setString(val);
  }

  private defaultValue(): string {
    return Object.keys(this.enumVal)[0]; // TODO
  }

  private toValue(s: string): E {
    return s as E;
  }

  // private toString(s: string): string {
  //   return s;
  // }
}

// TODO: subset of string rather than `extends`
export class StringFakeEnumAttribute<E extends string> {
  string: string;
  value: E;
  valid: boolean;
  constructor(private validStrings: string[], initialValue?: E) {
    this.setString(initialValue ?? this.defaultValue());
  }

  // Return value indicates if the attribute changed.
  setString(str: string): boolean {
    if (this.string === str) {
      return false;
    }
    if (!this.validStrings.includes(str)) {
      throw new Error(`Invalid string for attribute!: ${str}`);
    }
    this.string = str;
    this.value = this.toValue(str);
    return true;
  }

  // Return value indicates if the attribute changed.
  setValue(val: string): boolean {
    return this.setString(val);
  }

  private defaultValue(): string {
    return this.validStrings[0];
  }

  private toValue(s: string): E {
    return s as E;
  }

  // private toString(s: string): string {
  //   return s;
  // }
}

export class Vector3Attribute {
  string: string;
  value: Vector3;
  #defaultValue: Vector3;
  constructor(defaultValue: Vector3, initialValue?: Vector3) {
    this.#defaultValue = defaultValue;
    this.setValue(initialValue ?? this.defaultValue());
  }

  // Return value indicates if the attribute changed.
  setString(str: string): boolean {
    return this.setValue(this.toValue(str));
  }

  // Return value indicates if the attribute changed.
  setValue(val: Vector3): boolean {
    const str = this.toString(val);
    if (this.string === str) {
      return false;
    }
    this.string = str;
    this.value = val;
    return true;
  }

  private defaultValue(): Vector3 {
    return this.#defaultValue;
  }

  private toValue(s: string): Vector3 {
    if (!s.startsWith("[")) {
      throw new Error("TODO");
    }
    if (!s.endsWith("]")) {
      throw new Error("TODO");
    }
    const coords = s.slice(1, s.length - 1).split(",");
    if (coords.length !== 3) {
      throw new Error("TODO");
    }
    const [x, y, z] = coords.map((c) => parseInt(c, 10));
    return new Vector3(x, y, z);
  }

  private toString(v: Vector3): string {
    return `[${v.x}, ${v.y}, ${v.z}]`;
  }
}

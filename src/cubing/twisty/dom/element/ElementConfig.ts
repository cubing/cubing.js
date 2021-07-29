// // type ConfigAttributes = Record<string, any>;

import { Vector3 } from "three";
import { Alg } from "../../../alg";

export class AlgAttribute {
  string: string;
  value: Alg;
  constructor(initialValue?: Alg | string) {
    if (initialValue) {
      if (typeof initialValue === "string") {
        this.setString(initialValue);
      } else {
        this.setValue(initialValue);
      }
    } else {
      this.setValue(this.defaultValue());
    }
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
  setValue(val: Alg): boolean {
    const str = this.toString(val);
    if (this.string === str) {
      return false;
    }
    this.string = str;
    this.value = val;
    return true;
  }

  private defaultValue(): Alg {
    return new Alg([]);
  }

  private toValue(s: string): Alg {
    return Alg.fromString(s);
  }

  private toString(val: Alg): string {
    return val.toString();
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
  value: Vector3 | null;
  #defaultValue: Vector3 | null;
  constructor(defaultValue: Vector3 | null, initialValue?: Vector3 | null) {
    this.#defaultValue = defaultValue;
    this.setValue(initialValue ?? this.defaultValue());
  }

  // Return value indicates if the attribute changed.
  setString(str: string): boolean {
    return this.setValue(str === "" ? null : this.toValue(str)); // TODO: test empty string
  }

  // Return value indicates if the attribute changed.
  setValue(val: Vector3 | null): boolean {
    const str = this.toString(val);
    if (this.string === str) {
      return false;
    }
    this.string = str;
    this.value = val;
    return true;
  }

  private defaultValue(): Vector3 | null {
    return this.#defaultValue;
  }

  private toValue(s: string): Vector3 | null {
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
    const [x, y, z] = coords.map((c) => parseFloat(c));
    return new Vector3(x, y, z);
  }

  private toString(v: Vector3 | null): string {
    return v ? `[${v.x}, ${v.y}, ${v.z}]` : ""; // TODO: empty string is not null
  }
}

export class RangedFloatAttribute {
  string: string;
  value: number | null;
  #defaultValue: number | null;
  constructor(
    defaultValue: number | null,
    private minValue: number,
    private maxValue: number,
    initialValue?: number | null,
  ) {
    this.#defaultValue =
      defaultValue === null ? null : this.#clampValue(defaultValue);
    this.setValue(initialValue ?? this.defaultValue());
  }

  #clampValue(val: number) {
    return Math.max(Math.min(val, this.maxValue), this.minValue);
  }

  // Return value indicates if the attribute changed.
  setString(str: string): boolean {
    return this.setValue(str === "" ? null : this.toValue(str)); // TODO: test empty string
  }

  // Return value indicates if the attribute changed.
  setValue(val: number | null): boolean {
    const str = this.toString(val);
    if (this.string === str) {
      return false;
    }
    this.string = str;
    this.value = val;
    return true;
  }

  private defaultValue(): number | null {
    return this.#defaultValue;
  }

  private toValue(s: string): number | null {
    return parseFloat(s);
  }

  private toString(v: number | null): string {
    return v === null ? "" : v.toString();
  }
}

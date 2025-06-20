// Manages a set of face names.  Detects whether they are prefix-free.
// Implements greedy splitting into face names and comparisons between
// concatenated face names and grip names.

export class FaceNameSwizzler {
  public prefixFree: boolean = true;
  public gripnames: string[] = [];
  constructor(
    public facenames: string[],
    gripnames_arg?: string[],
  ) {
    if (gripnames_arg) {
      this.gripnames = gripnames_arg;
    }
    for (let i = 0; this.prefixFree && i < facenames.length; i++) {
      for (let j = 0; this.prefixFree && j < facenames.length; j++) {
        if (i !== j && facenames[i].startsWith(facenames[j])) {
          this.prefixFree = false;
        }
      }
    }
  }

  public setGripNames(names: string[]): void {
    this.gripnames = names;
  }

  // split a string into face names and return a list of
  // indices.
  public splitByFaceNames(s: string): number[] {
    const r = [];
    let at = 0;
    while (at < s.length) {
      if (at > 0 && at < s.length && s[at] === "_") {
        at++;
      }
      let currentMatch = -1;
      for (let i = 0; i < this.facenames.length; i++) {
        if (
          s.substr(at).startsWith(this.facenames[i]) &&
          (currentMatch < 0 ||
            this.facenames[i].length > this.facenames[currentMatch].length)
        ) {
          currentMatch = i;
        }
      }
      if (currentMatch >= 0) {
        r.push(currentMatch);
        at += this.facenames[currentMatch].length;
      } else {
        throw new Error(`Could not split ${s} into face names.`);
      }
    }
    return r;
  }

  // cons a grip from an array of numbers.
  public joinByFaceIndices(list: number[]): string {
    let sep = "";
    const r = [];
    for (let i = 0; i < list.length; i++) {
      r.push(sep);
      r.push(this.facenames[list[i]]);
      if (!this.prefixFree) {
        sep = "_";
      }
    }
    return r.join("");
  }

  /*
   *   Try to match something the user gave us with some geometric
   *   feature.  We used to have strict requirements:
   *
   *      a)  The set of face names are prefix free
   *      b)  When specifying a corner, all coincident planes were
   *          specified
   *
   *   But, to allow megaminx to have more reasonable and
   *   conventional names, and to permit shorter canonical
   *   names, we are relaxing these requirements and adding
   *   new syntax.  Now:
   *
   *      a)  Face names need not be syntax free.
   *      b)  When parsing a geometric name, we use greedy
   *          matching, so the longest name that matches the
   *          user string at the current position is the one
   *          assumed to match.
   *      c)  Underscores are permitted to separate face names
   *          (both in user input and in geometric
   *          descriptions).
   *      d)  Default names of corner moves where corners have
   *          more than three corners, need only include three
   *          of the corners.
   *
   *   This code is not performance-sensitive so we can do it a
   *   slow and simple way.
   */
  public spinmatch(userinput: string, longname: string): boolean {
    // are these the same rotationally?
    if (userinput === longname) {
      return true;
    }
    try {
      const e1 = this.splitByFaceNames(userinput);
      const e2 = this.splitByFaceNames(longname);
      // All elements of userinput need to be in the longname.
      // There should be no duplicate elements in the userinput.
      // if both have length 1 or length 2, the sets must be equal.
      // if both have length 3 or more, then the first set must be
      // a subset of the second.  Order doesn't matter.
      if (e1.length !== e2.length && e1.length < 3) {
        return false;
      }
      for (let i = 0; i < e1.length; i++) {
        for (let j = 0; j < i; j++) {
          if (e1[i] === e1[j]) {
            return false;
          }
        }
        let found = false;
        for (let j = 0; j < e2.length; j++) {
          if (e1[i] === e2[j]) {
            found = true;
            break;
          }
        }
        if (!found) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  /* same as above, but permit both to have v's on the end. */
  public spinmatchv(userinput: string, longname: string): boolean {
    if (userinput.endsWith("v") && longname.endsWith("v")) {
      return this.spinmatch(
        userinput.slice(0, userinput.length - 1),
        longname.slice(0, longname.length - 1),
      );
    } else {
      return this.spinmatch(userinput, longname);
    }
  }

  public unswizzle(s: string): string {
    if ((s.endsWith("v") || s.endsWith("w")) && s[0] <= "Z") {
      s = s.slice(0, s.length - 1);
    }
    const upperCaseGrip = s.toUpperCase();
    for (let i = 0; i < this.gripnames.length; i++) {
      const g = this.gripnames[i];
      if (this.spinmatch(upperCaseGrip, g)) {
        return g;
      }
    }
    return s;
  }
}

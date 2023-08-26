import type { KPattern } from "./KPattern";

// TODO: Use a list instead of an object for performance?
export type KPatternData = Record<string, KPatternOrbitData>;
export interface KPatternOrbitData {
  pieces: number[];
  orientation: number[];
  /** Each piece may have an "orientation mod" that means "the orientation of
   * this piece is known mod [value]".
   *
   * Suppose `.numOrientations` for this orbit has a value of N. This is
   * considered the default value for the orientation mod of each piece in the
   * orbit.
   *
   * - Each entry must be one of the following:
   *   - A proper divisor of N.
   *     - For example: if N is 12, then one of: 1, 2, 3, 6
   *   - The special value 0, indicating the default value (N).
   *     - This indicates that the orientation of a piece is fully known, i.e.
   *        that its "orientation mod" is the default value (N). However, such a
   *        value is recorded as 0 instead of N, in order to make it simpler to
   *        implement and debug pattern logic involving the default value.
   * - If `.orientationMod[i]` is a proper divisor of N (i.e. not 0), then
   *   `.orientation[i]` must be less than `.orientationMod[i]`. That is, the
   *   orientation values must be individually "normalized" for each piece.
   * - If the `orientationMod` field is not present, then every piece is
   *   considered to have the default value for its "orientation mod".
   *
   * For a "real-world" example of this concept, consider a traditional analog
   * 12-hour clock dial, like one that might hang on the wall in a school room.
   * Although there are 24 hours in a day, A.M. and P.M. times are not
   * distinguishable on such a clock. Since 3:00 (AM) and 15:00 are not
   * distinguishable, we would read either of those times as 3:00 with an
   * implicit "orientation mod" of 12.
   *
   * For most puzzles, however, we care about "visual" indistinguishability
   * rather than "temporal" indistinguishability. To adapt the previous example,
   * imagine a 24-hour clock with 24 hour marks around the dial, but where the
   * hour hand is symmetric and points equally at the current hour as well as
   * its diametic opposite (like a compass needle but painted all in one color).
   * This has the same set of "valid patterns" as a normal 12-hour clock. Such a
   * clock also has an "orientation mod" of 12, but where the multiples of the
   * modulus have been "unfolded" to show their full symmetry instead of being
   * implicit.
   *
   * For a non-trivial puzzle example, consider Eitan's FisherTwist, a shape mod
   * of the 3x3x3 cube:
   * https://www.hknowstore.com/locale/en-US/item.aspx?corpname=nowstore&itemid=97eb4e89-367e-4d02-b7f0-34e5e7f3cd12
   *
   * - The 4 equatorial centers have C₂ symmetry — it is possible to rotate any
   *   of these centers 180° without a visible change to the state. This means
   *   that the possible orientations "loop" after incrementing the orientation
   *   by 2 (two turns clockwise), and therefore the "orientation mod" of a
   *   given piece is only 2.
   *   - If we apply a counter-clockwise rotation to one of these centers, the
   *     transformation applies an orientation of 3. But the net orientation is
   *     recorded as a normalized value of 1 instead, because 3 (mod 2) ≡ 1 (mod
   *     2).
   * - The 2 polar centers (U and D) have no distinguishable rotations. This
   *   means that their orientation is "known mod 1" — any transformation of one
   *   of these centers is indistinguishable from another transformation of the
   *   same center, and all of them are mapped to a value of 0 (the only
   *   possible value that exists mod 1).
   *
   * For 3x3x3:
   *
   * - When solving a normal 3x3x3, center orientations are conventionally
   *   ignored. This is similar to the polar center case for Eitan's
   *   FisherTwist, and the "orientation mod" of each piece is 1. This is also
   *   the core motivating use case.
   * - For a supercube
   *   (https://experiments.cubing.net/cubing.js/twisty/supercube.html) or the
   *   general case of a "picture cube", all four center orientations are
   *   distinguishable for every center. This means all centers have the default
   *   orientation mod of 4. As documented above, this can be recorded with a
   *   `.orientationMod` of `[0, 0, 0, 0, 0, 0]`, or equivalently by omitting
   *   the `.orientationMod` field.
   * - When modeling a real 3x3x3 speedcube, it is common to have a logo on a
   *   single sticker. If you want to model the exact visually distinguishable
   *   states of such a puzzles, it is possible to use an `.orientationMod` such
   *   as `[0, 1, 1, 1, 1, 1]`. For example, this can make it easy to find an
   *   alg for a given case "while keeping the logo the same", without placing
   *   more restrictions on other centers (which could make the search slower or
   *   produce longer solutions).
   *
   * For those with a mathematical background, you may notice a relationship to
   * the concept of a coset (https://en.wikipedia.org/wiki/Coset). For example,
   * consider the group of patterns of a `KPuzzle` (without indistinguishable
   * pieces) generated by a set of transformations. We can assign each set of
   * piece orbits an orientation mod value (which must be identical for all
   * constituent pieces of the same orbit). Each such choice generates a set of
   * valid `KPattern`s that forms a subgroup, and each set of valid `.orientation`
   * values defines one coset of this set. However, note that the set of valid
   * `KPattern`s does *not* form a group when there are any pieces with different
   * `.orientationMod` values that share an orbit.
   *
   * --------
   *
   * Note that the concept of "orientation mod" exclusively applies to `KPattern`,
   * not `KTransformation`. If we tried to apply the orientation mod
   * calculations to the *transformations* of Eitan's FisherTwist, then `SWAP =
   * [U, M' E2 M]` would be indistinguishable from the identity. This would mean
   * that if we calculated `SWAP` and then used this calculation for `S SWAP
   * S'`, then we would conclude that it has no net effect. However, `S SWAP S'`
   * does *not* have the same effect as doing nothing — it visibly rotates the L
   * and R centers! (In mathematical terms: the set of `KTransformation`s would
   * not form a valid set of semigroup actions, due to broken associativity.)
   *
   * Although there are times that we could theoretically save some time/space
   * by ignoring some information when it's not needed for working with certain
   * `KTransformation`s (e.g. ignoring all center orientations for 3x3x3), it is
   * more practical for each `KTransformation` to always track the full range
   * for each piece's `.orientation`. For example:
   *
   * - This is simpler, both conceptually and in code.
   * - This allows changing the set of moves for a puzzle, without recalculating
   *   cached transformations or certain lookup tables (useful for alg
   *   searches).
   * - This allows swapping out a normal 3x3x3 in a `<twisty-player>` for a
   *   picture cube, without re-calculating the center orientations of the
   *   current alg.
   *
   * These use cases may not be strictly "necessary", but the opposite behaviour
   * might be surprising or frustrating if someone does not expect it. So we
   * implement it this way.
   *
   * Informally, the `KTransformation` has the full responsibility for tracking
   * "what really happens" — even if the effect is invisible in some cases,
   * while the `KPattern` tracks both what "is" and what "isn't" known.
   **/
  orientationMod?: number[];
}

// TODO: Use a list instead of an object for performance?
export type KTransformationData = Record<string, KTransformationOrbitData>;
export interface KTransformationOrbitData {
  permutation: number[];
  orientationDelta: number[];
}

export interface KPuzzleOrbitDefinition {
  orbitName: string;
  numPieces: number;
  numOrientations: number;
}

export interface KPuzzleDefinition {
  name: string;
  orbits: KPuzzleOrbitDefinition[];
  defaultPattern: KPatternData;
  moves: Record<string, KTransformationData>;
  derivedMoves?: Record<string, string>;
  // Note: the options are intentionally required for now, since we haven't yet
  // figured out how to make sure there is no unexpected behaviour with the
  // defaults.
  experimentalIsPatternSolved?: (
    kpattern: KPattern,
    options: {
      ignorePuzzleOrientation: boolean;
      ignoreCenterOrientation: boolean;
    },
  ) => boolean;
}

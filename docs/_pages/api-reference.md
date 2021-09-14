---
title: API Reference
permalink: "/api-reference/"
toc: true
toc_sticky: true
---

## `cubing/alg`

The most important classes in `cubing/alg` are `Alg` and `Move`.

### `Alg` Overview


#### Class Definition

```javascript
class Alg {
  // Constructors
  constructor(alg: Unit[] | Iterable<Unit>)
  constructor(alg: string)

  // String conversion
  static fromString(s: string): Alg;
  toString(): string;

  // Comparison
  isIdentical(other: Alg): boolean;

  // Operations
  invert(): Alg;
  concat(input: Alg): Alg;
  expand(options?: {
    depth?: number;
  }): Alg;
  simplify(options?: {
    collapseMoves?: boolean;
    quantumMoveOrder?: (quantumMove: QuantumMove) => number;
    depth?: number | null;
  }): Alg;

  // Contents
  units(): Generator;
  experimentalLeafMoves(): Generator<Move>;
  experimentalIsEmpty(): boolean;
  experimentalNumUnits(): number;
}
```

#### Methods

Alg objects are immutable. In order to modify and Alg, you can call its methods:

* alg.invert()
* alg.concat(alg2)
* alg.expand()
* alg.simplify()

Refer to the code examples below for usage of these functions.

```javascript
import { Alg } from "cubing/alg";

const commutator = new Alg("[R, [U': L']]");
commutator.expand()g().log(); 
```

Will result in the following:

```shell
Alg {} "R U' L' U R' U' L U"
```


```javascript
import { Alg } from "cubing/alg";
const commutator = new Alg("[R, [U': L']]");

const niklas = commutator.concat("U'");
niklas.log();
niklas.expand().log();
niklas.expand().simplify().log();  
```

Will result in the following:

```shell
 Alg {} "[R, [U': L']] U'" 
 Alg {} "R U' L' U R' U' L U U'" 
 Alg {} "R U' L' U R' U' L" 
```

```javascript
import { Alg } from "cubing/alg";

const sune = new Alg("[R U R2', [R: U]]");
const antiSune = sune.invert();
antiSune.log();
antiSune.expand().log(); 
```

Will result in the following:

```shell
 Alg {} "[[R: U], R U R2']" 
 Alg {} "R U2 R' U' R U' R'" 
```

```javascript
import { Alg } from "cubing/alg";
const antiSune = new Alg("[[R: U], R U R2']");
const niklas = new Alg("[R, [U': L']] U'");

const jPerm = antiSune.concat(niklas);
jPerm.log();
jPerm.expand().log();
jPerm.expand().simplify().log(); 
```

Will result in the following:

```shell
 Alg {} "[[R: U], R U R2'] [R, [U': L']] U'" 
 Alg {} "R U R' R U R2' R U' R' R2 U' R' R U' L' U R' U' L U U'" 
 Alg {} "R U2 R' U' R U2' L' U R' U' L" 
```

.expand() and .simplify() can also take options:

```javascript
import { Alg } from "cubing/alg";

const oll = new Alg("[F: [R, U]]]");
oll.expand({depth: 1}).log();
```

Will result in the following:

```shell
Alg {} "F [R, U] F'"
```

#### String Conversion

Parse an alg by passing it to the Alg constructor. You can call .toString() to get back a string representation.

```javascript
import { Alg } from "cubing/alg"

const alg = new Alg("R U R' U R U2' R'");
console.log(alg);
console.log(alg.toString());
```

Will result in the following:

```shell
 Alg {} 
 "R U R' U R U2' R'" 
```

As a convenience, you can use .log() to view an alg in a JavaScript console (e.g. node or DevTools). We'll use that for all the examples from now on:

```javascript
import { Alg } from "cubing/alg"

new Alg("R U R' U R U2' R'").log();
```

Will result in the following:

```shell
Alg {} "R U R' U R U2' R'"
```

Note that this will result in a canonical string for the alg with whitespace collapsed.

```javascript
import { Alg } from "cubing/alg"

const alg = new Alg(" R   U R'   U R U2'   R'");
alg.log();
```

Will result in the following:

```shell
Alg {} "R U R' U R U2' R'"
```


#### General Usage Example

```javascript
import { Alg } from "cubing/alg";

const sune = new Alg("[R U R2', [R: U]]");
const antiSune = sune.invert();

antiSune.log();
antiSune.expand().log();
antiSune.expand().simplify().log();
```

Will result in the following:

```shell
Alg{} "[[R: U], R U R2']" 
Alg{} "R U R' R U R2' R U' R' R2 U' R'" 
Alg{} "R U2 R' U' R U' R'" 
```

### `Move` Overview

A Move is a `QuantumMove` (like `R` or `UL`) with an amount (any integer).

#### `Move` Class

```javascript
class Move {
  // Constructors
  constructor(s: string);
  constructor(quantumMove: string, amount: number);
  constructor(quantumMove: QuantumMove, amount?: number);

  // String conversion
  static fromString(s: string): Move;
  toString(): string;

  // Comparison
  isIdentical(other: Comparable): boolean;
  invert(): Move;

  // Operations
  modified(modifications: {
    outerLayer?: number;
    innerLayer?: number;
    family?: string;
    amount?: number;
  }): Move;

  // Contents
  get quantum(): QuantumMove;
  get amount(): number;
  log(message?: string): Alg;
}
```

#### `QuantumMove` Class

```javascript
class QuantumMove {
  // Constructors
  constructor(family: string, innerLayer?: number | null, outerLayer?: number | null);

  // String conversion
  static fromString(s: string): QuantumMove;
  toString(): string;

  // Comparison
  isIdentical(other: QuantumMove): boolean;

  // Operations
  modified(modifications: {
    outerLayer?: number;
    innerLayer?: number;
    family?: string;
  }): QuantumMove;

  // Contents
  get family(): string;
  get outerLayer(): number | null;
  get innerLayer(): number | null;
}
```





## `cubing/twisty`

The most important class in `cubing/twisty` is `TwistyPlayer`.

### `Twisty` Overview

#### Class Definition 

```javascript
class TwistyPlayer {
  // Constructor
  constructor(initialConfig?: {
    // Note that any of the config options can be accessed
    // or updated as properties on a TwistyPlayer instance directly.

    alg?: Alg | string;
    experimentalSetupAlg?: Alg | string;
    experimentalSetupAnchor?: "start" | "end";

    puzzle?: PuzzleID;
    visualization?: "3D" | "2D" | "experimental-2D-LL" | "PG3D";
    hintFacelets?: "floating" | "none";
    experimentalStickering?: ExperimentalStickering;

    background?: BackgroundTheme;
    controlPanel?: "bottom-row" | "none";

    backView?: BackViewLayout;
    experimentalCameraLatitude?: Vector3;
    experimentalCameraLongitude?: Vector3;
    experimentalCameraLatitudeLimits?: "auto" | "none";

    viewerLink?: "twizzle" | "none";
  })

  // Structure
  timeline: Timeline;
  cursor: AlgCursor | null;
  viewerElems: TwistyViewerElement[];
  controlElems: TwistyControlElement[];
  fullscreen(): void;

  // Twizzle
  twizzleLink(): string;
  visitTwizzleLink(): void;

  // 3D code
  scene: Twisty3DScene | null;
  twisty3D: Twisty3DPuzzle | null;

  // Experimental methods
  experimentalSetStartStateOverride(state: Transformation | null): void;
  experimentalSetCursorIndexer(cursorName: "simple" | "tree" | "simultaneous"): void;
  experimentalAddMove(move: Move, coalesce?: boolean, coalesceDelayed?: boolean): void;
} 
```
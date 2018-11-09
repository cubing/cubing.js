# `cubing.js`

A bundle that makes it easy to use multiple
[js.cubing.net](https://js.cubing.net) libraries.

| Library | Purpose |
|--------|--------|
| [`alg`](https://github.com/cubing/alg.js) | Parse and transform twisty puzzle algorithms ("algs"). |
| [`kpuzzle`](https://github.com/cubing/kpuzzle.js) | Represent and transform twisty puzzles. |
| [`twisty`](https://github.com/cubing/twisty.js) | Animate and interact with twisty puzzles. |
| [`cuble`](https://github.com/cubing/cuble.js) | Connect to bluetooth twisty puzzles. |
| [`puzzle-geometry`](https://github.com/cubing/puzzle-geometry.js) | Generate new twisty puzzle geometries. |


## Usage

There are a few ways to use `cubing.js`. Here is the same example, used in a few
different ways:

### Browser

Download the latest `cubing.js` browser dev build for easy experimentation:
https://github.com/cubing/cubing.js/releases/

    <script src="cubing.js"></script>
    <script>
      const {parse, invert, algToString} = alg;
      const {KPuzzle, Puzzles} = kpuzzle;

      console.log(algToString(invert(parse("R U R' U R U2 R'"))));

      const puzzle = new KPuzzle(Puzzles["333"]);
      puzzle.applyMove("R");
      console.log(puzzle.state);
    </script>

### Node

After `npm install cubing`:

    const {parse, invert, algToString} = require("cubing/alg");
    const {KPuzzle, Puzzles} = require("cubing/kpuzzle");
    // ...

Try it [at `runkit.com`](https://runkit.com/embed/jj71d1c08sta).

### ES6 / TypeScript

    import {parse, invert, algToString} from "cubing/alg"
    import {KPuzzle, Puzzles} from "cubing/kpuzzle"
    // ...

All packages bundled by `cubing.js` have associated TypeScript declarations.

## Bundle Size

The browser dev build is partially minified, but contains all original variable
names in full.

If you use `node.js` and import individual sub-package with a slash (e.g.
`cubing/alg`), then `node.js` will only import the code once for each of those
sub-packages. Combined with your favorite minifier/tree shaker/gzip, this should
be fairly lightweight.

In addition, `cubing.js` shares its source with the individual packages it bundles:

    > require("cubing/alg") == require("alg")
    true

Therefore, if a project depends on both `cubing.js` and some of its individual
sub-packages, `node.js` will not load any redundant code.

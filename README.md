# `cubing.js`

A meta-library that makes it easy to use multiple
[js.cubing.net](https://js.cubing.net) libraries.

## Usage

### Browser

    <script src="cubing.js"></script>
    <script>
      const sune = alg.parse("R U R' U R U2 R'");
      const antiSune = alg.invert(sune);
      console.log(alg.algToString(antiSune));

      const {KPuzzle, Puzzles} = kpuzzle;

      const puzzle = new KPuzzle(Puzzles["333"]);
      puzzle.applyMove("R");
      console.log(puzzle.state);
    </script>

### Node / TypeScript

    import {parse, invert, algToString} from "cubing/alg"
    import {KPuzzle, Puzzles} from "cubing/kpuzzle"

    const sune = parse("R U R' U R U2 R'");
    const antiSune = invert(sune);
    console.log(algToString(antiSune));

    const puzzle = new KPuzzle(Puzzles["333"]);
    puzzle.applyMove("R");
    console.log(puzzle.state);

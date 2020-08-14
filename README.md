<img src="cubing.js.jpg" width="100%">

# `cubing.js`

![make test](https://github.com/cubing/cubing.js/workflows/make%20test/badge.svg)  
![make build](https://github.com/cubing/cubing.js/workflows/make%20build/badge.svg)

`cubing.js` is a collection of Javascript libraries, still under development.

| Library                  | Purpose                                                |
| ------------------------ | ------------------------------------------------------ |
| `cubing/alg`             | Parse and transform twisty puzzle algorithms ("algs"). |
| `cubing/bluetooth`       | Connect to bluetooth twisty puzzles.                   |
| `cubing/kpuzzle`         | Represent and transform twisty puzzles.                |
| `cubing/twisty`          | Animate and interact with twisty puzzles.              |
| `cubing/puzzle-geometry` | Generate new twisty puzzle geometries.                 |

## Development

    git clone https://github.com/cubing/cubing.js && cd cubing.js
    npm install
    make dev

This should open http://localhost:1234/ automatically.

## License

This project is licensed under the GPL license (version 3 or later). This means that this library is **free to use**, although you **must publish any code that uses it** (e.g. also put it on GitHub). See [the full license](./LICENSE.md) for exact details.

We've selected this license in order to encourage the cubing community to work on software in a way so that everyone can contribute and extend each other's work.

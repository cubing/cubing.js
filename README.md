<img src="cubing.js.jpg" width="480">

# `cubing.js`

![make test](https://github.com/cubing/cubing.js/workflows/make%20test/badge.svg)  
![make build](https://github.com/cubing/cubing.js/workflows/make%20build/badge.svg)

`cubing.js` is a collection of Javascript libraries, still under development.

## Twizzle

<a href="https://alpha.twizzle.net/"><img src="./src/sites/alpha.twizzle.net/twizzle-social-media-image.png" width="256">

Twizzle</a> is based on `cubing.js`, and is currently being developed at [`src/sites/alpha.twizzle.net`](./src/sites/alpha.twizzle.net/).

## Documentation

If you want to display algs or solves, the following code is a good way to get started:

```html
<script
  src="https://cdn.cubing.net/esm/cubing/twisty"
  type="module"
  defer
></script>
<twisty-player alg="R U R' U R U2' R'"></twisty-player>
```

You can find more documentation at [`js.cubing.net/cubing/`](https://js.cubing.net/cubing).  
The source for the documentation site is currently inside the [`docs`](./docs/) folder of this repository.

## Development

Development relies on [`node`](https://nodejs.org/en/) and [`npm`](https://docs.npmjs.com/getting-started). Once you have installed those, you can run:

```shell
git clone https://github.com/cubing/cubing.js && cd cubing.js
make dev
```

This should run `npm install` and start the server, after which you can open <http://localhost:3333/>. We don't yet have a development guide, so you'll have to search the code to find where features are implemented.

The core library code for `cubing.js` is in [`src/cubing`](./src/cubing/) To test changes, use:

```shell
make test
```

## License

This project is licensed under the GPL license (version 3 or later). This means that this library is **free to use**, although you **must publish any code that uses it** (e.g. also put it on GitHub). See [the full license](./LICENSE.md) for exact details.

We've selected this license in order to encourage the cubing community to work on software in a way so that everyone can contribute and extend each other's work.

<img src="cubing.js.jpg" width="480">

# `cubing.js`

![make test](https://github.com/cubing/cubing.js/workflows/make%20test/badge.svg)  
![make build](https://github.com/cubing/cubing.js/workflows/make%20build/badge.svg)

`cubing.js` is a collection of JavaScript libraries, still under development.

## Twizzle

<a href="https://alpha.twizzle.net/"><img src="./src/sites/alpha.twizzle.net/twizzle-social-media-image.png" width="256">

Twizzle</a> is the spiritual successor to [alg.cubing.net](https://alg.cubing.net/), based on `cubing.js`. It is currently being developed at [src/sites/alpha.twizzle.net](./src/sites/alpha.twizzle.net/). See the [Twizzle Diaries](https://www.youtube.com/watch?v=9_kqXn0Mq-o&list=PLFh3NgpDbzN4VkcfjEZSQ_TYQv_OEjbjF) video series for more information on Twizzle's vision and use cases.

## Getting started

If you're just getting started, the easiest way to use `cubing.js` is throught `cdn.cubing.net`:

```html
<script src="https://cdn.cubing.net/js/cubing/twisty" type="module"></script>
<twisty-player alg="R U R' U R U2' R'"></twisty-player>
```

You can find more documentation at [js.cubing.net/cubing/](https://js.cubing.net/cubing).

## Using with `node` and `npm`

If you would like to use cubing.js as a library in your package-based projects, make sure you have [node](https://nodejs.org/en/) and [npm](https://docs.npmjs.com/getting-started) installed (installing `node` will install `npm` as well). Once you have installed those, you can run:

```shell
npm install cubing
```

Then you can use modules like this:

```js
import { Alg } from "cubing/alg";
import { TwistyPlayer } from "cubing/twisty";
```

## Contributing

If you would like to contribute to the development of `cubing.js`, please refer to our [contribution guidelines](./CONTRIBUTING.md).

## Developing `cubing.js` itself

If you have `git`, `node`, and `npm` installed, you can run the `cubing.js` source like this (see the [contribution guidelines](./CONTRIBUTING.md) for more details):

```shell
git clone https://github.com/cubing/cubing.js && cd cubing.js
make dev
# Now visit http://localhost:3333
```

## Acknowledgments

As of this time, `cubing.js` primarily contains code by [Lucas Garron (@lgarron)](https://github.com/lgarron) and [Tom Rokicki (@rokicki)](https://github.com/rokicki). Significant parts of the cubing code also are from:

- [Chen Shuang (@cs0x7f)](https://github.com/cs0x7f): Scramblers for 3x3x3, 4x4x4, and Square-1
- [`xyxxy` (@torchlight)](https://github.com/torchlight): Scramblers for unofficial events

It also uses the [`three.js`](https://github.com/mrdoob/three.js), [`comlink`](https://github.com/GoogleChromeLabs/comlink), and [`p-lazy`](https://github.com/sindresorhus/p-lazy) libraries. Twizzle also uses the [Ubuntu font](https://design.ubuntu.com/font/).

## License

This project is licensed under the GPL license (version 3 or later). This means that this library is **free to use**, although you **must publish any code that uses it** (e.g. also put it on GitHub). See [the full license](./LICENSE.md) for exact details.

We've selected this license in order to encourage the cubing community to work on software in a way so that everyone can contribute and extend each other's work.

<img src="cubing.js.png" alt="cubing.js" width="512">

`cubing.js` is a collection of JavaScript libraries, still under development.

## Twizzle

<a href="https://alpha.twizzle.net/"><img src="./src/sites/alpha.twizzle.net/twizzle-social-media-image.png" width="256">

Twizzle</a> is the spiritual successor to [alg.cubing.net](https://alg.cubing.net/), based on `cubing.js`. It is currently being developed at [src/sites/alpha.twizzle.net](./src/sites/alpha.twizzle.net/). See the [Twizzle Diaries](https://www.youtube.com/watch?v=9_kqXn0Mq-o&list=PLFh3NgpDbzN4VkcfjEZSQ_TYQv_OEjbjF) video series for more information on Twizzle's vision and use cases.

## Getting started

If you're just getting started, the easiest way to use `cubing.js` is through `cdn.cubing.net`:

```html
<script src="https://cdn.cubing.net/v0/js/cubing/twisty" type="module"></script>
<twisty-player alg="R U R' U R U2' R'"></twisty-player>
```

You can find more documentation at [js.cubing.net/cubing/](https://js.cubing.net/cubing).

## Using with `node` and `npm`

If you would like to use `cubing.js` as a library in your package-based projects, make sure you have [node](https://nodejs.org/en/) and [npm](https://docs.npmjs.com/getting-started) installed (installing `node` will install `npm` as well). Once you have installed those, you can run:

```shell
npm install cubing
```

Then you can use modules like this:

```js
import { Alg } from "cubing/alg";
import { TwistyPlayer } from "cubing/twisty";
```

Please note that `cubing.js` requires ES2022 module compatibility. See [here](https://js.cubing.net/cubing/#javascript).

## Contributing

If you would like to contribute to the development of `cubing.js`, please refer to our [contribution guidelines](./CONTRIBUTING.md).

## Developing `cubing.js` itself

Working on `cubing.js` requires the following tools:

- [`GNU make`](https://www.gnu.org/software/make/) (probably included with your OS)
- [`git`](https://git-scm.com/) (possibly included with your OS)
- [`git-lfs`](https://git-lfs.com/)
- [`bun`](https://bun.sh/)
- [`node` and `npm`](https://nodejs.org/en/download)

On macOS, you can install these using [Homebrew](https://brew.sh/):

```shell
brew install git git-lfs node oven-sh/bun/bun
```

(On other platforms, you'll have to follow individual installation instructions. We recommend using [WSL](https://learn.microsoft.com/en-us/windows/wsl/install) on Windows.)

Once you have these dependencies, you can run the `cubing.js` source like this (see the [contribution guidelines](./CONTRIBUTING.md) for more details):

```shell
git clone https://github.com/cubing/cubing.js && cd cubing.js
make dev
# Now visit http://cubing.localhost:3333
```

To quickly check any changes for issues, try `make test-fast`. Run `make test` for more thorough testing options.

### Developing on Windows

We recommend using Microsoft's [Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/en-us/windows/wsl/about) to develop `cubing.js` on Windows.

## Release notes

For release versions and release notes, view the release history on GitHub: <https://github.com/cubing/cubing.js/releases>

## License

This project is licensed under the Mozilla Public License. This means that `cubing.js` is **free to use** in any public or private project. We've selected this license so that `cubing.js` can be used in a large variety of use cases.

However, if you modify the source code of `cubing.js` to fit your needs then you **must publish your modifications to the `cubing.js` source code** (e.g. publish a fork put it on GitHub). See [the full license](./LICENSE-MPL.md) for exact details.

Although you are no longer required to publish code that uses `cubing.js`, we encourage you to develop your projects as open-source. This way, others can learn from your work and build on it far into the future. It also allows us to tell how features are being used by projects in the community, and what new features are needed.

### Fine Print

All original code in this project is dual-licensed as both [GPL](./LICENSE-GPL.md) and [MPL](./LICENSE-MPL.md), but the codebase contains additional vendored code under the [Apache](./src/cubing/vendor/apache/), [MIT](./src/cubing/vendor/mit/), and [Ubuntu Font](./src/sites/experiments.cubing.net/cubing.js/vendor/fonts/ubuntu/) licenses. This may affect you if you are forking the source code, as certain parts are not MPL-licensed on their own. But if you are just using `cubing.js` as a library, you can effectively treat all of `cubing.js` as if it was MPL-licensed.

## Acknowledgments

As of this time, `cubing.js` primarily contains code by [Lucas Garron (@lgarron)](https://github.com/lgarron) and [Tom Rokicki (@rokicki)](https://github.com/rokicki). Significant parts of the cubing code also are from:

- [Chen Shuang (@cs0x7f)](https://github.com/cs0x7f): Scramblers for 3x3x3, 4x4x4, and Square-1
- [`xyxxy` (@torchlight)](https://github.com/torchlight): Scramblers for unofficial events

It also uses the [`three.js`](https://github.com/mrdoob/three.js), [`comlink`](https://github.com/GoogleChromeLabs/comlink), and [`p-lazy`](https://github.com/sindresorhus/p-lazy) libraries. Twizzle also uses the [Ubuntu font](https://design.ubuntu.com/font/).

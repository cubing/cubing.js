# Contributing

Pull requests are welcome for any part of this project. Please feel free to send PRs directly for typos, bug fixes, and any [open issues](https://github.com/cubing/cubing.js/issues).

If you have any thoughts about bigger contributions, please consider [filing an issue](https://github.com/cubing/cubing.js/issues/new) to discuss it before sending a pull request. (Since we're still [below version 1.0](https://semver.org/#spec-item-4), some relevant design choices are still not settled or written down yet.)

## First-Time Contributors

If this is your first time contributing to a project on GitHub, here are steps to contribute code:

1. Create a fork of `cubing.js`.
2. Install [Git](https://git-scm.com/downloads).
3. Clone your forked version of `cubing.js` to your computer.
4. Create a new branch in your cloned project, and make the changes you would like to make.
5. Push your changes to your forked `cubing.js` repo.
6. Create a pull request in `cubing.js`, with your new branch from your forked repo as the source.

YouTube has many guides about Git and GitHub if you would like more information. If you want a thorough overview, consider [Git and GitHub for Beginners - Crash Course](https://www.youtube.com/watch?v=RGOj5yH7evk).

## Development

Please see the [development instruction in `README.md`](./README.md#development) for how to work on `cubing.js`.

## Code of Conduct

Please see [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

## Working on `cubing.js`

To work on the `cubing.js` source code, you'll need to install [`node`](https://nodejs.org/en/) and [npm](https://docs.npmjs.com/getting-started) (installing `node` will install `npm` as well). Once you have installed those, you can run:

```shell
git clone https://github.com/cubing/cubing.js && cd cubing.js
make dev
```

This should install a few dependencies and start the server, after which you can open <http://cubing.localhost:3333/>. Some tips:

The core library code for `cubing.js` is in [`src/cubing`](./src/cubing/). To test changes, use:

```shell
make test
```

- See [`src/README.md`](./src/README.md) for the source code structure.
  - The core library code for `cubing.js` is in [`src/cubing`](./src/cubing/).
  - The code for Twizzle and dev experiments is in [`src/sites`](./src/sites/).

## Goals and Principles

The goal of `cubing.js` to make it easier to write _any_ cubing application. `cubing.js` should make it easy to do the right thing, and it should be reasonably compatible with any use case out of the box.

This means the library and the UI must be:

- Easy: It has to be as easy as possible to use, even for people who have done almost no programming. This also means it should be hard to "hold it wrong" and write unsafe/super slow apps by accident.
- Fast: It has to compute and draw puzzle states efficiently on low-power devices, slow internet, and/or large screens.
- Compatible: It has to work for browsers, commandline scripts, servers.

Some examples of what this means:

- `cubing.js` must work out of the box with minimal dependencies. We need to maintain a common API that works with `node`, directly in browsers, and with bundlers. (Easy & Compatible).
- We need good documentation before we do a "full" release.
- We make `cubing.js` [available under `cdn.cubing.net`](https://github.com/cubing/cdn.cubing.net) so that people can use the most efficient version of the code on their websites even if they don't know how to use bundlers, but we also provide builds that make it possible to host the code directly.
- We should use native APIs where possible, e.g. web components.
- If one of the goals requires a choice between doing work ourselves, or making a developer do it, we prefer doing the work so the developer doesn't have to. As an important example, `cubing/search` and `cubing/scramble` automatically use web workers so that it's easy and fast to generate scrambles without slowing down an app.
- The library should load as little code as possible. In order to support lots of puzzles and environments, the "full" library will probably be fairly large. But we can split up the build (using dynamic imports) so that an app will not ["pay for" code it does not need](https://www.stroustrup.com/masterminds_chapter_1.pdf). For example:
  - `<twisty-player>` should draw a player on the screen as fast as possible, so the user can tell that it's loading (and not just broken/missing).
  - If you're only drawing 2D puzzles, you shouldn't have to load the (fairly sizable) 3D code.
  - If you just need to draw freeze frames (like VisualCube), you should be able to use `<twisty-player>` without worrying about the "extra work" it does to prepare for animation.
- For speed or simplicity, it is often valuable to require features that are only available in modern browsers/environments. In general, we are willing to require the most recent version of a modern browser, as long as the relevant feature is available across Chromium-based browsers (including Edge), Firefox, and Safari. We don't support Internet Explorer or Edge Spartan.
- Development of `cubing.js` should be simple and fast. The entire codebase is plain TypeScript. `make dev` takes a fraction of a section to start, as do full production builds and linting/formatting. We still have to use some slow tools, but we prefer to avoid them unless there are no reasonable good, fast alternatives. This is important because it can narrow the gap of what you can test in development, vs. what we test in full CI. The more that can be tested quickly (locally), the fewer surprises there will be when contributing code.

In addition, it's valuable to apply some of these principles to the codebase itself. For example, we try to make it as easy as possible to get started, and generally use more verbose names when a shorter name could be ambiguous.

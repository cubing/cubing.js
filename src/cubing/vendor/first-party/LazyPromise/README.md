# `LazyPromise`

A simple, modern implementation of a lazy `Promise`.

This implementation is used mainly in `cubing/twisty`, but placing it in the source code there (along with a `cubing-private` export) breaks the `esbuild` heuristics that we rely on to avoid pulling in heavy code.

A `util` folder is an anti-pattern, so we do not have one in the repo. It can live here for now, until perhaps we turn it into an `npm` package.

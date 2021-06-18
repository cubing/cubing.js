#!/usr/bin/env bash

npx esbuild --watch --target=es2015 --bundle --format=cjs src/cubing/twisty/worker/inside/src/worker-inside.ts --outfile=src/cubing/twisty/worker/inside/generated/worker-inside.js
npx snowpack dev

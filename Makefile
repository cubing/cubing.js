BUN=bun
BUN_DX=${BUN} x -- bun-dx
BUN_RUN=${BUN} run --
BIOME=${BUN_DX} --package @biomejs/biome biome --
NODE=node --
NPM=npm
WEB_TEST_RUNNER=${BUN_DX} --package @web/test-runner web-test-runner -- # TODO(https://github.com/oven-sh/bun/issues/9178): restore this to @web/test-runner

.PHONY: default
default:
	@echo "To work on the project, run:"
	@echo ""
	@echo "    make dev"
	@echo ""
	@echo "To build the project, run:"
	@echo ""
	@echo "    make setup"
	@echo "    make build"
	@echo ""
	@echo "To see available tests, run:"
	@echo ""
	@echo "    make setup"
	@echo "    make test-info"
	@echo ""

.PHONY: check
check: lint test-all build check-package.json

# By convention, we'd normally place `build-bin` first, but `build-lib` is the main target and
# it can be less confusing to build first (especially if the build aborts with
# an error).

.PHONY: build
build: build-lib build-bin build-sites

.PHONY: build-lib
build-lib: build-lib-js build-lib-types

.PHONY: build-lib-js
build-lib-js: update-dependencies
	${BUN_RUN} ./script/build/lib/build-lib-js.ts

.PHONY: build-lib-types
build-lib-types: update-dependencies
	${BUN_RUN} ./script/build/lib/build-lib-types.ts

.PHONY: build-bin
build-bin: build-lib-js
	${BUN_RUN} ./script/build/bin/build-bin.ts

.PHONY: build-sites
build-sites: build-site-twizzle build-site-experiments

.PHONY: build-site-twizzle
build-site-twizzle: update-dependencies
	${BUN_RUN} ./script/build/sites/build-site-twizzle.ts

.PHONY: build-site-experiments
build-site-experiments: update-dependencies
	${BUN_RUN} ./script/build/sites/build-site-experiments.ts

.PHONY: build-site-docs
build-site-docs: update-dependencies
	rm -rf ./dist/sites/js.cubing.net/
	${BUN_DX} --package typedoc typedoc -- src/cubing/*/index.ts
	cp -R ./src/docs/js.cubing.net/* ./dist/sites/js.cubing.net/
	@echo "\n\nNote: The js.cubing.net docs are deployed to GitHub Pages using GitHub Actions when a commit is pushed to the \`main\` branch:\nhttps://github.com/cubing/cubing.js/actions/workflows/pages.yml"

.PHONY: dev
dev: update-dependencies
	${BUN_RUN} ./script/build/sites/dev.ts

.PHONY: link
link: build
	${BUN} link

.PHONY: clean
clean:
	${BUN_RUN} ./script/cleanup/clean.ts

.PHONY: reset
reset: clean
	${BUN_RUN} ./script/cleanup/reset.ts
	@echo ""
	@echo "To reinstall dependencies, run:"
	@echo ""
	@echo "    make setup"
	@echo ""

.PHONY: test
test: test-info

.PHONY: test-info
test-info:
	@echo "Run one of the following."
	@echo "(Time estimates are based on a fast computer.)"
	@echo ""
	@echo "    make test-src   (≈3s)"
	@echo "    make test-build (≈14s)"
	@echo "    make test-dist  (≈10s)"
	@echo ""
	@echo "    make test-all (≈27s, includes all of the above)"
	@echo ""
	@echo "Also, if you want to run all possible checks in the project, run:"
	@echo ""
	@echo "    make check (≈46s, includes all of the above)"
	@echo ""
	@echo "If you want the best \"bang for your buck\" without running everything, run:"
	@echo ""
	@echo "    make check-fast (≈2.5s, includes a subset of the above)"
	@echo ""
	@echo "Press enter to exit this message."
	@read

# The following deps are in a custom order so that the more "useful" tests are first.
# In case of failure, this is likely to be more helpful.
.PHONY: check-fast
check-fast: update-dependencies \
	build-lib-js test-ts-bun-fast build-bin build-sites \
	lint-biome \
	lint-import-restrictions \
	test-dist-lib-node-import \
	test-dist-lib-plain-esbuild-compat \
	test-dist-bin-shebang

.PHONY: test-all
test-all: test-src test-build test-dist

.PHONY: test-src
test-src: test-ts

.PHONY: test-ts
test-ts: test-ts-bun test-ts-dom

.PHONY: test-ts-bun
test-ts-bun: update-dependencies
	${BUN} test

.PHONY: test-ts-bun-fast
test-ts-bun-fast: update-dependencies
	env CUBING_JS_SKIP_SLOW_TESTS=true ${BUN} test

.PHONY: test-ts-bun-with-coverage
test-ts-bun-with-coverage: update-dependencies install-playwright
	${BUN} test

.PHONY: test-ts-dom
test-ts-dom: update-dependencies install-playwright
	${WEB_TEST_RUNNER}

.PHONY: install-playwright
install-playwright: update-dependencies
	${BUN_DX} --package playwright playwright -- install

.PHONY: test-ts-dom-with-coverage
test-ts-dom-with-coverage: update-dependencies install-playwright
	${WEB_TEST_RUNNER} --coverage

.PHONY: test-build
test-build: \
	build-lib-js \
	build-bin \
	build-lib-types \
	build-sites \
	build-site-docs # keep CI.yml in sync with this

.PHONY: test-dist
test-dist: test-dist-lib test-dist-bin

.PHONY: test-dist-lib
test-dist-lib: \
	test-dist-lib-node-import \
	test-dist-lib-node-scramble \
	test-dist-lib-bun-scramble-all-events \
	test-dist-lib-perf \
	test-dist-lib-plain-esbuild-compat \
	test-dist-lib-build-size \
	test-dist-sites-twizzle # keep CI.yml in sync with this

.PHONY: test-dist-lib-node-import
test-dist-lib-node-import: build-lib-js
	${NODE} script/test/dist/lib/cubing/node/import/main.js

.PHONY: test-dist-lib-node-scramble
test-dist-lib-node-scramble: build-lib-js
	${NODE} script/test/dist/lib/cubing/node/scramble/main.js

.PHONY: test-dist-lib-bun-scramble-all-events
test-dist-lib-bun-scramble-all-events: build-lib-js
	${BUN} script/test/dist/lib/cubing/node/scramble-all-events/main.js

.PHONY: test-dist-lib-perf
test-dist-lib-perf: build-lib-js
	${BUN} script/test/dist/lib/cubing/perf/*.js

.PHONY: test-dist-lib-plain-esbuild-compat
test-dist-lib-plain-esbuild-compat: build-lib-js
	${BUN_RUN} script/test/dist/lib/cubing/plain-esbuild-compat/main.ts

.PHONY: test-dist-lib-build-size
test-dist-lib-build-size: build-lib-js
	${BUN_RUN} ./script/test/dist/lib/cubing/build-size/main.ts

.PHONY: test-dist-sites-twizzle
test-dist-sites-twizzle: install-playwright build-sites
	${BUN_RUN} ./script/test/dist/sites/alpha.twizzle.net/main.ts

.PHONY: test-dist-bin
test-dist-bin: test-dist-bin-shebang test-dist-bin-npm-exec

.PHONY: test-dist-bin-shebang
test-dist-bin-shebang: build-bin
	# Note: we're not testing the output, just that these don't exit with an error.
	time dist/bin/order.js 3x3x3 "R U R'"
	time dist/bin/puzzle-geometry-bin.js --svg 2x2x2
	time dist/bin/scramble.js 222

.PHONY: test-dist-bin-npm-exec
test-dist-bin-npm-exec: build-bin
	time ${NPM} exec scramble -- 222

.PHONY: format
format: update-dependencies
	${BIOME} check --write

.PHONY: setup
setup: setup-without-playwright install-playwright

.PHONY: setup-without-playwright
setup-without-playwright: bun-required update-dependencies check-engines

.PHONY: bun-required
bun-required:
	@command -v ${BUN} > /dev/null || { echo "\nPlease install \`bun\` to work on this project:\n\n    # from npm\n    npm install --global bun\n\n    # macOS (Homebrew)\n    brew install oven-sh/bun/bun\n\n    # For other options, see: https://bun.sh/\n" && exit 1 ; }

.PHONY: update-dependencies
update-dependencies:
	${BUN} install --frozen-lockfile

.PHONY: check-engines
check-engines: update-dependencies
	@${BUN_RUN} "./script/check-engine-versions.ts"

.PHONY: lint
lint: lint-biome lint-import-restrictions lint-tsc check-schemas check-for-duplicate-dependencies

.PHONY: lint-biome
lint-biome: update-dependencies
	${BIOME} check

.PHONY: lint-ci
lint-ci: update-dependencies
	${BIOME} ci

.PHONY: lint-import-restrictions
lint-import-restrictions: update-dependencies
	${BUN_RUN} ./script/lint/import-restrictions/main.ts

.PHONY: lint-tsc
lint-tsc: lint-tsc-main lint-tsc-lib lint-tsc-lib-no-dom lint-tsc-bin

.PHONY: lint-tsc-main
lint-tsc-main: update-dependencies
	${BUN_DX} --package typescript tsc -- --project ./tsconfig.json

.PHONY: lint-tsc-lib
lint-tsc-lib: update-dependencies
	${BUN_DX} --package typescript tsc -- --project ./tsconfig.lib.jsonc

.PHONY: lint-tsc-lib-no-dom
lint-tsc-lib-no-dom: update-dependencies
	${BUN_DX} --package typescript tsc -- --project ./tsconfig.lib.no-dom.jsonc

.PHONY: lint-tsc-bin
lint-tsc-bin: update-dependencies
	${BUN_DX} --package typescript tsc -- --project ./src/bin/tsconfig.json

.PHONY: check-schemas
check-schemas: update-dependencies
	${BUN_RUN} "./script/schema/check.ts"

.PHONY: update-schemas
update-schemas: update-dependencies
	${BUN_RUN} "./script/schema/update.ts"

.PHONY: check-package.json
check-package.json: build-lib-js build-lib-types build-bin
	${BUN_DX} --package @cubing/dev-config package.json -- check

.PHONY: prepack
prepack: clean build test-dist-lib-node-import test-dist-lib-node-scramble test-dist-lib-plain-esbuild-compat

.PHONY: prepublishOnly
prepublishOnly: update-dependencies
	# Lucas is usually the one publishing, and `mak` is over twice as fast. So we use it when available.
	# https://github.com/lgarron/mak
	mak clean check build || make clean check build

.PHONY: postpublish
postpublish: update-cdn update-create-cubing-app deploy

.PHONY: postpublish-clear-bun-cache
postpublish-clear-bun-cache:
	# Ensure that we get the newly published `cubing` version in other `postpublish` steps.
	bun pm cache rm

.PHONY: check-for-duplicate-dependencies
check-for-duplicate-dependencies: update-dependencies
	${BUN_DX} --package bun-dedupe dedupe -- --check

.PHONY: deploy
deploy: deploy-twizzle deploy-experiments

.PHONY: deploy-twizzle
deploy-twizzle: build-site-twizzle
	${BUN_RUN} script/deploy/twizzle.ts

.PHONY: deploy-experiments
deploy-experiments: build-site-experiments
	${BUN_DX} --package @cubing/deploy deploy --

.PHONY: roll-vendored-twips
roll-vendored-twips:
	test -d ../twips/ || exit
	rm -rf ../twips/dist/wasm/
	cd ../twips/ && make build-rust-wasm
	mkdir -p ./src/cubing/vendor/mpl/twips
	rm -rf ./src/cubing/vendor/mpl/twips/*
	cp -R ../twips/dist/wasm/* ./src/cubing/vendor/mpl/twips/
	# TODO: why does using normal `echo -n` ignore the `-n` here?
	printf "https://github.com/cubing/twips/tree/" > ./src/cubing/vendor/mpl/twips/vendored-twips-git-version.txt
	cd ../twips/ && ${BUN_DX} --package @lgarron-bin/repo repo -- version describe >> ../cubing.js/src/cubing/vendor/mpl/twips/vendored-twips-git-version.txt
	${BUN_RUN} script/fix-vendored-twips.ts

.PHONY: update-cdn
update-cdn: postpublish-clear-bun-cache
	@echo "--------------------------------"
	@echo "Updating CDN to the latest \`cubing.js\` release, per:"
	@echo "https://github.com/cubing/cdn.cubing.net/blob/main/docs/maintenance.md#updating-cdncubingnet-to-a-new-cubing-version"
	@echo ""
	test -d ../cdn.cubing.net/ || exit
	cd ../cdn.cubing.net/ && make roll-cubing

.PHONY: update-create-cubing-app
update-create-cubing-app: postpublish-clear-bun-cache
	cd ../create-cubing-app && make auto-publish

.PHONY: publish

.PHONY: publish
publish:
	${NPM} publish --globalconfig=$HOME/.config/npm/cubing-publish.npmrc

.PHONY: pack

.PHONY: pack
pack:
	# Note that we need to use `./dist/` rather than `./dist/pack/`, because `make
	# prepack` removes the entire `./dist/` folder (but creates a new `./dist/`
	# folder). This prevents us from creating a `./dist/pack/` folder (or
	# similarly, `./.temp/pack/` folder) that will stick around long enough for
	# `npm pack` to use. The simplest is just to place the result directly in
	# `./dist/`.
	${NPM} pack --pack-destination ./dist/

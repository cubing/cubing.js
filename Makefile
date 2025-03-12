BUN=bun
BUNX=${BUN} x
BUN_RUN=${BUN} run
BIOME=${BUN} x @biomejs/biome
NODE=node
NPM=npm
WEB_TEST_RUNNER=${BUNX} web-test-runner # TODO(https://github.com/oven-sh/bun/issues/9178): restore this to @web/test-runner

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


######## Shared with `package.json` ########

# By convention, we'd normally place `build-bin` first, but `build-lib` is the main target and
# it can be less confusing to build first (especially if the build aborts with
# an error).

.PHONY: build
build: clean build-lib build-bin build-sites

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
	chmod +x ./dist/bin/*.js

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
	${BUNX} typedoc src/cubing/*/index.ts
	cp -R ./src/docs/js.cubing.net/* ./dist/sites/js.cubing.net/
	@echo "\n\nNote: The js.cubing.net docs are deployed to GitHub Pages using GitHub Actions when a commit is pushed to the \`main\` branch:\nhttps://github.com/cubing/cubing.js/actions/workflows/pages.yml"

.PHONY: dev
dev: update-dependencies
	${BUN_RUN} ./script/build/sites/dev.ts

.PHONY: link
link: build
	${BUN} link

.PHONY: clean
clean: clean-types
	rm -rf \
		dist .temp coverage ./package-lock.json \
		./alg ./bluetooth ./kpuzzle ./notation ./protocol ./puzzle-geometry ./puzzles ./scramble ./search ./stream ./twisty

.PHONY: clean-types
clean-types: setup
	${BUN_RUN} script/build/lib/clean-types.ts

.PHONY: reset
reset: clean
	rm -rf node_modules
	@echo ""
	@echo "To reinstall dependencies, run:"
	@echo ""
	@echo "    make setup"
	@echo ""

.PHONY: audit
audit:
	bun x bun-audit # We purposely don't include `bun-audit` and `yarn` in deps.

.PHONY: test
test: test-info

.PHONY: test-info
test-info:
	@echo "Run one of the following."
	@echo "(Time estimates are based on a fast computer.)"
	@echo ""
	@echo "    make test-spec (≈2s, unit tests only)"
	@echo ""
	@echo "    make test-src   (≈5s, includes \`make test-spec\`)"
	@echo "    make test-build (≈13s)"
	@echo "    make test-dist  (≈10s)"
	@echo ""
	@echo "    make test-all  (≈27s, runs all of the above)"
	@echo "    make test-fast (≈2s, runs a subset of the above)"
	@echo ""
# The following deps are in a custom order so that the more "useful" tests are first.
# In case of failure, this is likely to be more helpful.

.PHONY: test-fast
test-fast: update-dependencies \
	build-lib-js test-spec-bun-fast build-bin build-sites \
	lint \
	test-src-import-restrictions test-src-scripts-consistency \
	test-dist-lib-node-import \
	test-dist-lib-plain-esbuild-compat \
	test-dist-bin-shebang

.PHONY: test-all
test-all: test-src test-build test-dist

.PHONY: test-src
test-src: update-dependencies \
	test-spec \
	lint-ci \
	test-src-tsc \
	test-src-import-restrictions \
	test-src-scripts-consistency # keep CI.yml in sync with this

.PHONY: test-spec
test-spec: test-spec-bun test-spec-dom

.PHONY: test-spec-bun
test-spec-bun: update-dependencies
	${BUN} test

.PHONY: test-spec-bun-fast
test-spec-bun-fast: update-dependencies
	env CUBING_JS_SKIP_SLOW_TESTS=true ${BUN} test

.PHONY: test-spec-bun-with-coverage
test-spec-bun-with-coverage: update-dependencies
	${BUN} test

.PHONY: test-spec-dom
test-spec-dom: update-dependencies
	${WEB_TEST_RUNNER}

.PHONY: test-spec-dom-with-coverage
test-spec-dom-with-coverage: update-dependencies
	${WEB_TEST_RUNNER} --coverage

.PHONY: playwright-install
playwright-install:
	${BUNX} playwright install

.PHONY: test-src-import-restrictions
test-src-import-restrictions: update-dependencies
	${BUN_RUN} ./script/test/src/import-restrictions/main.ts

.PHONY: test-src-tsc
test-src-tsc: update-dependencies
	${BUNX} tsc --project ./tsconfig.json

.PHONY: test-src-scripts-consistency
test-src-scripts-consistency: update-dependencies
	${BUN_RUN} ./script/test/src/scripts-consistency/main.ts

.PHONY: fix-src-scripts-consistency
fix-src-scripts-consistency: update-dependencies
	${BUN_RUN} ./script/test/src/scripts-consistency/main.ts --fix

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
	test-dist-sites-experiments # keep CI.yml in sync with this

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

.PHONY: test-dist-sites-experiments
test-dist-sites-experiments: playwright-install build-sites
	${BUN} ./script/test/dist/sites/experiments.cubing.net/main.js

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
setup: update-dependencies

.PHONY: update-dependencies
update-dependencies:
	@command -v ${BUN} > /dev/null || { echo "\nPlease install \`bun\` to work on this project:\n\n    # from npm\n    npm install --global bun\n\n    # macOS (Homebrew)\n    brew install oven-sh/bun/bun\n\n    # For other options, see: https://bun.sh/\n" && exit 1 ; }
	${BUN} install --frozen-lockfile

.PHONY: lint
lint: update-dependencies
	${BIOME} check

.PHONY: lint-ci
lint-ci: update-dependencies
	${BIOME} ci

.PHONY: prepack
prepack: clean build test-dist-lib-node-import test-dist-lib-node-scramble test-dist-lib-plain-esbuild-compat

.PHONY: prepublishOnly
prepublishOnly: update-dependencies
	# Lucas is usually the one publishing, and `mak` is over twice as fast. So we use it when available.
	# https://github.com/lgarron/mak
	mak test-all || make test-all

.PHONY: postpublish
postpublish: update-cdn update-create-cubing-app deploy

.PHONY: deploy
deploy: deploy-twizzle deploy-experiments

.PHONY: deploy-twizzle
deploy-twizzle: build-site-twizzle
	${BUN_RUN} script/deploy/twizzle.ts

.PHONY: deploy-experiments
deploy-experiments: build-site-experiments
	bun x @cubing/deploy

.PHONY: roll-vendored-twsearch
roll-vendored-twsearch:
	test -d ../twsearch/ || exit
	rm -rf ../twsearch/dist/wasm/
	cd ../twsearch/ && make build-rust-wasm
	mkdir -p ./src/cubing/vendor/mpl/twsearch
	rm -rf ./src/cubing/vendor/mpl/twsearch/*
	cp -R ../twsearch/dist/wasm/* ./src/cubing/vendor/mpl/twsearch/
	# TODO: why does using normal `echo -n` ignore the `-n` here?
	printf "https://github.com/cubing/twsearch/tree/" > ./src/cubing/vendor/mpl/twsearch/vendored-twsearch-git-version.txt
	make -C ../twsearch/ print-current-commit-hash >> ./src/cubing/vendor/mpl/twsearch/vendored-twsearch-git-version.txt
	${BUN_RUN} script/fix-vendored-twsearch.ts

.PHONY: update-create-cubing-app
update-create-cubing-app:
	cd ../create-cubing-app && make auto-publish

.PHONY: update-cdn
update-cdn:
	@echo "--------------------------------"
	@echo "Updating CDN to the latest \`cubing.js\` release, per:"
	@echo "https://github.com/cubing/cdn.cubing.net/blob/main/docs/maintenance.md#updating-cdncubingnet-to-a-new-cubing-version"
	@echo ""
	test -d ../cdn.cubing.net/ || exit
	cd ../cdn.cubing.net/ && make roll-cubing

######## Only in `Makefile` ########

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

NODE=node
NPX=npx
BUN=bun
BUN_RUN=${BUN} run
BUN_BUN_RUN=${BUN} --bun run
BIOME=${BUN} x @biomejs/biome
WEB_TEST_RUNNER=./node_modules/.bin/wtr

.PHONY: default
default:
	@echo "To work on the project, run:"
	@echo ""
	@echo "    make dev"
	@echo ""
	@echo "To build the project, run:"
	@echo ""
	@echo "    npm install"
	@echo "    make build"
	@echo ""
	@echo "To see available tests, run:"
	@echo ""
	@echo "    npm install"
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
build-lib-js:
	${BUN_RUN} ./script/build/lib/build-lib-js.ts
.PHONY: build-lib-types
build-lib-types:
	${BUN_RUN} ./script/build/lib/build-lib-types.ts
.PHONY: build-bin
build-bin:
	${BUN_RUN} ./script/build/bin/build-bin.ts
	chmod +x ./dist/bin/*.js
.PHONY: build-sites
build-sites: build-site-twizzle build-site-experiments
.PHONY: build-site-twizzle
build-site-twizzle:
	${BUN_RUN} ./script/build/sites/build-site-twizzle.ts
.PHONY: build-site-experiments
build-site-experiments:
	${BUN_RUN} ./script/build/sites/build-site-experiments.ts
.PHONY: build-site-docs
build-site-docs:
	rm -rf ./dist/sites/js.cubing.net/
	${NPX} typedoc src/cubing/*/index.ts
	cp -R ./src/docs/js.cubing.net/* ./dist/sites/js.cubing.net/
	@echo "\n\nNote: The js.cubing.net docs are deployed to GitHub Pages using GitHub Actions when a commit is pushed to the \`main\` branch:\nhttps://github.com/cubing/cubing.js/actions/workflows/pages.yml"
.PHONY: generate-js
generate-js: generate-js-parsers generate-js-svg
.PHONY: generate-js-parsers
generate-js-parsers:
	${NPX} peggy --format es src/cubing/kpuzzle/parser/parser-peggy.peggy
.PHONY: generate-js-svg
generate-js-svg:
	@echo "TODO: Generating JS for SVGs is not implemented yet."
.PHONY: dev
dev: quick-setup
	${BUN_RUN} ./script/build/sites/dev.ts
.PHONY: link
link: build
	npm link
.PHONY: clean
clean:
	rm -rf \
		dist .temp coverage script/bin/screenshot-src/main.js \
		./alg ./bluetooth ./kpuzzle ./notation ./protocol ./puzzle-geometry ./puzzles ./scramble ./search ./stream ./twisty
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
test-fast: \
	build-lib-js test-spec-bun build-bin build-sites \
	lint \
	test-src-import-restrictions test-src-scripts-consistency \
	test-dist-lib-plain-esbuild-compat \
	test-dist-bin-shebang
.PHONY: test-all
test-all: test-src test-build test-dist
.PHONY: test-src
test-src: \
	test-spec \
	lint-ci \
	test-src-tsc \
	test-src-import-restrictions \
	test-src-scripts-consistency # keep CI.yml in sync with this
.PHONY: test-spec
test-spec: test-spec-bun test-spec-dom
.PHONY: test-spec-bun
test-spec-bun:
	${BUN} test
.PHONY: test-spec-bun-with-coverage
test-spec-bun-with-coverage:
	${BUN} test
.PHONY: test-spec-dom
test-spec-dom:
	${WEB_TEST_RUNNER} --playwright
.PHONY: test-spec-dom-with-coverage
test-spec-dom-with-coverage:
	${WEB_TEST_RUNNER} --playwright --coverage
.PHONY: test-src-import-restrictions
test-src-import-restrictions: build-lib-js
	${BUN_RUN} ./script/test/src/import-restrictions/main.ts
.PHONY: test-src-tsc
test-src-tsc:
	${NPX} tsc --project ./tsconfig.json
.PHONY: test-src-scripts-consistency
test-src-scripts-consistency:
	${BUN_RUN} ./script/test/src/scripts-consistency/main.ts
.PHONY: fix-src-scripts-consistency
fix-src-scripts-consistency:
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
	test-dist-lib-node-scramble-all-events \
	test-dist-lib-perf \
	test-dist-lib-plain-esbuild-compat \
	test-dist-lib-build-size \
	test-dist-sites-experiments # keep CI.yml in sync with this
.PHONY: test-dist-lib-node-import
test-dist-lib-node-import: build-lib-js
	${NODE} script/test/dist/lib/cubing/node/import/main.js
.PHONY: test-dist-lib-node-scramble-all-events
test-dist-lib-node-scramble-all-events: build-lib-js
	${NODE} script/test/dist/lib/cubing/node/scramble-all-events/main.js
.PHONY: test-dist-lib-perf
test-dist-lib-perf: build-lib-js
	${NODE} script/test/dist/lib/cubing/perf/*.js
.PHONY: test-dist-lib-plain-esbuild-compat
test-dist-lib-plain-esbuild-compat: build-lib-js
	${BUN_RUN} script/test/dist/lib/cubing/plain-esbuild-compat/main.ts
.PHONY: test-dist-lib-build-size
test-dist-lib-build-size: build-lib-js
	${BUN_RUN} ./script/test/dist/lib/cubing/build-size/main.ts
.PHONY: test-dist-sites-experiments
test-dist-sites-experiments: build-sites
	${NODE} ./script/test/dist/sites/experiments.cubing.net/main.js
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
	time npm exec scramble -- 222
.PHONY: format
format:
	${BIOME} format --write ./script ./src
.PHONY: setup
setup:
	npm ci
.PHONY: quick-setup
quick-setup: | node_modules
.PHONY: lint
lint:
	${BIOME} check ./script ./src
.PHONY: lint-ci
lint-ci:
	${BIOME} ci ./script ./src
.PHONY: prepack
prepack: clean build test-dist-lib-node-import test-dist-lib-plain-esbuild-compat
.PHONY: prepublishOnly
prepublishOnly: test-all
.PHONY: postpublish
postpublish: update-cdn update-create-cubing-app deploy
.PHONY: deploy
deploy: deploy-twizzle deploy-experiments
.PHONY: deploy-twizzle
deploy-twizzle: build-site-twizzle
	${BUN_RUN} script/deploy/twizzle.ts
.PHONY: deploy-experiments
deploy-experiments: build-site-experiments
	${BUN_RUN} script/deploy/experiments.ts
.PHONY: roll-vendored-twsearch
roll-vendored-twsearch:
	test -d ../twsearch/ || exit
	cd ../twsearch/ && make clean build/esm
	rm -rf src/cubing/vendor/mpl/twsearch/*
	cp -R ../twsearch/build/esm/* src/cubing/vendor/mpl/twsearch/
	${BUN_RUN} script/fix-vendored-twsearch.ts
.PHONY: update-create-cubing-app
update-create-cubing-app:
	cd ../create-cubing-app && make roll-cubing-commit && git push
.PHONY: update-cdn
update-cdn:
	@echo "--------------------------------"
	@echo "Updating CDN to the latest \`cubing.js\` release, per:"
	@echo "https://github.com/cubing/cdn.cubing.net/blob/main/docs/maintenance.md#updating-cdncubingnet-to-a-new-cubing-version"
	@echo ""
	test -d ../cdn.cubing.net/ || exit
	cd ../cdn.cubing.net/ && make roll-cubing

######## Only in `Makefile` ########

# Not .PHONY(!)
node_modules:
	${BUN_RUN} ./script/quick-setup/main.ts

.PHONY: publish
.PHONY: publish
publish:
	npm publish

.PHONY: pack
.PHONY: pack
pack:
	# Note that we need to use `./dist/` rather than `./dist/pack/`, because `make
	# prepack` removes the entire `./dist/` folder (but creates a new `./dist/`
	# folder). This prevents us from creating a `./dist/pack/` folder (or
	# similarly, `./.temp/pack/` folder) that will stick around long enough for
	# `npm pack` to use. The simplest is just to place the result directly in
	# `./dist/`.
	npm pack --pack-destination ./dist/

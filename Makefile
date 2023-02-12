# TODO: see if we can make everything compatible with `bun`
NODE=node
ROME=./node_modules/.bin/rome
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

.PHONY: build
build: clean
	${NODE} ./script/build/main.js all
.PHONY: build-esm
build-esm:
	${NODE} ./script/build/main.js esm
.PHONY: build-types
build-types:
	${NODE} ./script/build/main.js types
.PHONY: build-bin
build-bin:
	${NODE} ./script/build/main.js bin
.PHONY: build-sites
build-sites: build-site-twizzle build-site-experiments
.PHONY: build-site-twizzle
build-site-twizzle:
	${NODE} ./script/build/main.js twizzle
.PHONY: build-site-experiments
build-site-experiments:
	${NODE} ./script/build/main.js experiments
.PHONY: build-site-docs
build-site-docs: build-search-worker
	rm -rf ./dist/sites/js.cubing.net/
	npx typedoc src/cubing/*/index.ts
	cp -R ./src/docs/js.cubing.net/* ./dist/sites/js.cubing.net/
	@echo "\n\nNote: The js.cubing.net docs are deployed to GitHub Pages using GitHub Actions when a commit is pushed to the \`main\` branch:\nhttps://github.com/cubing/cubing.js/actions/workflows/pages.yml"
.PHONY: build-search-worker
build-search-worker:
	${NODE} ./script/build/main.js search-worker
.PHONY: generate-js
generate-js: generate-js-parsers generate-js-svg
.PHONY: generate-js-parsers
generate-js-parsers:
	npx peggy --format es src/cubing/kpuzzle/parser/parser-peggy.peggy
.PHONY: generate-js-svg
generate-js-svg:
	@echo "TODO: Generating JS for SVGs is not implemented yet."
.PHONY: dev
dev: quick-setup
	${NODE} ./script/build/main.js sites dev
.PHONY: link
link: build
	npm link
.PHONY: clean
clean:
	rm -rf \
		dist .temp coverage src/cubing/search/search-worker-inside-generated* script/bin/screenshot-src/main.js \
		./alg ./bluetooth ./kpuzzle ./notation ./protocol ./puzzle-geometry ./puzzles ./scramble ./search ./stream ./twisty
.PHONY: test
test: test-info
.PHONY: test-info
test-info:
	@echo "Run one of the following."
	@echo "(Time estimates are based on a fast computer.)"
	@echo ""
	@echo "    make test-spec (≈3s, \`*.spec.ts\` files only)"
	@echo ""
	@echo "    make test-src   (≈20s, includes \`make test-spec\`)"
	@echo "    make test-build (≈8s)"
	@echo "    make test-dist  (≈15s)"
	@echo ""
	@echo "    make test-all  (≈40s, runs all of the above)"
	@echo "    make test-fast (≈4s, runs a subset of the above)"
	@echo ""
.PHONY: test-fast
test-fast: build-esm lint build-sites build-bin test-spec
.PHONY: test-all
test-all: test-src test-build test-dist
.PHONY: test-src
test-src: \
	test-spec \
	lint-ci \
	test-src-tsc \
	test-src-internal-import-restrictions \
	test-src-does-not-import-dist \
	test-src-scripts-consistency # keep CI.yml in sync with this
.PHONY: test-spec
test-spec:
	${WEB_TEST_RUNNER} --playwright
.PHONY: test-spec-with-coverage
test-spec-with-coverage:
	${WEB_TEST_RUNNER} --playwright --coverage
.PHONY: test-spec-watch
test-spec-watch:
	${WEB_TEST_RUNNER} --playwright --watch
.PHONY: test-src-internal-import-restrictions
test-src-internal-import-restrictions: build-search-worker
	${NODE} ./script/test/src/internal-import-restrictions/main.js
.PHONY: test-src-does-not-import-dist
test-src-does-not-import-dist: build
	${NODE} ./script/test/src/does-not-import-dist/main.js
.PHONY: test-src-tsc
test-src-tsc: build-types
	npx tsc --project ./tsconfig.json
.PHONY: test-src-scripts-consistency
test-src-scripts-consistency:
	${NODE} ./script/test/src/scripts-consistency/main.js
.PHONY: fix-src-scripts-consistency
fix-src-scripts-consistency:
	${NODE} ./script/test/src/scripts-consistency/main.js --fix
.PHONY: test-build
test-build: \
	build-esm \
	build-bin \
	build-types \
	build-sites \
	build-site-docs # keep CI.yml in sync with this
.PHONY: test-dist
test-dist: \
	test-dist-esm-node-import \
	test-dist-esm-scramble-all-events \
	test-dist-esm-perf \
	test-dist-esm-plain-esbuild-compat \
	test-dist-esm-vite \
	test-dist-esm-build-size \
	test-dist-sites-experiments # keep CI.yml in sync with this
.PHONY: test-dist-esm-node-import
test-dist-esm-node-import: build-esm
	${NODE} script/test/dist/esm/node-import/main.js
.PHONY: test-dist-esm-scramble-all-events
test-dist-esm-scramble-all-events: build-esm
	${NODE} script/test/dist/esm/scramble-all-events/main.js
.PHONY: test-dist-esm-perf
test-dist-esm-perf: build-esm
	${NODE} script/test/dist/esm/perf/*.js
.PHONY: test-dist-esm-plain-esbuild-compat
test-dist-esm-plain-esbuild-compat: build-esm
	${NODE} script/test/dist/esm/plain-esbuild-compat/main.js
.PHONY: test-dist-esm-vite
test-dist-esm-vite: build-esm
	${NODE} ./script/test/dist/esm/vite/main.js
.PHONY: test-dist-esm-build-size
test-dist-esm-build-size: build-esm
	${NODE} ./script/test/dist/esm/build-size/main.js
.PHONY: test-dist-sites-experiments
test-dist-sites-experiments: build-sites
	${NODE} ./script/test/dist/experiments/main.js
.PHONY: format
format:
	${ROME} format --write ./script ./src
.PHONY: setup
setup:
	npm ci
.PHONY: quick-setup
quick-setup: | node_modules
.PHONY: lint
lint:
	${ROME} check ./script ./src
.PHONY: lint-ci
lint-ci:
	${ROME} ci ./script ./src
.PHONY: prepack
prepack: clean build test-dist-esm-node-import test-dist-esm-plain-esbuild-compat
.PHONY: prepublishOnly
prepublishOnly: test-all
.PHONY: postpublish
postpublish: update-cdn deploy
.PHONY: deploy
deploy: deploy-twizzle deploy-experiments
.PHONY: deploy-twizzle
deploy-twizzle: build-site-twizzle
	${NODE} script/deploy/twizzle.js
.PHONY: deploy-experiments
deploy-experiments: build-site-experiments
	${NODE} script/deploy/experiments.js
.PHONY: roll-vendored-twsearch
roll-vendored-twsearch:
	test -d ../twsearch/ || exit
	cd ../twsearch/ && make clean build/esm
	rm -rf src/cubing/vendor/mpl/twsearch/*
	cp -R ../twsearch/build/esm/* src/cubing/vendor/mpl/twsearch/
	node script/fix-vendored-twsearch.js
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
	${NODE} ./script/quick-setup/main.js

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

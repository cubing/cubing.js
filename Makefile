MAKEFLAGS += --always-make # Make everything `.PHONY`

# TODO: see if we can make everything compatible with `bun`
NODE=node
ROME=./node_modules/.bin/rome
WEB_TEST_RUNNER=./node_modules/.bin/wtr

######## Shared with `package.json` ########

build: clean
	${NODE} ./script/build/main.js all
build-esm:
	${NODE} ./script/build/main.js esm
build-types:
	${NODE} ./script/build/main.js types
build-bin:
	${NODE} ./script/build/main.js bin
build-sites: build-site-twizzle build-site-experiments
build-site-twizzle:
	${NODE} ./script/build/main.js twizzle
build-site-experiments:
	${NODE} ./script/build/main.js experiments
build-site-docs: build-search-worker
	rm -rf ./dist/sites/js.cubing.net/
	npx typedoc src/cubing/*/index.ts
	cp -R ./src/docs/js.cubing.net/* ./dist/sites/js.cubing.net/
	@echo -e "\n\nNote: The js.cubing.net docs are deployed to GitHub Pages using GitHub Actions when a commit is pushed to the \`main\` branch:\nhttps://github.com/cubing/cubing.js/actions/workflows/pages.yml"
build-search-worker:
	${NODE} ./script/build/main.js search-worker
generate-js: generate-js-parsers generate-js-svg
generate-js-parsers:
	npx peggy --format es src/cubing/kpuzzle/parser/parser-peggy.peggy
generate-js-svg:
	@echo "TODO: Generating JS for SVGs is not implemented yet."
dev: quick-setup
	${NODE} ./script/build/main.js sites dev
link: build
	npm link
clean:
	rm -rf \
		dist .temp coverage src/cubing/search/search-worker-inside-generated* script/bin/screenshot-src/main.js \
		./alg ./bluetooth ./kpuzzle ./notation ./protocol ./puzzle-geometry ./puzzles ./scramble ./search ./stream ./twisty
test:
	@echo "Run one of the following."
	@echo "(Time estimates are based on a fast computer.)"
	@echo ""
	@echo "    make test-spec (≈3s, \`*.spec.ts\` files only)"
	@echo ""
	@echo "    make test-src   (≈20s, includes \`make test-spec\`)"
	@echo "    make test-build (≈8s)"
	@echo "    make test-dist  (≈30s)"
	@echo ""
	@echo "    make test-all  (≈50s, runs all of the above)"
	@echo "    make test-fast (≈4s, runs a subset of the above)"
	@echo ""
test-fast: build-esm lint build-sites build-bin test-spec
test-all: test-src test-build test-dist
test-src: \
	test-spec \
	lint \
	test-src-tsc \
	test-src-internal-import-restrictions \
	test-src-does-not-import-dist \
	test-src-scripts-consistency # keep CI.yml in sync with this
test-spec:
	${WEB_TEST_RUNNER} --playwright
test-spec-with-coverage:
	${WEB_TEST_RUNNER} --playwright --coverage
test-spec-watch:
	${WEB_TEST_RUNNER} --playwright --watch
test-src-internal-import-restrictions: build-search-worker
	${NODE} ./script/test/src/internal-import-restrictions/main.js
test-src-does-not-import-dist:
	${NODE} ./script/test/src/does-not-import-dist/main.js
test-src-tsc: build-types
	npx tsc --project ./tsconfig.json
test-src-scripts-consistency:
	${NODE} ./script/test/src/scripts-consistency/main.js
fix-src-scripts-consistency:
	${NODE} ./script/test/src/scripts-consistency/main.js --fix
test-build: \
	build-esm \
	build-bin \
	build-types \
	build-sites \
	build-site-docs # keep CI.yml in sync with this
test-dist: \
	test-dist-esm-node-import \
	test-dist-esm-scramble-all-events \
	test-dist-esm-perf \
	test-dist-esm-plain-esbuild-compat \
	test-dist-esm-parcel \
	test-dist-esm-vite \
	test-dist-esm-build-size \
	test-dist-sites-experiments # keep CI.yml in sync with this
test-dist-esm-node-import: build-esm
	${NODE} script/test/dist/esm/node-import/main.js
test-dist-esm-scramble-all-events: build-esm
	${NODE} script/test/dist/esm/scramble-all-events/main.js
test-dist-esm-perf: build-esm
	${NODE} script/test/dist/esm/perf/*.js
test-dist-esm-plain-esbuild-compat: build-esm
	${NODE} script/test/dist/esm/plain-esbuild-compat/main.js
test-dist-esm-parcel: build-esm
	${NODE} ./script/test/dist/esm/parcel/main.js
test-dist-esm-vite: build-esm
	${NODE} ./script/test/dist/esm/vite/main.js
test-dist-esm-build-size: build-esm
	${NODE} ./script/test/dist/esm/build-size/main.js
test-dist-sites-experiments: build-sites
	${NODE} ./script/test/dist/experiments/main.js
format:
	${ROME} format --write ./script ./src
	@echo -e "\n\n\n\n\n\nNOTE: Rome outputs lots of \`Unknown lint rule\` warnings at the moment. These are safe to ignore for now. See https://github.com/rome/tools/issues/3406\n\n\n\n"
setup:
	npm ci
quick-setup:
	${NODE} ./script/quick-setup/main.js
lint:
	${ROME} check ./script ./src
lint-ci:
	${ROME} ci ./script ./src
prepack: clean test-fast build test-dist-esm-node-import test-dist-esm-plain-esbuild-compat
postpublish:
	@echo ""
	@echo ""
	@echo "Consider updating \`cdn.cubing.net\` if you have access:"
	@echo "https://github.com/cubing/cdn.cubing.net/blob/main/docs/maintenance.md#updating-cdncubingnet-to-a-new-cubing-version"
deploy: deploy-twizzle deploy-experiments
deploy-twizzle: build-site-twizzle
	node script/deploy/twizzle.js
deploy-experiments: build-site-experiments
	node script/deploy/experiments.js

######## Only in `Makefile` ########

.PHONY: publish
publish:
	npm publish

.PHONY: pack
pack:
	# Note that we need to use `./dist/` rather than `./dist/pack/`, because `make
	# prepack` removes the entire `./dist/` folder (but creates a new `./dist/`
	# folder). This prevents us from creating a `./dist/pack/` folder (or
	# similarly, `./.temp/pack/` folder) that will stick around long enough for
	# `npm pack` to use. The simplest is just to place the result directly in
	# `./dist/`.
	npm pack --pack-destination ./dist/

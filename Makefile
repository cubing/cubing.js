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
build-site-typedoc:
	npx typedoc src/cubing/*/index.ts
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
		dist .temp coverage src/cubing/search/search-worker-inside-generated* \
		./alg ./bluetooth ./kpuzzle ./notation ./protocol ./puzzle-geometry ./puzzles ./scramble ./search ./stream ./twisty
test:
	@echo "Run one of the following."
	@echo "(Time estimates are based on a fast computer.)"
	@echo ""
	@echo "    make test-spec (≈4s, \`*.spec.ts\` files only)"
	@echo ""
	@echo "    make test-src   (≈20s, includes \`make test-spec\`)"
	@echo "    make test-build (≈8s)"
	@echo "    make test-dist  (≈30s)"
	@echo ""
	@echo "    make test-all  (≈50s, runs all of the above)"
	@echo "    make test-fast (≈5s, runs a subset of the above)"
	@echo ""
test-fast: build-esm lint build-sites build-bin test-spec
test-all: test-src test-build test-dist
test-src: \
	test-spec \
	lint \
	test-src-tsc \
	test-src-internal-import-restrictions \
	test-src-does-not-import-dist # keep CI.yml in sync with this
test-spec:
	${WEB_TEST_RUNNER} --playwright
test-spec-watch:
	${WEB_TEST_RUNNER} --playwright --watch
test-src-internal-import-restrictions:
	${NODE} ./script/test/src/internal-import-restrictions/main.js
test-src-does-not-import-dist:
	${NODE} ./script/test/src/does-not-import-dist/main.js
test-src-tsc: build-types
	npx tsc --project ./tsconfig.json
test-build: \
	build-esm \
	build-bin \
	build-types \
	build-sites \
	build-site-typedoc # keep CI.yml in sync with this
test-dist: \
	test-dist-esm-node-import \
	test-dist-esm-scramble-all-events \
	test-dist-esm-perf \
	test-dist-esm-plain-esbuild-compat \
	test-dist-esm-parcel \
	test-dist-esm-vite \
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
test-dist-sites-experiments: build-sites
	${NODE} ./script/test/dist/experiments/main.js
format:
	${ROME} format --write ./script ./src
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
publish:
	npm publish

######## Only in `Makefile` ########

.PHONY: deploy
deploy: deploy-twizzle deploy-experiments

GIT_DESCRIBE_VERSION       = $(shell git describe --tags)
VERSION_FOLDER_NAME        = $(shell date "+%Y-%m-%d@%H-%M-%S-%Z@${GIT_DESCRIBE_VERSION}@unixtime%s")
TWIZZLE_SSH_SERVER         = cubing_deploy@towns.dreamhost.com
TWIZZLE_SFTP_PATH          = ~/alpha.twizzle.net
TWIZZLE_SFTP_VERSIONS_PATH = ~/_deploy-versions/alpha.twizzle.net
TWIZZLE_SFTP_VERSION_PATH  = ${TWIZZLE_SFTP_VERSIONS_PATH}/${VERSION_FOLDER_NAME}
TWIZZLE_SFTP_UPLOAD_PATH   = ${TWIZZLE_SFTP_VERSIONS_PATH}/rsync-incomplete/${VERSION_FOLDER_NAME}
TWIZZLE_URL                = https://alpha.twizzle.net/

.PHONY: deploy-twizzle
deploy-twizzle: build-site-twizzle
	ssh "${TWIZZLE_SSH_SERVER}" "mkdir -p ${TWIZZLE_SFTP_UPLOAD_PATH} && [ ! -d ${TWIZZLE_SFTP_PATH} ] || { cp -R ${TWIZZLE_SFTP_PATH}/* ${TWIZZLE_SFTP_UPLOAD_PATH} && rm -f ${TWIZZLE_SFTP_UPLOAD_PATH}/deploy-versions }"
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		./dist/sites/alpha.twizzle.net/ \
		--delete \
		"${TWIZZLE_SSH_SERVER}:${TWIZZLE_SFTP_UPLOAD_PATH}/"
	ssh "${TWIZZLE_SSH_SERVER}" "mkdir -p ${TWIZZLE_SFTP_VERSIONS_PATH} && mv ${TWIZZLE_SFTP_UPLOAD_PATH} ${TWIZZLE_SFTP_VERSION_PATH} && ln -s ${TWIZZLE_SFTP_VERSIONS_PATH} ${TWIZZLE_SFTP_VERSION_PATH}/deploy-versions && rm ${TWIZZLE_SFTP_PATH} && ln -s ${TWIZZLE_SFTP_VERSION_PATH} ${TWIZZLE_SFTP_PATH}"
	curl "https://alpha.twizzle.net/version.json"
	echo "\nDone deploying. Go to ${TWIZZLE_URL}\n"

EXPERIMENTS_SFTP_PATH = "cubing_deploy@towns.dreamhost.com:~/experiments.cubing.net/cubing.js"
EXPERIMENTS_URL       = "https://experiments.cubing.net/cubing.js/"

.PHONY: deploy-experiments
deploy-experiments: build-site-experiments
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		./dist/sites/experiments.cubing.net/cubing.js/ \
		${EXPERIMENTS_SFTP_PATH}
	echo "\nDone deploying. Go to ${EXPERIMENTS_URL}\n"

TYPEDOC_SFTP_PATH = "cubing_deploy@towns.dreamhost.com:~/experiments.cubing.net/cubing.js-typedoc/"
TYPEDOC_URL       = "https://experiments.cubing.net/cubing.js-typedoc/"

.PHONY: deploy-typedoc
deploy-typedoc: build-search-worker build-site-typedoc
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		./dist/sites/typedoc/ \
		${TYPEDOC_SFTP_PATH}
	echo "\nDone deploying. Go to ${TYPEDOC_URL}\n"


######## VR ########


.PHONY: setup-vr
setup-vr:
	adb tcpip 5555
	adb reverse tcp:333 tcp:333
	adb reverse tcp:51785 tcp:51785

.PHONY: restart-oculus-browser
restart-oculus-browser:
	adb shell am force-stop com.oculus.browser
	adb shell am start -n com.oculus.browser/.WebVRActivity

# VR_SFTP_PATH = "towns.dreamhost.com:~/vr.cubing.net/"
# VR_URL       = "https://vr.cubing.net/"

# .PHONY: deploy-vr
# deploy-vr: clean parcel-build-for-vr-cubing-net
# 	rsync -avz \
# 		--exclude .DS_Store \
# 		--exclude .git \
# 		./dist/experiments.cubing.net/vr/ \
# 		${VR_SFTP_PATH}
# 	echo "\nDone deploying. Go to ${VR_URL}\n"

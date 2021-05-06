# This Makefile is a wrapper around the scripts from `package.json`.
# https://github.com/lgarron/Makefile-scripts

# Note: the first command becomes the default `make` target.
NPM_COMMANDS = build build-esm build-cjs build-bundle-global build-types build-bin build-experimental-splitting-build build-tsc generate-js generate-js-parsers generate-js-svg dev clean test test-jest test-node-require test-node-import format setup lint prepack parcel-build-for-twizzle-net parcel-build-for-experiments-cubing-net parcel-build-test

.PHONY: $(NPM_COMMANDS)
$(NPM_COMMANDS):
	npm run $@

# We write the npm commands to the top of the file above to make shell autocompletion work in more places.
DYNAMIC_NPM_COMMANDS = $(shell cat package.json | npx jq --raw-output ".scripts | keys_unsorted | join(\" \")")
.PHONY: update-Makefile
update-Makefile:
	sed -i "" "s/^NPM_COMMANDS = .*$$/NPM_COMMANDS = ${DYNAMIC_NPM_COMMANDS}/" Makefile

.PHONY: publish
publish:
	npm publish

.PHONY: setup-vr
setup-vr:
	adb tcpip 5555
	adb reverse tcp:333 tcp:333
	adb reverse tcp:51785 tcp:51785

.PHONY: restart-oculus-browser
restart-oculus-browser:
	adb shell am force-stop com.oculus.browser
	adb shell am start -n com.oculus.browser/.WebVRActivity

VR_SFTP_PATH = "towns.dreamhost.com:~/vr.cubing.net/"
VR_URL       = "https://vr.cubing.net/"

.PHONY: deploy-vr
deploy-vr: clean parcel-build-for-vr-cubing-net
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		./dist/experiments.cubing.net/vr/ \
		${VR_SFTP_PATH}
	echo "\nDone deploying. Go to ${VR_URL}\n"

.PHONY: deploy
# The `clean` dependency is a workaround for Parcel bugs.
deploy: clean deploy-experiments

EXPERIMENTS_SFTP_PATH = "towns.dreamhost.com:~/experiments.cubing.net/cubing.js/"
EXPERIMENTS_URL       = "https://experiments.cubing.net/cubing.js/"

.PHONY: deploy-experiments
deploy-experiments: parcel-build-for-experiments-cubing-net
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		./dist/snowpack/ \
		${EXPERIMENTS_SFTP_PATH}
	echo "\nDone deploying. Go to ${EXPERIMENTS_URL}\n"

TWIZZLE_SOURCE_PATH = "./dist/twizzle.net/twizzle-net/"
TWIZZLE_SFTP_PATH   = "towns.dreamhost.com:~/twizzle.net/play/"
TWIZZLE_URL         = "https://twizzle.net/"

.PHONY: deploy-twizzle
deploy-twizzle: parcel-build-for-twizzle-net
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		${TWIZZLE_SOURCE_PATH} \
		${TWIZZLE_SFTP_PATH}
	echo "\nDone deploying. Go to ${TWIZZLE_URL}\n"

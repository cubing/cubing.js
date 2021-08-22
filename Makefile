# This Makefile is a wrapper around the scripts from `package.json`.
# https://github.com/lgarron/Makefile-scripts

# Note: the first command becomes the default `make` target.
NPM_COMMANDS = build build-esm build-bundle-global build-types build-bin build-sites build-site-twizzle build-site-experiments build-search-worker generate-js generate-js-parsers generate-js-svg dev clean test test-dist-esm-node-import test-dist-esm-parcel test-dist-esm-perf test-dist-experiments test-import-restrictions test-jest test-tsc format setup lint prepack

.PHONY: $(NPM_COMMANDS)
$(NPM_COMMANDS):
	npm run $@

# We write the npm commands to the top of the file above to make shell autocompletion work in more places.
DYNAMIC_NPM_COMMANDS = $(shell cat package.json | npx jq --raw-output ".scripts | keys_unsorted | join(\" \")")
UPDATE_MAKEFILE_SED_ARGS = "s/^NPM_COMMANDS = .*$$/NPM_COMMANDS = ${DYNAMIC_NPM_COMMANDS}/" Makefile
.PHONY: update-Makefile
update-Makefile:
	if [ "$(shell uname -s)" = "Darwin" ] ; then sed -i "" ${UPDATE_MAKEFILE_SED_ARGS} ; fi
	if [ "$(shell uname -s)" != "Darwin" ] ; then sed -i"" ${UPDATE_MAKEFILE_SED_ARGS} ; fi

.PHONY: publish
publish:
	npm publish

.PHONY: deploy
deploy: deploy-twizzle deploy-experiments

TWIZZLE_SFTP_PATH = "cubing_deploy@towns.dreamhost.com:~/alpha.twizzle.net/"
TWIZZLE_URL       = "https://alpha.twizzle.net/"

.PHONY: deploy-twizzle
deploy-twizzle: build-site-twizzle
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		./dist/sites/alpha.twizzle.net/ \
		${TWIZZLE_SFTP_PATH}
	echo "\nDone deploying. Go to ${TWIZZLE_URL}\n"

EXPERIMENTS_SFTP_PATH = "cubing_deploy@towns.dreamhost.com:~/experiments.cubing.net/cubing.js/"
EXPERIMENTS_URL       = "https://experiments.cubing.net/cubing.js/"

.PHONY: deploy-experiments
deploy-experiments: build-site-experiments
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		./dist/sites/experiments.cubing.net/cubing.js/ \
		${EXPERIMENTS_SFTP_PATH}
	echo "\nDone deploying. Go to ${EXPERIMENTS_URL}\n"


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

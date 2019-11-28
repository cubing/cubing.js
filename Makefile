# This Makefile is a wrapper around the scripts from `package.json`.
# https://github.com/lgarron/Makefile-scripts

# Note: the first command becomes the default `make` target.
NPM_COMMANDS = build dev clean test format setup lint prepack parcel parcel-dev-twizzle parcel-build-vr

.PHONY: $(NPM_COMMANDS)
$(NPM_COMMANDS):
	npm run $@

# We write the npm commands to the top of the file above to make shell autocompletion work in more places.
DYNAMIC_NPM_COMMANDS = $(shell cat package.json | npx jq --raw-output ".scripts | keys_unsorted | join(\" \")")
.PHONY: update-Makefile
update-Makefile:
	sed -i "" "s/^NPM_COMMANDS = .*$$/NPM_COMMANDS = ${DYNAMIC_NPM_COMMANDS}/" Makefile

.PHONY: setup-vr
setup-vr:
	adb tcpip 5555
	adb reverse tcp:1234 tcp:1234
	adb reverse tcp:51785 tcp:51785

VR_SFTP_PATH = "towns.dreamhost.com:~/vr.cubing.net/"
VR_URL       = "https://vr.cubing.net/"

.PHONY: deploy-vr
deploy-vr: clean parcel-build-vr
	rsync -avz \
		--exclude .DS_Store \
		--exclude .git \
		./dist/vr/ \
		${VR_SFTP_PATH}
	echo "\nDone deploying. Go to ${VR_URL}\n"

.PHONY: restart-oculus-browser
restart-oculus-browser:
	adb shell am force-stop com.oculus.browser
	adb shell am start -n com.oculus.browser/.WebVRActivity

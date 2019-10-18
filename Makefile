# Note: the first command becomes the default `make` target.
NPM_COMMANDS = build dev test lint setup print-schemas clean parcel parcel-build-vr

.PHONY: $(NPM_COMMANDS)
$(NPM_COMMANDS):
	npm run $@

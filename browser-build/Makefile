NODE_BIN = ../node_modules/.bin

.PHONY: dist
dist: clean-dist
	env PROD=true ${NODE_BIN}/webpack-cli

.PHONY: dev
dev:
	${NODE_BIN}/webpack-cli --watch

.PHONY: test
test:
	npm test

.PHONY: clean
clean: clean-dist
	rm -f yarn-error.log

.PHONY: clean-dist
clean-dist:
	rm -rf ./dist

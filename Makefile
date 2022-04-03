test:
	npx jest --config jest.config.js --runInBand --no-cache $(options)

test_with_coverage:
	make test options="--coverage"


# documentations
deploy_docs:
	yarn docs:deploy
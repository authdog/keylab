test:
	bun run test $(options)

test_with_coverage:
	make test options="--coverage"

deploy_lib:
	bun run lib:publish

# documentations
deploy_docs:
	bun run docs:pages
test:
	pnpm test $(options)

test_with_coverage:
	make test options="--coverage"


deploy_lib:
	pnpm lib:publish

# documentations
deploy_docs:
	pnpm docs:deploy
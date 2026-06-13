test *options:
    bun run test {{options}}

test_with_coverage:
    just test --coverage

deploy_lib:
    bun run lib:publish

# documentations
deploy_docs:
    bun run docs:pages

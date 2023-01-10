module.exports = {

    moduleFileExtensions: ["ts", "js"],
    transform: {
        "^.+\\.(ts)$": "ts-jest",
    },
    testPathIgnorePatterns: [
        // https://ilikekillnerds.com/2019/10/jest-not-finding-tests-in-travis-ci-you-might-be-ignoring-the-build-folder/
        "/node_modules/", "dist", "docs", "coverage", "tsdoc"
    ],
    testMatch: [
       "<rootDir>/src/**/*.test.ts",
       "<rootDir>/scripts/**/*.test.ts"
    ],
    testEnvironment: "node",
    testTimeout: 10000,
    collectCoverageFrom: [
        "<rootDir>/scripts/**/*.ts",
        "<rootDir>/lib/**/*.ts",
        "<rootDir>/lib/**/**/*.ts"
    ],
}

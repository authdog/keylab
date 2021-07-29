module.exports = {
    globals: {
        "ts-jest": {
            tsConfig: "tsconfig.json",
        },
    },
    moduleFileExtensions: ["ts", "js"],
    transform: {
        "^.+\\.(ts)$": "ts-jest",
    },
    testPathIgnorePatterns: [
        "/node_modules/", "build", "dist", "docs", "coverage", "tsdoc"
    ],
    testEnvironment: "node",
    rootDir: ".",
    collectCoverageFrom: [
        "<rootDir>/scripts/**/*.ts",
        "<rootDir>/lib/**/*.ts",
        "<rootDir>/lib/**/**/*.ts"
    ],
}

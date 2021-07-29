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
    testMatch: [
       "<rootDir>/lib/**/*.test.ts",
       "<rootDir>/scripts/**/*.test.ts"
    ],
    testEnvironment: "node",
    collectCoverageFrom: [
        "<rootDir>/scripts/**/*.ts",
        "<rootDir>/lib/**/*.ts",
        "<rootDir>/lib/**/**/*.ts"
    ],
}

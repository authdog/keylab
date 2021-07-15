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
    testMatch: [
        "**/test/**/*.test.(ts|js)",
        "**/__tests__/*.test.(ts|js)",
        "**/**/*.test.(ts|js)"
    ],
    testPathIgnorePatterns: ["/node_modules/", "build", "dist", "docs"],
    testEnvironment: "node",
    rootDir: ".",
    collectCoverageFrom: [
        "<rootDir>/scripts/**/*.ts",
        "<rootDir>/lib/**/*.ts"
    ],
}

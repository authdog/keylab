
module.exports = {
    globals: {
      "ts-jest": {
        tsConfig: "tsconfig.json"
      }
    },
    moduleFileExtensions: ["ts", "js"],
    transform: {
      "^.+\\.(ts)$": "ts-jest"
    },
    testMatch: ["**/test/**/*.test.(ts|js)", "**/**/*.test.(ts|js)"],
    testEnvironment: "node",
    rootDir: '..',
    collectCoverageFrom: ["<rootDir>/lib/**/*.ts"],
};
  
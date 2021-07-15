const { writeFileSync, copyFileSync, statSync } = require("fs");
const { resolve, basename } = require("path");
const packageJson = require("../package.json");

const FILES_TO_COPY = ["README.md"];

const main = () => {
    const projectRoot = resolve(__dirname, "..");
    const distPath = resolve(projectRoot, "dist");
    const distPackageJson = createDistPackageJson(packageJson);
    const filePathsToCopy = FILES_TO_COPY.map((pathFile: string) =>
        resolve(projectRoot, pathFile)
    );
    cp(filePathsToCopy, distPath);
    writeFileSync(resolve(distPath, "package.json"), distPackageJson);
};

/**
 *
 * @param {string[]|string} source
 * @param {string} target
 */
const cp = (source: string[], target: string) => {
    const isDir = statSync(target).isDirectory();

    if (!isDir) {
        throw new Error("folder does not exist");
    } else {
        source.forEach((file: string) =>
            copyFileSync(file, resolve(target, basename(file)))
        );
    }
};

/**
 * @param {typeof packageJson} packageConfig
 * @return {string}
 */
const createDistPackageJson = (packageConfig: any) => {
    const {
        devDependencies,
        scripts,
        engines,
        config,
        // husky,
        // 'lint-staged': lintStaged,
        ...distPackageJson
    } = packageConfig;

    return JSON.stringify(distPackageJson, null, 2);
};

main();

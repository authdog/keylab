import { createRequire } from "node:module"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"

type Exports = Record<string, unknown>

export interface BundleCheckDependencies {
    importSource: () => Promise<Exports>
    importEsm: () => Promise<Exports>
    requireCjs: () => Exports
    log: (message: string) => void
}

const defaultDependencies: BundleCheckDependencies = {
    importSource: () => import("../src/index.ts"),
    importEsm: () => import(pathToFileURL(resolve("dist/index.js")).href),
    requireCjs: () => createRequire(import.meta.url)(resolve("dist/index.cjs")),
    log: console.log,
}

export const missingExports = (expected: Exports, actual: Exports) =>
    Object.keys(expected)
        .filter((name) => !(name in actual) || typeof actual[name] !== typeof expected[name])
        .sort()

// A smoke test that exercises real code, not just export names.
export const roundTrip = async (bundle: Exports) => {
    const { signJwtWithPrivateKey, checkTokenValidness, JwtAlgorithmsEnum } = bundle as any
    const token = await signJwtWithPrivateKey(
        { sub: "bundle", exp: Math.floor(Date.now() / 1000) + 60 },
        JwtAlgorithmsEnum.HS256,
        "bundle-secret",
    )
    return (await checkTokenValidness(token, { secret: "bundle-secret" })) === true
}

export const checkBundle = async (dependencies = defaultDependencies) => {
    const source = await dependencies.importSource()
    const bundles: [string, Exports][] = [
        ["dist/index.js", await dependencies.importEsm()],
        ["dist/index.cjs", dependencies.requireCjs()],
    ]

    const problems: string[] = []
    for (const [name, bundle] of bundles) {
        const missing = missingExports(source, bundle)
        if (missing.length > 0) {
            problems.push(`${name} is missing exports: ${missing.join(", ")}`)
        } else if (!(await roundTrip(bundle))) {
            problems.push(`${name} failed the sign and verify round trip`)
        } else {
            dependencies.log(`${name}: ${Object.keys(source).length} exports, round trip ok`)
        }
    }

    if (problems.length > 0) {
        throw new Error(problems.join("\n"))
    }
}

if (import.meta.main) {
    await checkBundle()
}

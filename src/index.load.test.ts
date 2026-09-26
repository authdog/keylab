import { spawnSync } from "node:child_process"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, it } from "vitest"
import { getKeyPair } from "./index"

const hookSource = `
export async function resolve(specifier, context, nextResolve) {
    if (specifier === "node:crypto" || specifier === "crypto") {
        throw new Error("node:crypto loaded at import from " + (context.parentURL ?? "unknown"))
    }
    return nextResolve(specifier, context)
}
`

it("does not load node:crypto when src/index.ts is imported", () => {
    expect(getKeyPair).toBeTypeOf("function")

    const dir = mkdtempSync(join(tmpdir(), "keylab-load-"))
    const hookPath = join(dir, "hook.mjs")
    const entryPath = join(process.cwd(), "dist", "load-probe.mjs")
    writeFileSync(hookPath, hookSource)

    const build = spawnSync(
        "bun",
        [
            "build",
            "src/index.ts",
            "--outfile",
            entryPath,
            "--format",
            "esm",
            "--packages",
            "external",
        ],
        { encoding: "utf8" },
    )
    expect(build.status, build.stderr).toBe(0)

    const run = spawnSync("node", ["--import", hookPath, entryPath], {
        encoding: "utf8",
        cwd: process.cwd(),
    })

    rmSync(entryPath, { force: true })
    rmSync(dir, { recursive: true, force: true })

    expect(run.status, `${run.stdout}\n${run.stderr}`).toBe(0)
})

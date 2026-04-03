import { describe, expect, it, vi } from "vitest"
import {
    files,
    firstPassOptions,
    getErrorMessage,
    optimizeBuild,
    optimizeFile,
    secondPassOptions,
} from "./optimize-build"

const createDependencies = () => {
    const fileContents: Record<string, string> = {
        "dist/index.js": "console.log('hello')",
        "dist/index.cjs": "console.log('world')",
    }

    const readFileSync = vi.fn((path: string) => fileContents[path])
    const statSync = vi.fn((path: string) => ({ size: (fileContents[path] || "").length || 10 }))
    const writeFileSync = vi.fn((path: string, value: string) => {
        fileContents[path] = value
    })
    const gzipSync = vi.fn((value: string) => Buffer.from(value))
    const log = vi.fn()
    const error = vi.fn()

    return {
        dependencies: {
            readFileSync,
            statSync,
            writeFileSync,
            gzipSync,
            minify: vi.fn(),
            log,
            error,
        },
        fileContents,
        log,
        error,
        writeFileSync,
    }
}

describe("optimize-build", () => {
    it("exposes expected build targets and terser options", () => {
        expect(files).toEqual(["index.js", "index.cjs"])
        expect(firstPassOptions("index.js").module).toBe(true)
        expect(secondPassOptions("index.cjs").module).toBe(false)
        expect(firstPassOptions("index.js").compress).toMatchObject({
            drop_console: true,
            passes: 5,
        })
    })

    it("formats unknown errors safely", () => {
        expect(getErrorMessage(new Error("boom"))).toBe("boom")
        expect(getErrorMessage("plain error")).toBe("plain error")
    })

    it("optimizes a file with injected dependencies", async () => {
        const { dependencies, writeFileSync, log, error } = createDependencies()
        dependencies.minify = vi
            .fn()
            .mockResolvedValueOnce({ code: "const a=1" })
            .mockResolvedValueOnce({ code: "const a=1" })

        await optimizeFile("index.js", dependencies)

        expect(writeFileSync).toHaveBeenCalledWith("dist/index.js", "const a=1")
        expect(log).toHaveBeenCalledWith("Optimized index.js:")
        expect(error).not.toHaveBeenCalled()
    })

    it("reports missing terser output", async () => {
        const firstPassDeps = createDependencies()
        firstPassDeps.dependencies.minify = vi.fn().mockResolvedValueOnce({ code: "" })

        await optimizeFile("index.js", firstPassDeps.dependencies)
        expect(firstPassDeps.error).toHaveBeenCalledWith(
            "Error in first pass for index.js: no output generated",
        )

        const secondPassDeps = createDependencies()
        secondPassDeps.dependencies.minify = vi
            .fn()
            .mockResolvedValueOnce({ code: "const a=1" })
            .mockResolvedValueOnce({ code: "" })

        await optimizeFile("index.js", secondPassDeps.dependencies)
        expect(secondPassDeps.error).toHaveBeenCalledWith(
            "Error optimizing index.js: no output generated",
        )
    })

    it("reports file processing errors", async () => {
        const { dependencies, error } = createDependencies()
        dependencies.readFileSync = vi.fn(() => {
            throw new Error("missing file")
        })

        await optimizeFile("index.js", dependencies)

        expect(error).toHaveBeenCalledWith("Error processing index.js:", "missing file")
    })

    it("runs the optimize build loop", async () => {
        const { dependencies, log } = createDependencies()
        dependencies.minify = vi.fn().mockResolvedValue({ code: "const a=1" })

        await optimizeBuild(["index.js"], dependencies)

        expect(log).toHaveBeenCalledWith("Starting additional build optimization.\n")
        expect(log).toHaveBeenCalledWith("\nBuild optimization complete.")
    })
})

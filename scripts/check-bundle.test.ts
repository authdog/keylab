import { describe, expect, it, vi } from "vitest"
import * as source from "../src/index"
import { checkBundle, missingExports, roundTrip } from "./check-bundle"

describe("check-bundle", () => {
    it("lists exports that are absent or have a different type", () => {
        expect(missingExports({ a: () => 1, b: 1, c: "x" }, { a: () => 2, b: "1" })).toEqual([
            "b",
            "c",
        ])
    })

    it("round trips a token through the source entry point", async () => {
        await expect(roundTrip(source)).resolves.toBe(true)
    })

    it("passes when both bundles match the source", async () => {
        const log = vi.fn()
        await checkBundle({
            importSource: async () => source,
            importEsm: async () => source,
            requireCjs: () => source,
            log,
        })
        expect(log).toHaveBeenCalledTimes(2)
    })

    it("reports a bundle with missing exports or a failing round trip", async () => {
        const broken = { ...source, checkTokenValidness: async () => false }
        await expect(
            checkBundle({
                importSource: async () => source,
                importEsm: async () => ({ JwtAlgorithmsEnum: source.JwtAlgorithmsEnum }),
                requireCjs: () => broken,
                log: vi.fn(),
            }),
        ).rejects.toThrow(
            /dist\/index.js is missing exports: .*checkTokenValidness[\s\S]*dist\/index.cjs failed the sign and verify round trip/,
        )
    })
})

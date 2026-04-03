import { describe, expect, it, vi } from "vitest"
import {
    createCoverageBadgeSvg,
    escapeXml,
    formatCoverageLabel,
    generateCoverageBadge,
    getColor,
    measureWidth,
    readCoveragePercent,
    writeCoverageBadge,
} from "./generate-coverage-badge"

describe("generate-coverage-badge", () => {
    it("formats coverage labels and colors", () => {
        expect(formatCoverageLabel(97.76)).toBe("97.8%")
        expect(formatCoverageLabel(80)).toBe("80%")
        expect(getColor(95)).toBe("#16a34a")
        expect(getColor(75)).toBe("#ca8a04")
        expect(measureWidth("ok")).toBeGreaterThanOrEqual(44)
        expect(escapeXml(`5" < 6 & 7`)).toBe("5&quot; &lt; 6 &amp; 7")
    })

    it("creates an svg badge", () => {
        const svg = createCoverageBadgeSvg(97.8)
        expect(svg).toContain("coverage")
        expect(svg).toContain("97.8%")
        expect(svg).toContain('fill="#16a34a"')
    })

    it("reads and writes coverage badges through injected dependencies", () => {
        const readFileSync = vi.fn(() => JSON.stringify({ total: { lines: { pct: 88.73 } } }))
        const mkdirSync = vi.fn()
        const writeFileSync = vi.fn()

        const coverage = readCoveragePercent("coverage-summary.json", {
            readFileSync,
            mkdirSync,
            writeFileSync,
        })
        expect(coverage).toBe(88.73)

        writeCoverageBadge(coverage, "badges/coverage.svg", {
            readFileSync,
            mkdirSync,
            writeFileSync,
        })

        expect(mkdirSync).toHaveBeenCalled()
        expect(writeFileSync).toHaveBeenCalledWith(
            "badges/coverage.svg",
            expect.stringContaining("88.7%"),
        )
    })

    it("generates a badge label from summary data", () => {
        const readFileSync = vi.fn(() => JSON.stringify({ total: { lines: { pct: 100 } } }))
        const mkdirSync = vi.fn()
        const writeFileSync = vi.fn()

        const label = generateCoverageBadge("coverage-summary.json", "badges/coverage.svg", {
            readFileSync,
            mkdirSync,
            writeFileSync,
        })

        expect(label).toBe("100%")
        expect(writeFileSync).toHaveBeenCalledWith(
            "badges/coverage.svg",
            expect.stringContaining("100%"),
        )
    })
})

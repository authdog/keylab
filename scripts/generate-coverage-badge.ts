import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"

export interface CoverageSummary {
    total?: {
        lines?: {
            pct?: number
        }
    }
}

export interface CoverageBadgeDependencies {
    mkdirSync: typeof mkdirSync
    readFileSync: typeof readFileSync
    writeFileSync: typeof writeFileSync
}

const defaultDependencies: CoverageBadgeDependencies = {
    mkdirSync,
    readFileSync,
    writeFileSync,
}

export const coverageSummaryPath = resolve("coverage/coverage-summary.json")
export const badgePath = resolve("badges/coverage.svg")

export const formatCoverageLabel = (coverage: number) => {
    const roundedCoverage = Math.round(coverage * 10) / 10
    return Number.isInteger(roundedCoverage)
        ? `${roundedCoverage.toFixed(0)}%`
        : `${roundedCoverage.toFixed(1)}%`
}

export const getColor = (value: number) => {
    if (value >= 90) return "#16a34a"
    if (value >= 80) return "#65a30d"
    if (value >= 70) return "#ca8a04"
    if (value >= 60) return "#ea580c"
    return "#dc2626"
}

export const escapeXml = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

export const measureWidth = (text: string) => Math.max(44, text.length * 7 + 10)

export const createCoverageBadgeSvg = (coverage: number) => {
    const coverageLabel = formatCoverageLabel(coverage)
    const label = "coverage"
    const leftWidth = measureWidth(label)
    const rightWidth = measureWidth(coverageLabel)
    const totalWidth = leftWidth + rightWidth
    const color = getColor(coverage)

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${escapeXml(label)}: ${escapeXml(coverageLabel)}">
<linearGradient id="smooth" x2="0" y2="100%">
<stop offset="0" stop-color="#fff" stop-opacity=".7"/>
<stop offset=".1" stop-color="#aaa" stop-opacity=".1"/>
<stop offset=".9" stop-color="#000" stop-opacity=".3"/>
<stop offset="1" stop-color="#000" stop-opacity=".5"/>
</linearGradient>
<mask id="round">
<rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
</mask>
<g mask="url(#round)">
<rect width="${leftWidth}" height="20" fill="#555"/>
<rect x="${leftWidth}" width="${rightWidth}" height="20" fill="${color}"/>
<rect width="${totalWidth}" height="20" fill="url(#smooth)"/>
</g>
<g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
<text x="${Math.floor(leftWidth / 2)}" y="15" fill="#010101" fill-opacity=".3">${escapeXml(label)}</text>
<text x="${Math.floor(leftWidth / 2)}" y="14">${escapeXml(label)}</text>
<text x="${leftWidth + Math.floor(rightWidth / 2)}" y="15" fill="#010101" fill-opacity=".3">${escapeXml(coverageLabel)}</text>
<text x="${leftWidth + Math.floor(rightWidth / 2)}" y="14">${escapeXml(coverageLabel)}</text>
</g>
</svg>
`
}

export const readCoveragePercent = (
    summaryPath: string = coverageSummaryPath,
    dependencies: CoverageBadgeDependencies = defaultDependencies,
) => {
    const summary = JSON.parse(dependencies.readFileSync(summaryPath, "utf8")) as CoverageSummary
    return Number(summary.total?.lines?.pct ?? 0)
}

export const writeCoverageBadge = (
    coverage: number,
    outputPath: string = badgePath,
    dependencies: CoverageBadgeDependencies = defaultDependencies,
) => {
    dependencies.mkdirSync(dirname(outputPath), { recursive: true })
    dependencies.writeFileSync(outputPath, createCoverageBadgeSvg(coverage))
}

export const generateCoverageBadge = (
    summaryPath: string = coverageSummaryPath,
    outputPath: string = badgePath,
    dependencies: CoverageBadgeDependencies = defaultDependencies,
) => {
    const coverage = readCoveragePercent(summaryPath, dependencies)
    writeCoverageBadge(coverage, outputPath, dependencies)
    return formatCoverageLabel(coverage)
}

if (import.meta.main) {
    process.stdout.write(`${generateCoverageBadge()}\n`)
}

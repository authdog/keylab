#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "fs"
import { dirname, resolve } from "path"

const coverageSummaryPath = resolve("coverage/coverage-summary.json")
const badgePath = resolve("badges/coverage.svg")

const summary = JSON.parse(readFileSync(coverageSummaryPath, "utf8"))
const coverage = Number(summary?.total?.lines?.pct ?? 0)
const roundedCoverage = Math.round(coverage * 10) / 10
const coverageLabel = Number.isInteger(roundedCoverage)
    ? `${roundedCoverage.toFixed(0)}%`
    : `${roundedCoverage.toFixed(1)}%`

const getColor = (value) => {
    if (value >= 90) return "#16a34a"
    if (value >= 80) return "#65a30d"
    if (value >= 70) return "#ca8a04"
    if (value >= 60) return "#ea580c"
    return "#dc2626"
}

const escapeXml = (value) =>
    value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

const measureWidth = (text) => Math.max(44, text.length * 7 + 10)

const label = "coverage"
const leftWidth = measureWidth(label)
const rightWidth = measureWidth(coverageLabel)
const totalWidth = leftWidth + rightWidth
const color = getColor(roundedCoverage)

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${escapeXml(label)}: ${escapeXml(coverageLabel)}">
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

mkdirSync(dirname(badgePath), { recursive: true })
writeFileSync(badgePath, svg)

process.stdout.write(`${coverageLabel}\n`)

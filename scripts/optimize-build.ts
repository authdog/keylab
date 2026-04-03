import { readFileSync, statSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { gzipSync } from "node:zlib"
import { minify, type MinifyOptions } from "terser"

const distDir = "dist"
const files = ["index.js", "index.cjs"]

const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) {
        return error.message
    }

    return String(error)
}

const firstPassOptions = (filePath: string): MinifyOptions => ({
    compress: {
        arguments: true,
        arrows: true,
        booleans: true,
        booleans_as_integers: true,
        collapse_vars: true,
        comparisons: true,
        computed_props: true,
        conditionals: true,
        dead_code: true,
        directives: true,
        drop_console: true,
        drop_debugger: true,
        ecma: 2020,
        evaluate: true,
        expression: true,
        global_defs: {
            "process.env.NODE_ENV": '"production"',
            "process.env.DEBUG": "false",
            __DEV__: "false",
        },
        hoist_funs: true,
        hoist_props: true,
        hoist_vars: true,
        if_return: true,
        inline: 3,
        join_vars: true,
        keep_fargs: false,
        keep_fnames: false,
        loops: true,
        negate_iife: true,
        properties: true,
        pure_funcs: [
            "console.log",
            "console.warn",
            "console.info",
            "console.debug",
            "console.trace",
            "console.error",
            "console.assert",
            "console.table",
            "console.time",
            "console.timeEnd",
        ],
        pure_getters: true,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        switches: true,
        toplevel: true,
        typeofs: true,
        unsafe: true,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_Function: true,
        unsafe_math: true,
        unsafe_symbols: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
        unused: true,
        passes: 5,
    },
    mangle: {
        toplevel: true,
        safari10: false,
        eval: true,
        properties: {
            regex: /^_|private|internal|temp|tmp/,
            reserved: [
                "jose",
                "crypto",
                "Buffer",
                "require",
                "exports",
                "module",
                "global",
                "window",
            ],
        },
    },
    format: {
        comments: false,
        ascii_only: true,
        beautify: false,
        braces: false,
        semicolons: false,
        wrap_iife: true,
        preamble: "",
    },
    module: filePath.endsWith(".js"),
    toplevel: true,
})

const secondPassOptions = (filePath: string): MinifyOptions => ({
    compress: {
        passes: 3,
        toplevel: true,
        dead_code: true,
        drop_console: true,
        drop_debugger: true,
        keep_fargs: false,
        unsafe: true,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_Function: true,
        unsafe_math: true,
        unsafe_symbols: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
        ecma: 2020,
    },
    mangle: {
        toplevel: true,
        eval: true,
        properties: {
            regex: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/,
            reserved: [
                "jose",
                "crypto",
                "Buffer",
                "require",
                "exports",
                "module",
                "global",
                "window",
                "process",
                "console",
            ],
        },
    },
    format: {
        comments: false,
        ascii_only: true,
        beautify: false,
        braces: false,
        semicolons: false,
    },
    module: filePath.endsWith(".js"),
    toplevel: true,
})

async function optimizeFile(filePath: string) {
    try {
        const fullPath = join(distDir, filePath)
        const originalCode = readFileSync(fullPath, "utf8")
        const originalSize = statSync(fullPath).size

        const firstPass = await minify(originalCode, firstPassOptions(filePath))
        if (!firstPass.code) {
            console.error(`Error in first pass for ${filePath}: no output generated`)
            return
        }

        const result = await minify(firstPass.code, secondPassOptions(filePath))
        if (!result.code) {
            console.error(`Error optimizing ${filePath}: no output generated`)
            return
        }

        writeFileSync(fullPath, result.code)
        const newSize = statSync(fullPath).size
        const savings = (((originalSize - newSize) / originalSize) * 100).toFixed(1)

        const originalGzipped = gzipSync(originalCode).length
        const optimizedGzipped = gzipSync(result.code).length
        const gzipSavings = (((originalGzipped - optimizedGzipped) / originalGzipped) * 100).toFixed(1)

        console.log(`Optimized ${filePath}:`)
        console.log(
            `  Original: ${(originalSize / 1024).toFixed(1)}KB (${(originalGzipped / 1024).toFixed(1)}KB gzipped)`,
        )
        console.log(
            `  Optimized: ${(newSize / 1024).toFixed(1)}KB (${(optimizedGzipped / 1024).toFixed(1)}KB gzipped)`,
        )
        console.log(`  Savings: ${savings}% (${gzipSavings}% gzipped)`)
    } catch (error) {
        console.error(`Error processing ${filePath}:`, getErrorMessage(error))
    }
}

async function main() {
    console.log("Starting additional build optimization.\n")

    for (const file of files) {
        try {
            await optimizeFile(file)
        } catch (error) {
            console.log(`Skipping ${file} (not found or error):`, getErrorMessage(error))
        }
    }

    console.log("\nBuild optimization complete.")
}

void main().catch((error) => {
    console.error(getErrorMessage(error))
    process.exitCode = 1
})

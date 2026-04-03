import { defineConfig } from "vitepress"

export default defineConfig({
    title: "keylab",
    description: "JWT and JWKS tooling for Node.js, Workers, browsers, and Bun.",
    base: process.env.DOCS_BASE || "/",
    cleanUrls: true,
    themeConfig: {
        nav: [
            { text: "Guide", link: "/getting-started" },
            { text: "Runtime", link: "/runtime-compatibility" },
            { text: "Security", link: "/security" },
        ],
        sidebar: [
            {
                text: "Guide",
                items: [
                    { text: "Overview", link: "/" },
                    { text: "Getting Started", link: "/getting-started" },
                    { text: "Runtime Compatibility", link: "/runtime-compatibility" },
                    { text: "API Summary", link: "/api" },
                    { text: "Security", link: "/security" },
                ],
            },
        ],
        socialLinks: [{ icon: "github", link: "https://github.com/authdog/keylab" }],
    },
})

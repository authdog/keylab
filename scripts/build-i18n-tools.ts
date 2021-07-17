import fs from "fs";
import path from "path";

export const buildI18nDocs = async () => {
    // read i18n-meta
    const META_I18N_FOLDER = path.resolve(__dirname, "../docs/i18n-meta");
    const files = fs.readdirSync(META_I18N_FOLDER);
    const ROOT_WEBSITE_DOC = path.resolve(__dirname, "..");
    const FRONT_MATTER_SEP = "---";

    files.map(async (pathMeta: string) => {
        const META_I18N_FILEPATH = path.resolve(META_I18N_FOLDER, pathMeta);
        const payload = require(META_I18N_FILEPATH);

        payload.map((meta) => {
            const INPUT_MDX_PATH = path.resolve(
                ROOT_WEBSITE_DOC,
                `docs/${meta.in_mdx}`
            );
            var data = fs.readFileSync(INPUT_MDX_PATH, "utf8");
            const payloadMdx = data.toString();
            const indexEndFrontMatter = getNIndex(
                payloadMdx,
                FRONT_MATTER_SEP,
                2
            );

            const finalFile = [
                generateFrontMatter({
                    title: meta.title,
                    sidebar_label: meta.sidebar_label
                }),
                payloadMdx.substring(
                    indexEndFrontMatter + FRONT_MATTER_SEP.length
                )
            ].join("\n");

            const OUTPUT_MDX_PATH = path.resolve(
                ROOT_WEBSITE_DOC,
                `docs/${meta.out_mdx}`
            );
            fs.writeFile(OUTPUT_MDX_PATH, finalFile, (err) => {
                if (err) throw err;
            });
        });
    });
};

export const generateFrontMatter = (obj: any): string => {
    const fmBlocks = [];
    fmBlocks.push("---");
    for (const [key, value] of Object.entries(obj)) {
        fmBlocks.push(`${key}: ${value}`); // TODO: sanitizing value?
    }
    fmBlocks.push("---");
    return fmBlocks.join("\n");
};

// https://stackoverflow.com/a/14480366/8483084
const getNIndex = (string: string, subString: string, index: number) => {
    return string.split(subString, index).join(subString).length;
};

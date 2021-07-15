// check in docusaurus.config.js i18n field

// i18n: {
//     defaultLocale: 'en',
//     locales: ['en', 'fr'],
//   },

// {hide title: true}
//

// generate for each locale the corresponding mdx file
// front matter meta in header (defined from meta)
// read input file (defined from meta)
// write output file  (defined from meta)

// i18n/[locale]/docusaurus-plugin-content-docs/current/[folder]/[mdxfile]

export const generateFrontMatter = (obj: any) => {
    const fmBlocks = []
    fmBlocks.push("---");

    for (const [key, value] of Object.entries(obj)) {
        fmBlocks.push(`${key}: ${value}`);
    }

    fmBlocks.push("---");
    return fmBlocks.join('\n');
};

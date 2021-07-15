const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const eastjwtGithub = 'https://github.com/authdog/easyjwt'
const typedocLink = 'https://types.easyjwt.org'
const introductionPath = 'introduction/installation';

const path = require('path')

// const isProduction = process.env.NODE_ENV === 'production'

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: [
      'en',
      'fr'
    ],
  },
  title: 'easyjwt',
  tagline: 'JSON Web Token made easy',
  url: 'https://www.authdog.com',
  baseUrl: '/',
  onBrokenLinks: 'log',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'authdog', // Usually your GitHub org/user name.
  projectName: 'easyjwt', // Usually your repo name.
  themeConfig: {
    navbar: {
      hideOnScroll: true,
      title: 'easyjwt',
      logo: {
        alt: "Authdog",
        src: "img/logo.png",
        srcDark: "img/logo.png"
      },
      items: [
        {
          type: 'doc',
          docId: introductionPath,
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'localeDropdown',
          position: 'right'
        },
        {
          href: eastjwtGithub,
          label: 'GitHub',
          position: 'right'
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Quick start',
              to: `/docs/${introductionPath}`,
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/easyjwt',
            }
          ],
        },
        {
          title: 'Useful Resources',
          items: [
            {
              label: 'GitHub repo',
              href: eastjwtGithub,
            },
            {
              label: 'Typedoc',
              href: typedocLink,
            },
          ],
        },
      ],
      logo: {
        alt: "Authdog",
        src: "img/brand/dark.svg"
      },
      copyright: `Copyright © ${new Date().getFullYear()} Authdog, Inc.`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // editUrl:
          //   `${eastjwtGithub}/docs/edit/master/website/`,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ]
};

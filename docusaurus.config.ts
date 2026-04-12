import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Krishnadutt Panchagnula",
  tagline: "Platform/Devops/SRE/Cloud Engineer",
  favicon: "img/profile_picture.jpg",

  // Set the production url of your site here
  url: "https://krishnaduttpanchagnula.github.io",
  // Set the /<projectName>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "krishnaduttpanchagnula", // Usually your GitHub org/user name.
  projectName: "krishnaduttpanchagnula.github.io", // Usually your repo name.
  deploymentBranch: "gh-pages",
  trailingSlash: false,
  onBrokenLinks: "throw",

  markdown: {
    format: "detect",
    mermaid: false,
    preprocessor: undefined,
    parseFrontMatter: undefined,
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: false, // Disable docs
        blog: {
          showReadingTime: true,
          routeBasePath: "/posts", // Move blog to /posts
          blogTitle: "Blog",
          blogDescription: "Latest blog posts by Krishnadutt Panchagnula",
          postsPerPage: "ALL",
          blogSidebarTitle: "All posts",
          blogSidebarCount: "ALL",
          onUntruncatedBlogPosts: "ignore",
        },

        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/profile_picture.jpg",
    colorMode: {
      defaultMode: "dark",
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: "KRYPTON",
      logo: {
        alt: "Profile Picture",
        src: "img/profile_picture.jpg",
        style: { borderRadius: "50%" },
      },
      items: [
        { to: "/posts", label: "Posts", position: "left" },
        { to: "/about", label: "About", position: "left" },
        {
          href: "https://github.com/krishnaduttpanchagnula",
          label: "GitHub",
          position: "right",
        },
      ],
    },

    footer: {
      style: "dark",
      links: [
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/krishnaduttpanchagnula",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Krishnadutt Panchagnula. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

import { useRouter } from 'next/router';
import { DocsThemeConfig, Navbar, useConfig } from 'nextra-theme-docs';
import { Footer, getNavbarLogo, mdxComponents, ThemeSwitcherButton } from './components';
import { addGuildCompanyMenu } from './components/company-menu';

export interface GuildDocsThemeConfig extends DocsThemeConfig {
  websiteName: string;
  description: string;
}

export function defineConfig({
  websiteName,
  description,
  logo,
  ...config
}: GuildDocsThemeConfig): DocsThemeConfig {
  if (!config.docsRepositoryBase) {
    throw new Error('Missing required "docsRepositoryBase" property');
  }

  const url = new URL(config.docsRepositoryBase);
  const [, org, repoName] = url.pathname.split('/');

  const siteUrl = process.env.SITE_URL;

  return {
    editLink: {
      content: 'Edit this page on GitHub',
    },
    feedback: {
      content: 'Question? Give us feedback →',
      labels: 'kind/docs',
    },
    footer: {
      component: <Footer />,
    },
    sidebar: {
      defaultMenuCollapseLevel: 1,
      toggleButton: true,
    },
    project: {
      link: `${url.origin}/${org}/${repoName}`, // GitHub link in the navbar
    },
    head: function useHead() {
      const { frontMatter, title: pageTitle } = useConfig();
      const { asPath } = useRouter();

      const {
        description = `${websiteName} Documentation`,
        type = 'website',
        canonical = siteUrl &&
          `${siteUrl}${
            // we disallow trailing slashes
            // TODO: dont do this if `trailingSlashes: true`
            asPath === '/'
              ? // homepage
                ''
              : asPath.startsWith('/?')
                ? // homepage with search params (remove just slash)
                  asPath.slice(1)
                : // other pages
                  asPath
          }`,
        image = `https://og-image.the-guild.dev/?product=${websiteName}&title=${encodeURI(
          pageTitle,
        )}`,
      } = frontMatter;

      const title = `${pageTitle} (${websiteName})`;

      return (
        <>
          <title>{title}</title>
          <meta property="og:title" content={title} />
          {/* We can't use React.Fragment https://nextjs.org/docs/pages/api-reference/components/head#use-minimal-nesting */}
          {description && [
            <meta key={0} name="description" content={description} />,
            <meta key={1} property="og:description" content={description} />,
          ]}
          {canonical && [
            <link key={3} rel="canonical" href={canonical} />,
            <meta key={4} property="og:url" content={canonical} />,
          ]}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="https://the-guild.dev" />
          <meta name="twitter:creator" content="@TheGuildDev" />

          <meta property="og:type" content={type} />
          <meta property="og:site_name" content={websiteName} />
          <meta property="og:image" content={image} />
          <meta property="og:image:alt" content={pageTitle} />

          <meta content={websiteName} name="apple-mobile-web-app-title" />
          <meta content={websiteName} name="application-name" />
          <meta name="robots" content="index,follow" />
        </>
      );
    },
    logoLink: false,
    logo: getNavbarLogo(logo, websiteName, description),
    navbar: {
      extraContent: <ThemeSwitcherButton />,
      ...(logo && { component: props => <Navbar items={addGuildCompanyMenu(props.items)} /> }),
    },
    ...config,
    components: {
      ...mdxComponents,
      ...config.components,
    },
  };
}

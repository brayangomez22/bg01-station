import { SITE } from './seo.config';

interface SeoProps {
  title: string;
  description: string;
  /** Path only, e.g. "/missions". Used for canonical + og:url. */
  path?: string;
  /** Optional structured data (JSON-LD) object. */
  jsonLd?: Record<string, unknown>;
  /** Keep the page out of search indexes (e.g. the control center). */
  noindex?: boolean;
}

/**
 * Renders per-page metadata. Relies on React 19's native support for
 * hoisting <title>/<meta>/<link> rendered anywhere in the tree into <head>.
 * No external head-management dependency needed.
 */
export function Seo({ title, description, path, jsonLd, noindex }: SeoProps) {
  const url = path ? `${SITE.url}${path}` : SITE.url;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <link rel="canonical" href={url} />
      )}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={SITE.ogImage} />

      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {jsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </>
  );
}

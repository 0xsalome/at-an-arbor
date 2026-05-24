/**
 * Match Astro content collection slugs for local markdown filenames.
 *
 * Astro lowercases ASCII letters and normalizes whitespace to hyphens while
 * preserving non-Latin characters. Keeping this helper shared prevents React
 * pages, RSS, sitemap, and announcement links from drifting from Astro routes.
 */
export function contentSlugFromPath(filePath) {
  const filename = filePath.split(/[\\/]/).pop() || '';
  return filename
    .replace(/\.md$/i, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
}

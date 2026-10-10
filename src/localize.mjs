// Translate the generated static page, including accessible names and metadata.
// Exact normalized phrases keep markup and shared assets intact. Missing English
// translations fail the build so future Russian additions cannot go unnoticed.
const cyrillic = /[А-Яа-яЁё]/;
const escapeHTML = (value) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );

export function englishPage(html, translations) {
  function translate(value) {
    if (!cyrillic.test(value)) return value;
    const key = value.trim().replace(/\s+/g, " ");
    if (!Object.hasOwn(translations, key)) {
      throw new Error(`Missing English translation: ${key}`);
    }
    const leading = value.match(/^\s*/)[0];
    const trailing = value.match(/\s*$/)[0];
    return leading + escapeHTML(translations[key]) + trailing;
  }
  return html
    .replace(/(<[^>]+>)|([^<]+)/g, (token, tag, text) =>
      tag
        ? tag.replace(/="([^"]*)"/g, (_, value) => `="${translate(value)}"`)
        : translate(text),
    )
    .replace('<html lang="ru">', '<html lang="en">')
    .replace(
      'property="og:locale" content="ru_RU"',
      'property="og:locale" content="en_US"',
    )
    .replace(
      'rel="canonical" href="https://ivangruuu.github.io/"',
      'rel="canonical" href="https://ivangruuu.github.io/en.html"',
    )
    .replace(
      'property="og:url" content="https://ivangruuu.github.io/"',
      'property="og:url" content="https://ivangruuu.github.io/en.html"',
    )
    .replace(
      'lang="ru" hreflang="ru" aria-current="page"',
      'lang="ru" hreflang="ru"',
    )
    .replace(
      'lang="en" hreflang="en">EN',
      'lang="en" hreflang="en" aria-current="page">EN',
    );
}

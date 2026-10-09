# Videory

Static agency website using HTML, CSS, and browser JavaScript.

Upload the website files in this repository to any static hosting folder. Exclude README.md and Git metadata. You can also open index.html locally. No Python, Node.js, npm, build step, database or application server is required. Keep assets and vendor alongside index.html. Media/font formats and licenses are preserved.

Edit index.html for content, styles.css/editorial.css for global styling, services.css for services, and work-carousel.js for portfolio motion.

SEO included: descriptive title and description, language, mobile viewport, semantic headings, content in HTML, image alternatives, index/follow directive, robots.txt, Organization structured data and social sharing text. All portfolio categories are available with JavaScript disabled.

When the final domain is connected:
1. Use public HTTPS hosting without a login and choose one preferred domain.
2. Add an absolute canonical link, og:url, og:image and twitter:image to index.html with that domain. assets/studio.webp can be the sharing image. Change twitter:card to summary_large_image when an image URL is set.
3. Create sitemap.xml with the homepage's absolute canonical URL. This is a one-page site; section hashes are not separate sitemap pages. Add its absolute URL as Sitemap: in robots.txt at the domain root and submit it in Google Search Console.
4. Add the confirmed website URL and absolute logo URL to Organization JSON-LD.
5. Replace the pending email and phone placeholders with real details.

Domain-specific URLs and sitemap are intentionally deferred to avoid pointing a new domain at the old restricted site. Existing hosting/access settings are unchanged. Indexing and ranking are not guaranteed.

Reference: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics

// src/pages/TagPage.js
import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';

// helper slug -> display mapping (we'll map from window.__SITE_TAGS__ dynamically)
const slugToTag = (slug) => {
  if (typeof window === 'undefined' || !Array.isArray(window.__SITE_TAGS__)) return null;
  const tags = window.__SITE_TAGS__;
  const find = tags.find(t => {
    const s = t.toString().normalize('NFKD').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
    return s === slug;
  });
  return find || null;
};

const TagPage = () => {
  const { slug } = useParams();

  const tag = useMemo(() => slugToTag(slug), [slug]);

  useEffect(() => {
    const title = tag ? `${tag} — Omsurl` : 'Tags — Omsurl';
    document.title = title;

    const desc = tag
      ? `Learn about ${tag} and how Omsurl provides features like this — short links, tracking, custom domains, and more.`
      : 'Tag listing for Omsurl - URL shortener and link management';

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);

    // optional: set og:title / og:description tags similarly (not required)
  }, [tag]);

  if (!tag) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Tag not found</h1>
        <p>We couldn't find that tag. Browse popular tags:</p>
        <ul>
          {(window.__SITE_TAGS__ || []).slice(0, 20).map((t, i) => (
            <li key={i}><Link to={`/tags/${t.toString().normalize('NFKD').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-')}`}>{t}</Link></li>
          ))}
        </ul>
      </div>
    );
  }

  // You should replace this placeholder content with real content for each tag.
  return (
    <main style={{ padding: 24 }}>
      <h1>{tag}</h1>
      <p>
        This page is a dedicated landing page for <strong>{tag}</strong>. Add helpful info here:
        features, examples, screenshots, how-to guides, comparisons, and links to related pages.
      </p>

      <section style={{ marginTop: 20 }}>
        <h2>How Omsurl helps with {tag}</h2>
        <p>Describe the functionality you provide for this tag. For example: short link creation, UTM parameter support, password-protected links, QR-code generation, analytics, custom domains, and more.</p>
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>Related topics</h3>
        <ul>
          {(window.__SITE_TAGS__ || []).slice(0, 10).map((t, i) => (
            <li key={i}><Link to={`/tags/${t.toString().normalize('NFKD').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-')}`}>{t}</Link></li>
          ))}
        </ul>
      </section>
    </main>
  );
};

export default TagPage;
import React, { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'music.album' | 'music.song' | 'profile';
  schemaData?: Record<string, any>;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalPath = '/',
  ogImage = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
  ogType = 'website',
  schemaData,
}) => {
  useEffect(() => {
    // Document title
    const fullTitle = `${title} | Anthony BeastMode`;
    document.title = fullTitle;

    // Update standard meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMeta('description', description);
    updateMeta('og:title', fullTitle, true);
    updateMeta('og:description', description, true);
    updateMeta('og:type', ogType, true);
    updateMeta('og:image', ogImage, true);
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', fullTitle);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + canonicalPath;

    // Structured Data JSON-LD
    let scriptTag = document.getElementById('seo-json-ld');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'seo-json-ld';
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }

    const defaultArtistSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          '@id': `${window.location.origin}/#artist`,
          name: 'Anthony BeastMode',
          jobTitle: 'Independent Recording Artist',
          homeLocation: {
            '@type': 'Place',
            name: 'Missouri, USA',
          },
          url: window.location.origin,
          sameAs: [
            'https://open.spotify.com/artist/anthony-beastmode',
            'https://music.apple.com/us/artist/anthony-beastmode',
          ],
        },
        ...(schemaData ? [schemaData] : []),
      ],
    };

    scriptTag.textContent = JSON.stringify(defaultArtistSchema);
  }, [title, description, canonicalPath, ogImage, ogType, schemaData]);

  return null;
};

import React from 'react';
import Head from 'next/head';
import { useSelector } from 'react-redux';

const MetaData = ({
  // Basic SEO
  title = process.env.NEXT_PUBLIC_META_TITLE,
  description = process.env.NEXT_PUBLIC_META_DESCRIPTION,
  keywords = process.env.NEXT_PUBLIC_META_KEYWORDS,
  author = process.env.NEXT_PUBLIC_APP_NAME,
  language = 'en',
  pageName = '',
  
  // Open Graph / Facebook
  ogTitle = title,
  ogDescription = description,
  ogImage = '/favicon.ico',
  ogUrl = `${process.env.NEXT_PUBLIC_WEB_URL}${pageName}`,
  siteName = process.env.NEXT_PUBLIC_META_TITLE,
  
  // Twitter
  twitterCard = 'summary_large_image',
  twitterTitle = ogTitle,
  twitterDescription = ogDescription,
  twitterImage = ogImage,
  twitterSite = `@${process.env.NEXT_PUBLIC_META_TITLE}`,
  twitterCreator = `@${process.env.NEXT_PUBLIC_META_TITLE}`,
  
  // Additional SEO
  canonicalUrl = ogUrl,
  robots = 'index, follow',
  themeColor = '#000000',
  
  // Structured Data
  structuredData = null,
  
  // PWA
  manifestUrl = '/manifest.json',
  appleTouchIcon = '/apple-touch-icon.png',
  favicon = null, // Custom favicon from SEO settings
}) => {
  const settingsData = useSelector((state) => state?.settingsData?.settings?.web_settings);
  
  // Use custom favicon from SEO settings if available, fallback to web settings favicon, then default
  const webFavicon = favicon || (settingsData?.web_favicon ? settingsData?.web_favicon : '/favicon.ico');

  // Parse structured data if it's a string
  const parsedStructuredData = typeof structuredData === 'string' ? JSON.parse(structuredData) : structuredData;

  return (
    <Head>
      {/* Basic SEO */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={robots} />
      <meta name="language" content={language} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle} />
      <meta name="twitter:description" content={twitterDescription} />
      <meta name="twitter:image" content={twitterImage} />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:creator" content={twitterCreator} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Theme Color */}
      <meta name="theme-color" content={themeColor} />
      
      {/* PWA */}
      <link rel="manifest" href={manifestUrl} />
      <link rel="apple-touch-icon" href={appleTouchIcon} />
      <link rel="icon" href={webFavicon} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={title} />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      
      {/* Structured Data */}
      {parsedStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(parsedStructuredData) }}
          key="structured-data"
        />
      )}
    </Head>
  );
};

export default MetaData;

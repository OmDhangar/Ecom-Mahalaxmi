// components/SEO.js
import React from "react";
import { Helmet } from "react-helmet-async";

const SEO = ({ title, description, image, url }) => {
  const defaultTitle = "Shri Mahalaxmi Mobile - Latest Smartphones & Accessories";
  const defaultDescription = "Browse and buy the latest mobiles, accessories, and offers at Shri Mahalaxmi Mobile.";
  const defaultImage = "/default-thumbnail.jpg";
  const defaultUrl = "https://shrimahalaxmimobile.in";

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title || defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <link rel="canonical" href={url || defaultUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:url" content={url || defaultUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
    </Helmet>
  );
};

export default SEO;

// components/SEO.js
import React from "react";
import { Helmet } from "react-helmet-async";

const SEO = ({ 
  title, 
  description, 
  image, 
  url,
  keywords = "mobile phones, smartphones, mobile accessories, phone cases, chargers, earphones, Shri Mahalaxmi Mobile"
}) => {
  const defaultTitle = "Shri Mahalaxmi Mobile - Shirpur, Maharashtra";
  const defaultLocation = "Shirpur, Maharashtra";
  const defaultAddress = "Shri Mahalaxmi Mobile,Gujarathi Complex, Near Kanaiya Hotel, Main Road, Bhoi Lane Shirpur, Maharashtra";



  const defaultDescription = "Discover the latest mobiles, accessories, and exclusive offers at Shri Mahalaxmi Mobile, owned by Bhushan Rajput in Shirpur. We provide a wide range of smartphones, cases, chargers, and gadgets at competitive prices with trusted service.";
  const defaultImage = "/fav.png";
  const defaultUrl = "https://shrimahalaxmimobile.in";
  const defaultKeywords = "mobile phones, smartphones, mobile accessories, phone cases, chargers, earphones, Shri Mahalaxmi Mobile, best mobile shop";

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title || defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <link rel="canonical" href={url || defaultUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:url" content={url || defaultUrl} />
      <meta property="og:site_name" content="Shri Mahalaxmi Mobile" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
      
      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Shri Mahalaxmi Mobile" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </Helmet>
  );
};

export default SEO;

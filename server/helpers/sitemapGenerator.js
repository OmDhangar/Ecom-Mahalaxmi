const { SitemapStream, streamToPromise } = require("sitemap");
const Product = require("../models/Product");

let sitemap;

async function generateSitemap(req) {
  const baseUrl = "https://shrimahalaxmimobile.in"; // Always production domain

  try {
    const smStream = new SitemapStream({ hostname: baseUrl });

    // ✅ Public static routes (only SEO-friendly ones)
    const staticRoutes = [
      { url: "/", changefreq: "daily", priority: 1.0 },
      { url: "/home", changefreq: "daily", priority: 0.9 },
      { url: "/listing", changefreq: "daily", priority: 0.8 },
      { url: "/search", changefreq: "weekly", priority: 0.7 },
      { url: "/shop/home", changefreq: "daily", priority: 0.9 },
      { url: "/shop/listing", changefreq: "daily", priority: 0.8 },
      { url: "/shop/search", changefreq: "weekly", priority: 0.7 },

      // ✅ New static SEO pages
      { url: "/about", changefreq: "monthly", priority: 0.6 },
      { url: "/privacy-policy", changefreq: "yearly", priority: 0.3 },
      { url: "/return-policy", changefreq: "yearly", priority: 0.3 },
      { url: "/terms", changefreq: "yearly", priority: 0.3 },
      { url: "/contact", changefreq: "monthly", priority: 0.5 },
      { url: "/order-success", changefreq: "monthly", priority: 0.4 },
    ];

    staticRoutes.forEach((route) => smStream.write(route));

    // ✅ Dynamic product routes
    const products = await Product.find({ isActive: true }).select(
      "_id updatedAt"
    );

    products.forEach((product) => {
      smStream.write({
        url: `/product/${product._id}`,
        changefreq: "weekly",
        priority: 0.6,
        lastmod: product.updatedAt,
      });
    });

    smStream.end();

    const data = await streamToPromise(smStream);
    sitemap = data.toString();
    return sitemap;
  } catch (error) {
    console.error("Sitemap generation error:", error);
    throw error;
  }
}

module.exports = { generateSitemap };

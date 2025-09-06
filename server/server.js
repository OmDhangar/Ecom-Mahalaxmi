const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const compression = require("compression");
const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const shippingCalculation = require("./routes/shop/shipping-routes");
const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const adminCarouselRouter = require('./routes/admin/carousel-routes');
const shopCarouselRouter = require('./routes/shop/carousel-routes');
const commonFeatureRouter = require("./routes/common/feature-routes");
const sitemapRouter = require('./routes/Google/sitemap-routes');


//create a database connection -> u can also
//create a separate file for this and then import/use that file here

mongoose
  .connect(`${process.env.MONGO_URI}/ecommerce`)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

const app = express();
const PORT = process.env.PORT || 5000;

// Enable GZIP compression for all text-based responses
app.use(compression({
  level: 6, // Compression level (1-9)
  threshold: 1024, // Only compress files larger than 1KB
  filter: (req, res) => {
    // Don't compress if the request includes a no-transform cache header
    if (req.headers['cache-control'] && req.headers['cache-control'].includes('no-transform')) {
      return false;
    }
    // Use the default filter function to determine if compression should be used
    return compression.filter(req, res);
  }
}));

app.use(
cors({
  origin: "https://shrimahalaxmimobile.in",   
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH","OPTIONS","HEAD"], 

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cache-Control",
    "Expires",
    "Pragma",
  ],
  credentials: true,  
})
);

app.use(cookieParser());
app.use(express.json());

// Serve static files with long-term caching
app.use(express.static('public', {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Different cache strategies for different file types
    if (path.endsWith('.html')) {
      // HTML files - short cache to ensure updates are picked up
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
    } else if (path.match(/\.(js|css)$/)) {
      // JS/CSS files - long cache with versioning
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
    } else if (path.match(/\.(png|jpg|jpeg|gif|ico|svg|webp)$/)) {
      // Image files - long cache
      res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
    } else if (path.match(/\.(woff|woff2|ttf|eot)$/)) {
      // Font files - very long cache
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
    }
  }
}));
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);

app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use('/api/admin/carousel', adminCarouselRouter);
app.use('/api/shop/carousel', shopCarouselRouter);
app.use('/api',shippingCalculation);

app.use("/api/common/feature", commonFeatureRouter);

app.use('/', sitemapRouter);

app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));

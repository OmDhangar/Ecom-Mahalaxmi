const express = require('express');
const router = express.Router();
const { generateSitemap } = require('../../helpers/sitemapGenerator');

let cachedSitemap = null;

router.get('/sitemap.xml', async (req, res) => {
    try {
        if (!cachedSitemap) {
            cachedSitemap = await generateSitemap();
        }
        res.header('Content-Type', 'application/xml');
        res.send(cachedSitemap);
    } catch (err) {
        res.status(500).end();
    }
});

module.exports = router;

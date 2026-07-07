const Product = require("../models/Product");
const Page = require("../models/Page");

const getSitemap = async (req, res) => {
  try {
    const SITE_URL = process.env.FRONTEND_URL || "http://localhost:3000";

    const products = await Product.find({}).select("slug _id updatedAt").lean();

    const pages = await Page.find({
      status: "active",
    })
      .select("slug updatedAt")
      .lean();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Home
    xml += `
  <url>
    <loc>${SITE_URL}</loc>
  </url>`;

    // Pages
    pages.forEach((page) => {
      xml += `
  <url>
    <loc>${SITE_URL}/${page.slug}</loc>
    <lastmod>${new Date(page.updatedAt).toISOString()}</lastmod>
  </url>`;
    });

    // Products
    products.forEach((product) => {
      xml += `
  <url>
    <loc>${SITE_URL}/products/${product.slug || product._id}</loc>
    <lastmod>${new Date(product.updatedAt).toISOString()}</lastmod>
  </url>`;
    });

    xml += `
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    console.error(err);
    res.status(500).send("Sitemap generation failed");
  }
};

module.exports = {
  getSitemap,
};

const dotenv = require("dotenv");
const express = require("express");
const connectDB = require("./src/config/db");
const { limiter, authLimiter } = require("./src/middlewares/rateLimiter");
const cors = require("cors");
const { errorHandler } = require("./src/middlewares/errorMiddleware");
const authRoutes = require("./src/routes/authRoutes");
const settingRoutes = require("./src/routes/settingRoutes");
const userRoutes = require("./src/routes/userRoutes");
const pageRoutes = require("./src/routes/pageRoutes");
const navbarRoutes = require("./src/routes/navbarRoutes");
const footerRoutes = require("./src/routes/footerRoutes");
const brandRoutes = require("./src/routes/brandRoutes");
const typeRoutes = require("./src/routes/typeRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const subcategoryRoutes = require("./src/routes/subcategoryRoutes");
const productLabelRoutes = require("./src/routes/productLabelRoutes");
const productRoutes = require("./src/routes/productRoutes");
const couponRoutes = require("./src/routes/couponRoutes");
const warehouseRoutes = require("./src/routes/warehouseRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const wishlistRoutes = require("./src/routes/wishlistRoutes");
const contactUsRoutes = require("./src/routes/contactUsRoutes");
const customerReviewRoutes = require("./src/routes/customerReviewRoutes");
const uploadsRoutes = require("./src/routes/upload");
const storeRoutes = require("./src/routes/storeRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const resultsRoutes = require("./src/routes/resultsRoutes");
const emailsRoutes = require("./src/routes/emailRoutes");
const sliderRoutes = require("./src/routes/sliderRoutes");
const systemsettingRoutes = require("./src/routes/systemsettingRoutes");
const webhookRoutes = require("./src/routes/webhookRoutes");
const aboutpageRoutes = require("./src/routes/aboutpageRoutes");
const helmet = require("helmet");

dotenv.config();
connectDB();

const app = express();

const ALLOWED_ORIGINS = (process.env.ADMIN_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`❌ CORS blocked: ${origin}`);
      callback(new Error(`CORS: Origin not allowed: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "http://localhost:5000",
          "https://your-production-url.com",
        ],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: [
          "'self'",
          "http://localhost:5000",
          "https://your-production-url.com",
        ],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(express.json());
app.use("/api", limiter);
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=86400, immutable"); //86400 1 day cache store karses
    next();
  },
  express.static("uploads"),
);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/navbar", navbarRoutes);
app.use("/api/footer", footerRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/types", typeRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/product-labels", productLabelRoutes);
app.use("/api/products", productRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/wishlists", wishlistRoutes);
app.use("/api/contact-us", contactUsRoutes);
app.use("/api/customer-reviews", customerReviewRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/results", resultsRoutes);
app.use("/api/emails", emailsRoutes);
app.use("/api/slider", sliderRoutes);
app.use("/api/system-setting", systemsettingRoutes);
app.use("/api/aboutpage", aboutpageRoutes);
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.get("/sitemap.xml", async (req, res) => {
  const products = await Product.find().select("_id updatedAt").lean();

  const pages = await Page.find({
    status: "active",
  }).select("slug updatedAt");

  const SITE_URL = process.env.FRONTEND_URL || "http://localhost:3000";

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  pages.forEach((page) => {
    xml += `
      <url>
        <loc>${SITE_URL}/${page.slug}</loc>
      </url>`;
  });

  products.forEach((product) => {
    xml += `
      <url>
        <loc>${SITE_URL}/products/${product._id}</loc>
      </url>`;
  });

  xml += `</urlset>`;

  res.header("Content-Type", "application/xml");
  res.send(xml);
});
app.use(errorHandler);

const path = require("path");
const fs = require("fs");
const Page = require("./src/models/Page");
const Product = require("./src/models/Product");

// ═══════════════════════════════════════════════════════
// REACT BUILD SERVE + DYNAMIC SEO META INJECT
// ═══════════════════════════════════════════════════════
const BRAND = "Unity Clinic";
const IMAGE_URL = (process.env.IMAGE_BASE_URL || "").replace(/\/$/, "");
const FRONTEND_BUILD = path.join(__dirname, "build");

const ROUTE_SLUG_MAP = {
  "/": "/home",
  "/home": "home",
  "/about": "about",
  "/contact-us": "contact-us",
  "/faqs": "faqs",
  "/offer": "offer",
  "/privacy": "privacy",
  "/refund-policy": "refund-policy",
  "/term-service": "term-service",
  "/shipping-policy": "shipping-policy",
  "/allproducts": "allproducts",
  "/results": "result",
};

// HTML ma meta tags inject karo
function injectMeta(html, { title, description, image, url } = {}) {
  const fullTitle = title ? `${BRAND} | ${title}` : BRAND;
  const desc = (description || "").replace(/"/g, "&quot;").substring(0, 200);
  const img = image || "";

  const tags = `
    <title>${fullTitle}</title>
    <meta name="description" content="${desc}" />
    <meta property="og:title" content="${fullTitle}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:type" content="website" />
    ${img ? `<meta property="og:image" content="${img}" />` : ""}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${fullTitle}" />
    <meta name="twitter:description" content="${desc}" />
    ${img ? `<meta name="twitter:image" content="${img}" />` : ""}
  `;

  return html
    .replace(/<title>.*?<\/title>/s, "")
    .replace("</head>", `${tags}\n</head>`);
}

function buildImageUrl(imgPath) {
  if (!imgPath) return "";

  if (imgPath.startsWith("http")) {
    return imgPath;
  }

  return `${IMAGE_URL}/${imgPath.replace(/^\/+/, "")}`;
}

if (fs.existsSync(FRONTEND_BUILD)) {
  app.use(express.static(FRONTEND_BUILD));

  app.use(async (req, res) => {
    const htmlPath = path.join(FRONTEND_BUILD, "index.html");

    if (!fs.existsSync(htmlPath)) {
      return res
        .status(404)
        .send("Frontend build not found. Run: npm run build");
    }

    let html = fs.readFileSync(htmlPath, "utf-8");
    const pathname = req.path.toLowerCase().replace(/\/$/, "") || "/";

    try {
      if (pathname.startsWith("/products/")) {
        const productId = pathname.split("/products/")[1];

        const product = await Product.findById(productId)
          .select("name description images")
          .lean();

        if (product) {
          html = injectMeta(html, {
            title: product.name,
            description: product.description,
            image: buildImageUrl(product.images?.[0]),
            url: `https://unityclinic.in/products/${productId}`,
          });
        }
        return res.send(html);
      }

      const slug = ROUTE_SLUG_MAP[pathname];

      if (slug) {
        const page = await Page.findOne({ slug, status: "active" }).lean();

        if (page) {
          html = injectMeta(html, {
            title: page.meta_title,
            description: page.meta_description,
            image: buildImageUrl(page.seo_image),
            url: `https://unityclinic.in${pathname}`,
          });
        }
      }
    } catch (err) {
      console.error("SEO meta inject error:", err.message);
    }

    res.send(html);
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

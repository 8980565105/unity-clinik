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
const fabricRoutes = require("./src/routes/fabricRoutes");
const discountRoutes = require("./src/routes/discountRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const subcategoryRoutes = require("./src/routes/subcategoryRoutes");
const productLabelRoutes = require("./src/routes/productLabelRoutes");
const productRoutes = require("./src/routes/productRoutes");
const productVariantRoutes = require("./src/routes/productVariantRoutes");
const couponRoutes = require("./src/routes/couponRoutes");
const warehouseRoutes = require("./src/routes/warehouseRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const wishlistRoutes = require("./src/routes/wishlistRoutes");
const contactUsRoutes = require("./src/routes/contactUsRoutes");
const customerReviewRoutes = require("./src/routes/customerReviewRoutes");
const colorRoutes = require("./src/routes/colorRoutes");
const sizeRoutes = require("./src/routes/sizeRoutes");
const uploadsRoutes = require("./src/routes/upload");
const storeRoutes = require("./src/routes/storeRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const faqs = require("./src/routes/faqsRoute");
const helmet = require("helmet");

const mongoose = require("mongoose");
const { off } = require("pdfkit");

dotenv.config();
connectDB();

const app = express();

const ADMIN_ORIGINS = (process.env.ADMIN_ORIGINS || "http://localhost:8080")
  .split(",")
  .map((o) => o.trim());

let allowedOriginsCache = [];
let cacheTime = 0;
const CACHE_TTL = 60 * 1000;

const getAllowedOrigins = async () => {
  const now = Date.now();
  if (allowedOriginsCache.length > 0 && now - cacheTime < CACHE_TTL) {
    return allowedOriginsCache;
  }

  try {
    const Store = require("./src/models/Store");
    const stores = await Store.find({ status: "active" })
      .select("domain website")
      .lean();

    const storeOrigins = [];
    stores.forEach((store) => {
      if (store.domain) {
        const d = store.domain.trim();
        if (d.startsWith("http")) {
          storeOrigins.push(d);
        } else {
          storeOrigins.push(`http://${d}`);
        }
      }
      if (store.website) {
        storeOrigins.push(store.website.trim());
      }
    });

    allowedOriginsCache = [...new Set([...ADMIN_ORIGINS, ...storeOrigins])];
    cacheTime = now;

    console.log("✅ CORS allowed origins updated:", allowedOriginsCache);
    return allowedOriginsCache;
  } catch (err) {
    console.error("CORS origin fetch error:", err.message);
    return ADMIN_ORIGINS;
  }
};

app.use(
  cors({
    origin: async function (origin, callback) {
      if (!origin) return callback(null, true);
      try {
        const allowed = await getAllowedOrigins();
        if (allowed.includes(origin)) {
          callback(null, true);
        } else {
          console.warn(`❌ CORS blocked: ${origin}`);
          callback(new Error(`CORS: Origin not allowed: ${origin}`));
        }
      } catch (err) {
        callback(err);
      }
    },
    credentials: true,
  }),
);

// Helmet તમારા HTTP હેડર્સને સિક્યોર કરે છે, જેથી હેકર્સ સહેલાઈથી જાણી ન શકે કે તમે કઈ ટેકનોલોજી વાપરો છો.

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
// app.use("/api/", limiter);
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes, authLimiter);
app.use("/api/settings", settingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/navbar", navbarRoutes);
app.use("/api/footer", footerRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/types", typeRoutes);
app.use("/api/fabrics", fabricRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/product-labels", productLabelRoutes);
app.use("/api/products", productRoutes);
app.use("/api/products/:product_id/variants", productVariantRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/wishlists", wishlistRoutes);
app.use("/api/contact-us", contactUsRoutes);
app.use("/api/customer-reviews", customerReviewRoutes);
app.use("/api/colors", colorRoutes);
app.use("/api/sizes", sizeRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/faqs", faqs);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

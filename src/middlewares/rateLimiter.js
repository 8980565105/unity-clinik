// middlewares/rateLimiter.js
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 મિનિટનો સમય
  max: 100, // દરેક IP માટે 10 મિનિટમાં વધુમાં વધુ 100 રિક્વેસ્ટ
  skip: (req) => {
    const ip = req.ip;

    return (
      ip === "127.0.0.1" || // localhost
      ip === "::1"  // ipv6 localhost
    ); //aa ip ma limit nay ave local ma
  },

  message: {
    status: 429,
    message: "Too many requests, try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many login attempts." },
});

module.exports = { limiter, authLimiter };

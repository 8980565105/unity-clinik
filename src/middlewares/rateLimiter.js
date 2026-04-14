// middlewares/rateLimiter.js
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 મિનિટનો સમય
  max: 100, // દરેક IP માટે 10 મિનિટમાં વધુમાં વધુ 100 રિક્વેસ્ટ
  skip: (req) => req.ip === "127.0.0.1",
  skip: (req) => {
    req.ip === "localhost:3030";
  },
  message: {
    status: 429,
    message: "Too many requests, try again later.",
  },
  standardHeaders: true, // Rate limit info ને `RateLimit-*` હેડર્સમાં બતાવશે
  legacyHeaders: false, // `X-RateLimit-*` હેડર્સને બંધ કરશે
});

// Auth routes માટે strict limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Login attempts limit
  message: { success: false, message: "Too many login attempts." },
});

module.exports = { limiter, authLimiter };

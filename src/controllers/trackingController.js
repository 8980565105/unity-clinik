const PageVisit = require("../models/PageVisit");
const { parseUserAgent, getClientIp } = require("../utils/deviceInfo");
const { sendResponse } = require("../utils/response");

const trackPageVisit = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return sendResponse(res, false, null, "Unauthorized");

    const { page_url, page_title = "", referrer = "" } = req.body;
    if (!page_url) return sendResponse(res, false, null, "page_url required");

    const ip = getClientIp(req);
    const { type, os, browser } = parseUserAgent(req.headers["user-agent"]);

    await PageVisit.create({
      user_id: userId,
      page_url,
      page_title,
      referrer,
      device: { type, os, browser, ip },
    });

    return sendResponse(res, true, null, "Page visit tracked");
  } catch (err) {
    return sendResponse(res, false, null, "Failed to track: " + err.message);
  }
};

module.exports = { trackPageVisit };

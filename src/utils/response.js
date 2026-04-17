/**
 * Standardized API response
 * @param {object} res - Express response object
 * @param {boolean} success - success or failure
 * @param {any} data - data to send
 * @param {string} message - message to send
 */
const sendResponse = (res, success, data = null, message = "") => {
  res.json({ success, data, message });
};

module.exports = { sendResponse };

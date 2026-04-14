const Store = require("../models/Store");

const domainCache = {};

/**
 * Domain string thhi Store._id return kare.
 * Localhost development mate port sathe match kare.
 * Production mate www. hatave ane lowercase kare.
 *
 * @param {string} rawDomain  - req.headers.host ya origin thhi aavtu domain (with port)
 * @returns {string|null}     - store._id string, or null if not found
 */
const resolveStoreByDomain = async (rawDomain) => {
  if (!rawDomain) return null;

  let domain;
  const isLocalhost = rawDomain.includes("localhost");

  if (isLocalhost) {
    domain = rawDomain.toLowerCase().trim();
  } else {
    domain = rawDomain.replace(/^www\./i, "").toLowerCase().trim();
  }

  if (domainCache[domain]) return domainCache[domain];

  const store = await Store.findOne({ domain }).select("_id").lean();
  if (store) {
    domainCache[domain] = store._id.toString();
    return domainCache[domain];
  }

  return null;
};

/**
 * Cache clear karo (e.g. store domain update thay tyare)
 * @param {string} domain
 */
const clearDomainCache = (domain) => {
  if (domain) {
    const isLocalhost = domain.includes("localhost");
    const clean = isLocalhost
      ? domain.toLowerCase().trim()
      : domain.replace(/^www\./i, "").toLowerCase().trim();
    delete domainCache[clean];
  }
};

module.exports = { resolveStoreByDomain, clearDomainCache };
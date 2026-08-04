const Page = require("../models/Page");
const { sendResponse } = require("../utils/response");

// ─────────────────────────────────────────────────────────
// Helper: Role based store filter
// ─────────────────────────────────────────────────────────
const buildStoreFilter = () => ({});

// ═══════════════════════════════════════════════════════
// GET /pages
// ═══════════════════════════════════════════════════════
const getPages = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      status,
      isDownload = "false",
    } = req.query;

    const download = isDownload.toLowerCase() === "true";
    page = parseInt(page);
    limit = parseInt(limit);

    const query = { ...buildStoreFilter(req) };

    if (search) query.page_name = { $regex: search, $options: "i" };
    if (status && ["active", "inactive"].includes(status)) {
      query.status = status;
    }

    if (download) {
      const pages = await Page.find(query).sort({ order: 1 });
      return sendResponse(res, true, { pages }, "All pages for download");
    }

    const total = await Page.countDocuments(query);
    const pages = await Page.find(query)
      .sort({ order: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    sendResponse(res, true, {
      pages,
      total,
      page,
      pagesCount: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════
// GET /pages/get/:slug — Public
// ═══════════════════════════════════════════════════════
const getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) return sendResponse(res, false, null, "Slug is required");

    const query = { slug, status: "active" };
    const page = await Page.findOne(query);

    if (!page) {
      return sendResponse(res, false, null, "Page not found");
    }

    if (page.slug === "home") {
      page.home_sections.sort((a, b) => a.order - b.order);
    }
    sendResponse(res, true, page, "Page retrieved by slug");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════
// GET /pages/:id
// ═══════════════════════════════════════════════════════
const getPageById = async (req, res) => {
  try {
    const filter = { _id: req.params.id, ...buildStoreFilter(req) };
    const page = await Page.findOne(filter);
    if (!page) return sendResponse(res, false, null, "Page not found");
    sendResponse(res, true, page, "Page retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════
// POST /pages — Create
// ═══════════════════════════════════════════════════════
const createPage = async (req, res) => {
  try {
    const data = { ...req.body };

    if (!data.slug && data.page_name) {
      data.slug = data.page_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }

    const existing = await Page.findOne({
      slug: data.slug,
    });

    if (existing) {
      return sendResponse(
        res,
        false,
        null,
        `Page with slug "${data.slug}" already exists.`,
      );
    }

    if (Array.isArray(data.sections)) {
      data.sections = data.sections.filter(
        (sec) =>
          sec.title?.trim() ||
          sec.description?.trim() ||
          sec.image_url?.trim() ||
          sec.background_image_url?.trim() ||
          (Array.isArray(sec.slides) && sec.slides.length > 0),
      );
    }
    if (data.slug === "home" && Array.isArray(data.home_sections)) {
      data.home_sections = data.home_sections.map((item, index) => ({
        ...item,
        order: index + 1,
      }));
    }
    const page = new Page(data);
    const saved = await page.save();
    sendResponse(res, true, saved, "Page created successfully");
  } catch (err) {
    if (err.code === 11000) {
      return sendResponse(
        res,
        false,
        null,
        `Page with slug "${err.keyValue?.slug}" already exists in your store. Please use a different page name.`,
      );
    }
    sendResponse(res, false, null, err.message || "Failed to create page");
  }
};

// ═══════════════════════════════════════════════════════
// PUT /pages/:id — Update
// ═══════════════════════════════════════════════════════
const updatePage = async (req, res) => {
  try {
    const data = { ...req.body };
    delete data.slug;
    const filter = { _id: req.params.id, ...buildStoreFilter(req) };

    if (data.slug) {
      const duplicate = await Page.findOne({
        slug: data.slug,
        _id: { $ne: req.params.id },
      });

      if (duplicate) {
        return sendResponse(
          res,
          false,
          null,
          `Page with slug "${data.slug}" already exists.`,
        );
      }
    }

    if (Array.isArray(data.sections)) {
      data.sections = data.sections.filter(
        (sec) =>
          sec.title?.trim() ||
          sec.description?.trim() ||
          sec.image_url?.trim() ||
          sec.background_image_url?.trim() ||
          (Array.isArray(sec.slides) && sec.slides.length > 0),
      );
    }

    const page = await Page.findById(req.params.id);

    if (page && page.slug === "home" && Array.isArray(data.home_sections)) {
      data.home_sections = data.home_sections.map((item, index) => ({
        ...item,
        order: index + 1,
      }));
    }

    const updated = await Page.findOneAndUpdate(filter, data, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!updated) return sendResponse(res, false, null, "Page not found");
    sendResponse(res, true, updated, "Page updated successfully");
  } catch (err) {
    if (err.code === 11000) {
      return sendResponse(
        res,
        false,
        null,
        `Page with this slug already exists in your store. Please use a different page name.`,
      );
    }
    sendResponse(res, false, null, err.message || "Failed to update page");
  }
};

// ═══════════════════════════════════════════════════════
// PUT /pages/:id/status
// ═══════════════════════════════════════════════════════
const updatePageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "inactive"].includes(status)) {
      return sendResponse(res, false, null, "Invalid status");
    }

    const filter = { _id: req.params.id, ...buildStoreFilter(req) };
    const page = await Page.findOneAndUpdate(
      filter,
      { status },
      {
        returnDocument: "after",
      },
    );
    if (!page) return sendResponse(res, false, null, "Page not found");

    sendResponse(res, true, page, "Status updated");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════
// DELETE /pages/:id
// ═══════════════════════════════════════════════════════
const deletePage = async (req, res) => {
  try {
    const filter = { _id: req.params.id, ...buildStoreFilter(req) };
    const deleted = await Page.findOneAndDelete(filter);
    if (!deleted) return sendResponse(res, false, null, "Page not found");
    sendResponse(res, true, null, "Page deleted");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════
// POST /pages/bulk-delete
// ═══════════════════════════════════════════════════════
const bulkDeletePages = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    const filter = {
      _id: { $in: ids },
      ...buildStoreFilter(req),
    };

    const result = await Page.deleteMany(filter);
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Pages deleted",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getPages,
  getPageById,
  getPageBySlug,
  createPage,
  updatePage,
  updatePageStatus,
  deletePage,
  bulkDeletePages,
};

const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

router.post("/image", upload.array("image", 20), (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const data = files.map((file) => ({
      image_url: `/uploads/${file.filename}`,
      url: `/uploads/${file.filename}`,
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// ---------- LOCAL VERSION (jya tame local /uploads ma save karo cho) ----------
router.post("/image-from-url", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, message: "URL required" });
    }

    // Basic validation - link valid image hovi joiye
    let response;
    try {
      response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 15000,
        maxContentLength: 50 * 1024 * 1024, // 50MB limit
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Could not fetch image from this URL",
      });
    }

    const contentType = response.headers["content-type"] || "";
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
    ];

    if (!allowedTypes.some((t) => contentType.includes(t.split("/")[1]))) {
      return res.status(400).json({
        success: false,
        message: "URL does not point to a valid image (jpg/png/webp/avif/gif)",
      });
    }

    const buffer = Buffer.from(response.data);

    // sharp thi compress + webp ma convert (existing middleware ni jem)
    const sharp = require("sharp");
    const uploadPath = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadPath))
      fs.mkdirSync(uploadPath, { recursive: true });

    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const outputPath = path.join(uploadPath, uniqueName + ".webp");

    await sharp(buffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    const filename = uniqueName + ".webp";

    res.json({
      success: true,
      data: {
        image_url: `/uploads/${filename}`,
        url: `/uploads/${filename}`,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/video", upload.single("video"), (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }
    res.json({
      success: true,
      data: {
        video_url: `/uploads/${req.file.filename}`,
        url: `/uploads/${req.file.filename}`,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

//  aa je comment se e cloudnary ma uplod karvu hoy tyare

// const express = require("express");
// const router = express.Router();
// const upload = require("../middlewares/upload");
// const cloudinary = require("../config/cloudinary");

// router.post("/image", upload.array("image", 20), (req, res) => {
//   try {
//     const files = req.files;
//     if (!files || files.length === 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "No file uploaded" });
//     }

//     const data = files.map((file) => ({
//       image_url: file.path,
//       url: file.path,
//       public_id: file.filename,
//     }));

//     res.json({ success: true, data });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// router.post("/video", upload.single("video"), (req, res) => {
//   try {
//     if (!req.file) {
//       return res
//         .status(400)
//         .json({ success: false, message: "No file uploaded" });
//     }

//     res.json({
//       success: true,
//       data: {
//         video_url: req.file.path,
//         url: req.file.path,
//         public_id: req.file.filename,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// router.delete("/delete", async (req, res) => {
//   try {
//     const { public_id, resource_type = "image" } = req.body;

//     if (!public_id) {
//       return res
//         .status(400)
//         .json({ success: false, message: "public_id required" });
//     }

//     await cloudinary.uploader.destroy(public_id, { resource_type });

//     res.json({ success: true, message: "Deleted from Cloudinary" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// router.delete("/delete-many", async (req, res) => {
//   try {
//     const { public_ids, resource_type = "image" } = req.body;

//     if (!public_ids || !Array.isArray(public_ids) || public_ids.length === 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "public_ids array required" });
//     }

//     await Promise.all(
//       public_ids.map((id) =>
//         cloudinary.uploader.destroy(id, { resource_type }),
//       ),
//     );

//     res.json({ success: true, message: `${public_ids.length} files deleted` });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // link mate se aa

// router.post("/image-from-url", async (req, res) => {
//   try {
//     const { url } = req.body;

//     if (!url) {
//       return res.status(400).json({ success: false, message: "URL required" });
//     }

//     // Cloudinary directly remote URL thi upload kari sake che - download karવાની jarur nathi!
//     const result = await cloudinary.uploader.upload(url, {
//       folder: "ecom/images",
//       resource_type: "image",
//       transformation: [
//         { width: 1920, crop: "limit" },
//         { quality: "auto" },
//         { fetch_format: "webp" },
//       ],
//     });

//     res.json({
//       success: true,
//       data: {
//         image_url: result.secure_url,
//         url: result.secure_url,
//         public_id: result.public_id,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Invalid image URL or upload failed: " + err.message,
//     });
//   }
// });

// module.exports = router;

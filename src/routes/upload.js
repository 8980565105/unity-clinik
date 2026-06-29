
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");

// ✅ single ની જગ્યાએ array — max 20 files
router.post("/image", upload.array("image", 20), (req, res) => {
  try {
    const files = req.files; // ← array હશે
    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    // ✅ બધી files નો URL return કરો
    const data = files.map((file) => ({
      image_url: `/uploads/${file.filename}`,
      url: `/uploads/${file.filename}`,
    }));

    res.json({ success: true, data }); // ← array of objects
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

// module.exports = router;

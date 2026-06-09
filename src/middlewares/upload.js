// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// const uploadPath = path.join(process.cwd(), "uploads");
// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     cb(null, file.fieldname + "-" + uniqueSuffix + ext);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowed = ["image/jpeg", "image/png", "image/webp"];
//   if (allowed.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only JPEG, PNG and WEBP files are allowed"));
//   }
// };

// const baseUpload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 },
// });

// const upload = {
//   single: (fieldName) => baseUpload.single(fieldName),
//   fields: (fieldsArray) => baseUpload.fields(fieldsArray),
// };

// module.exports = upload;

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImages = ["image/jpeg", "image/png", "image/webp"];
  const allowedVideos = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "video/x-msvideo",
  ];

  if (
    allowedImages.includes(file.mimetype) ||
    allowedVideos.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPEG, PNG, WEBP images and MP4, WEBM, OGG, MOV videos are allowed",
      ),
    );
  }
};

const limits = (req, file, cb) => {
  const isVideo = file.mimetype.startsWith("video/");
  return isVideo
    ? { fileSize: 10 * 1024 * 1024 }
    : { fileSize: 5 * 1024 * 1024 };
};

const baseUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const upload = {
  single: (fieldName) => baseUpload.single(fieldName),
  fields: (fieldsArray) => baseUpload.fields(fieldsArray),
};

module.exports = upload;

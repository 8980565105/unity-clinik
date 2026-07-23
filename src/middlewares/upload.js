const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegStatic);

const uploadPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedImages = ["image/jpeg", "image/png", "image/webp", "image/avif"];
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

const baseUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

async function compressImage(buffer, mimetype) {
  const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const outputPath = path.join(uploadPath, uniqueName + ".webp");
  await sharp(buffer)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);
  return outputPath;
}

function compressVideo(buffer, originalname) {
  return new Promise((resolve, reject) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const inputPath = path.join(
      uploadPath,
      "temp_" + uniqueName + path.extname(originalname),
    );
    const outputPath = path.join(uploadPath, uniqueName + ".mp4");
    fs.writeFileSync(inputPath, buffer);
    ffmpeg(inputPath)
      .output(outputPath)
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions(["-crf 28", "-preset fast", "-vf scale=1280:-2"])
      .on("end", () => {
        fs.unlinkSync(inputPath);
        resolve(outputPath);
      })
      .on("error", (err) => {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        reject(err);
      })
      .run();
  });
}

async function compressAfterUpload(req, res, next) {
  try {
    const files = [];
    if (req.file) {
      files.push(req.file);
    } else if (req.files) {
      if (Array.isArray(req.files)) {
        files.push(...req.files);
      } else {
        Object.values(req.files).forEach((arr) => files.push(...arr));
      }
    }

    await Promise.all(
      files.map(async (file) => {
        let savedPath;
        if (file.mimetype.startsWith("image/")) {
          savedPath = await compressImage(file.buffer, file.mimetype);
        } else if (file.mimetype.startsWith("video/")) {
          savedPath = await compressVideo(file.buffer, file.originalname);
        }
        file.path = savedPath;
        file.filename = path.basename(savedPath);
      }),
    );

    next();
  } catch (err) {
    next(err);
  }
}

const upload = {
  single: (fieldName) => [baseUpload.single(fieldName), compressAfterUpload],

  array: (fieldName, maxCount) => [
    baseUpload.array(fieldName, maxCount),
    compressAfterUpload,
  ],
  fields: (fieldsArray) => [
    baseUpload.fields(fieldsArray),
    compressAfterUpload,
  ],
};

module.exports = upload;

// aaa cloudnary mata uplod karvu hoy tyare

// const multer = require("multer");
// const cloudinary = require("../config/cloudinary");
// const streamifier = require("streamifier");

// const allowedImages = ["image/jpeg", "image/png", "image/webp", "image/avif"];
// const allowedVideos = [
//   "video/mp4",
//   "video/webm",
//   "video/ogg",
//   "video/quicktime",
//   "video/x-msvideo",
// ];

// const fileFilter = (req, file, cb) => {
//   if (
//     allowedImages.includes(file.mimetype) ||
//     allowedVideos.includes(file.mimetype)
//   ) {
//     cb(null, true);
//   } else {
//     cb(
//       new Error(
//         "Only JPEG, PNG, WEBP, AVIF images and MP4, WEBM, OGG, MOV, AVI videos are allowed",
//       ),
//     );
//   }
// };

// const baseUpload = multer({
//   storage: multer.memoryStorage(),
//   fileFilter,
//   limits: { fileSize: 100 * 1024 * 1024 },
// });

// function uploadToCloudinary(file) {
//   return new Promise((resolve, reject) => {
//     const isVideo = file.mimetype.startsWith("video/");

//     const uploadOptions = isVideo
//       ? {
//           folder: "ecom/videos",
//           resource_type: "video",
//           eager: [{ width: 1280, crop: "limit", quality: "auto" }],
//           eager_async: true,
//         }
//       : {
//           folder: "ecom/images",
//           resource_type: "image",
//           transformation: [
//             { width: 1920, crop: "limit" },
//             { quality: "auto" },
//             { fetch_format: "webp" },
//           ],
//         };

//     const uploadStream = cloudinary.uploader.upload_stream(
//       uploadOptions,
//       (error, result) => {
//         if (error) return reject(error);
//         file.cloudinary = result;
//         file.filename = result.public_id;
//         file.path = result.secure_url;
//         resolve(result);
//       },
//     );

//     streamifier.createReadStream(file.buffer).pipe(uploadStream);
//   });
// }

// async function uploadToCloudinaryMiddleware(req, res, next) {
//   try {
//     const files = [];
//     if (req.file) {
//       files.push(req.file);
//     } else if (req.files) {
//       if (Array.isArray(req.files)) {
//         files.push(...req.files);
//       } else {
//         Object.values(req.files).forEach((arr) => files.push(...arr));
//       }
//     }
//     if (files.length === 0) return next();
//     await Promise.all(files.map((f) => uploadToCloudinary(f)));
//     next();
//   } catch (err) {
//     next(err);
//   }
// }

// const upload = {
//   single: (fieldName) => [
//     baseUpload.single(fieldName),
//     uploadToCloudinaryMiddleware,
//   ],
//   array: (fieldName, maxCount) => [
//     baseUpload.array(fieldName, maxCount),
//     uploadToCloudinaryMiddleware,
//   ],
//   fields: (fieldsArray) => [
//     baseUpload.fields(fieldsArray),
//     uploadToCloudinaryMiddleware,
//   ],
// };

// module.exports = upload;

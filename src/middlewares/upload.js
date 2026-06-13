const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");

if (process.platform === "win32") {
  ffmpeg.setFfmpegPath(
    "C:\\Users\\LENOVO\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.1-full_build\\bin\\ffmpeg.exe",
  );
}

const uploadPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.memoryStorage();

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
      Object.values(req.files).forEach((arr) => files.push(...arr));
    }

    for (const file of files) {
      let savedPath;

      if (file.mimetype.startsWith("image/")) {
        savedPath = await compressImage(file.buffer, file.mimetype);
      } else if (file.mimetype.startsWith("video/")) {
        savedPath = await compressVideo(file.buffer, file.originalname);
      }

      file.path = savedPath;
      file.filename = path.basename(savedPath);
    }

    next();
  } catch (err) {
    next(err);
  }
}

const upload = {
  single: (fieldName) => [baseUpload.single(fieldName), compressAfterUpload],
  fields: (fieldsArray) => [
    baseUpload.fields(fieldsArray),
    compressAfterUpload,
  ],
};

module.exports = upload;

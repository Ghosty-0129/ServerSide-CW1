const multer = require("multer");
const path   = require("path");
const crypto = require("crypto");

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB   = 5;

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads", "profiles"),
  filename: (req, file, cb) => {
    const ext    = path.extname(file.originalname).toLowerCase();
    const random = crypto.randomBytes(12).toString("hex");
    cb(null, `${req.user.userId}_${random}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG and WebP images are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 }
});

module.exports = upload;

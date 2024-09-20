const multer = require("multer");
const path = require("path");
const fs = require("fs");

const MAX_SIZE = 2 * 1024 * 1024; // Max file size: 2MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads");

  
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
    return cb(
      new Error("Only .jpg, .jpeg, and .png formats are allowed!"),
      false
    );
  }
  cb(null, true);
};

const uploadSingle = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
}).single("image");

module.exports = { uploadSingle };

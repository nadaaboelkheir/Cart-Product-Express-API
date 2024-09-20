const multer = require("multer");
const path = require("path");

const MAX_SIZE = 1 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
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

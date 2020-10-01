const path = require("path");
const multer = require("multer");
const { uploadImage } = require("../controllers/image");
const router = require("express").Router();

const MAX_FILE_SIZE = 1024 * 1024 * 30;

// Directories
const POST_IMAGES_DIR = "../../../public/uploads/posts/";

// Storages
const POST_IMAGES_STORAGE = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, POST_IMAGES_DIR));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const MULTER_POST_IMAGE = multer({
  storage: POST_IMAGES_STORAGE,
  limits: { fileSize: MAX_FILE_SIZE },
});

// upload callbacks
var uploadImageForPost = MULTER_POST_IMAGE.single("image");

// upload routes
router.post("/post", async (req, res) => {
  uploadImageForPost(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).json({
        status: "failed",
        message: "Max file size is 2 MB",
        error: err,
      });
    } else if (err) {
      return res.status(500).json({
        status: "failed",
        message: "Unable to upload image",
        error: err,
      });
      // An unknown error occurred when uploading.
    }
    uploadImage(req, res, "uploads/categories");
  });
});
module.exports = router;

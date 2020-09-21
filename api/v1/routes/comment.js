const router = require("express").Router();
const {
  validateAccessToken,
  checkAccessToken,
  checkUserAccess,
} = require("../middlewares/auth");
const { internalServerError } = require("../utils/response");
const { newComment } = require("../controllers/comment");

router.post(
  "/",
  checkAccessToken,
  validateAccessToken,
  checkUserAccess,
  async (req, res) => {
    try {
      await newComment(req, res);
    } catch (error) {
      internalServerError(res, error);
    }
  }
);

module.exports = router;

const router = require("express").Router();
const {
  validateAccessToken,
  checkAccessToken,
  checkUserAccess,
} = require("../middlewares/auth");
const { internalServerError } = require("../utils/response");
const { newStory, getStoryFeed } = require("../controllers/story");

router.post(
  "/",
  checkAccessToken,
  validateAccessToken,
  checkUserAccess,
  async (req, res) => {
    try {
      await newStory(req, res);
    } catch (error) {
      internalServerError(res, error);
    }
  }
);

router.get(
  "/",
  checkAccessToken,
  validateAccessToken,
  checkUserAccess,
  async (req, res) => {
    try {
      await getStoryFeed(req, res);
    } catch (error) {
      internalServerError(res, error);
    }
  }
);

module.exports = router;

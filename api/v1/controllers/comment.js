const Comment = require("../models/comment");
const { SUCCESS } = require("../utils/constants").successMessages;
const { FAILED } = require("../utils/constants").errors;

module.exports.newComment = async (req, res) => {
  const newComment = new Comment({
    comment: req.body.comment,
    userId: req.tokenData.authId,
    postId: req.body.postId,
  });

  await newComment.save((err, saved) => {
    if (err)
      return res.status(403).json({
        status: FAILED,
        message: "Failed to post comment",
      });

    return res.status(201).json({
      status: SUCCESS,
      message: "Comment posted",
      comment: saved,
    });
  });
};

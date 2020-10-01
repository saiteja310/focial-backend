const Comment = require("../models/comment");
const { SUCCESS } = require("../utils/constants").successMessages;
const { FAILED } = require("../utils/constants").errors;
const mongoose = require("mongoose");
const { addCommentOnPost } = require("../controllers/notification");
const { getAuthorIdOfPost } = require("../controllers/post");

module.exports.newComment = async (req, res) => {
  const newComment = new Comment({
    comment: req.body.comment,
    userId: req.tokenData.authId,
    postId: req.body.postId,
  });

  await newComment.save(async (err, saved) => {
    if (err)
      return res.status(403).json({
        status: FAILED,
        message: "Failed to post comment",
      });

    res.status(201).json({
      status: SUCCESS,
      message: "Comment posted",
      comment: saved,
    });
    const targetUser = await getAuthorIdOfPost(req.body.postId);
    if (targetUser)
      await addCommentOnPost(req.tokenData.authId, targetUser, req.body.postId);
  });
};

module.exports.getComments = async (req, res) => {
  const postId = req.params.id;
  const comments = await Comment.aggregate([
    { $match: { postId: mongoose.Types.ObjectId(postId) } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "userId",
        as: "user",
      },
    },
    {
      $project: {
        postId: 1,
        comment: 1,
        createdAt: 1,
        "user.username": 1,
        "user.photoUrl": 1,
      },
    },
  ]);

  return res.status(200).json({
    status: SUCCESS,
    message: "Fetched comments",
    comments: comments,
  });
};

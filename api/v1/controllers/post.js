const Post = require("../models/post");
const { SUCCESS } = require("../utils/constants").successMessages;
const { FAILED } = require("../utils/constants").errors;

module.exports.newPost = async (req, res) => {
  if (!req.body.caption)
    return res.status(400).json({
      status: FAILED,
      message: "Caption must not be null",
    });

  if (!req.body.images || req.body.images.length < 1) {
    _newPost(req, res, 0);
  } else {
    _newPost(req, res, 1);
  }
  // return res.status(400).json({
  //   status: FAILED,
  //   message: "Images must not be null",
  // });
};

async function _newPost(req, res, type) {
  const post = new Post({
    type: type,
    userId: req.tokenData.authId,
    caption: req.body.caption,
    images: req.body.images,
  });
  await post.save((error, saved) => {
    if (error)
      return res.status(403).json({
        status: FAILED,
        message: "Post failed",
      });

    return res.status(200).json({
      status: SUCCESS,
      message: "Post completed",
      postId: saved._id,
    });
  });
}

module.exports.getMyPosts = async (req, res) => {
  const posts = await Post.find(
    { userId: req.tokenData.authId },
    { __v: 0, updatedAt: 0, createdAt: 0, reach: 0 }
  ).sort({
    createdAt: -1,
  });
  return res.status(200).json({
    status: SUCCESS,
    message: "Fetched posts",
    posts: posts,
  });
};

module.exports.uploadPostImage = async (req, res) => {
  res.status(200).json({
    status: SUCCESS,
    message: "Uploaded photo",
    url: "uploads/posts/" + req.file.filename,
  });
};

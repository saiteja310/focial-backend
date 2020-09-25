const Post = require("../models/post");
const { SUCCESS } = require("../utils/constants").successMessages;
const { FAILED } = require("../utils/constants").errors;
const { getFollowingList } = require("../controllers/user");
const { addLikeOnPost } = require("../controllers/notification");

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
  var user = await getFollowingList(req.tokenData.authId);
  // console.log(user.following);
  user.following.push(user.userId);

  const postsRaw = await Post.aggregate([
    {
      $match: { userId: { $in: user.following } },
    },
    {
      $project: {
        likes: {
          $size: "$likes",
        },
        liked: {
          $cond: {
            if: { $in: [user.userId, "$likes"] },
            then: true,
            else: false,
          },
        },
        type: 1,
        userId: 1,
        caption: 1,
        images: 1,
        createdAt: 1,
      },
    },
  ]);
  const posts = await Post.populate(postsRaw, {
    path: "user",
    select: { username: 1, photoUrl: 1, _id: 0 },
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

module.exports.likePost = async (req, res) => {
  await Post.update(
    { _id: req.body.postId },
    { $addToSet: { likes: req.tokenData.authId } },
    async (err, updated) => {
      if (err)
        return res.status(403).json({
          status: FAILED,
          message: "failed to post like",
        });
      console.log(updated);
      res.status(200).json({
        status: SUCCESS,
        message: "Post liked successfully",
      });
      const authorId = await getAuthorIdOfPost(req.body.postId);
      if (authorId)
        await addLikeOnPost(req.tokenData.authId, authorId, req.body.postId);
    }
  );
};

module.exports.dislikePost = async (req, res) => {
  await Post.update(
    { _id: req.body.postId },
    { $pull: { likes: req.tokenData.authId } },
    (err, updated) => {
      if (err)
        return res.status(403).json({
          status: FAILED,
          message: "failed to remove like",
        });
      console.log(updated);
      return res.status(200).json({
        status: SUCCESS,
        message: "Post disliked successfully",
      });
    }
  );
};

async function getAuthorIdOfPost(postId) {
  const post = await Post.findById(postId, { userId: 1 });
  if (!post) return false;
  return post.userId;
}

module.exports.getAuthorIdOfPost = getAuthorIdOfPost;

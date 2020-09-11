const Story = require("../models/story");
const { getAuthUserWithProjection } = require("./auth");
const { FAILED, TRY_LATER } = require("../utils/constants").errors;
const { SUCCESS } = require("../utils/constants").successMessages;
const { joinWithCommaSpace } = require("../../../core/helpers");
const { getFollowingList } = require("../controllers/user");

module.exports.newStory = async (req, res) => {
  const user = await getAuthUserWithProjection(req.tokenData.authId, {
    _id: 1,
  });
  const story = new Story({
    userId: user._id,
    type: 0,
    text: req.body.text,
    textStyle: req.body.textStyle,
    gradient: req.body.gradient,
  });

  await story.save(async (error, savedStory) => {
    if (savedStory)
      return res.status(200).json({
        status: SUCCESS,
        message: "Story posted",
        storyId: savedStory._id,
      });

    // Print the error and sent back failed response
    console.log(error);
    return res.status(403).json({
      status: FAILED,
      message: joinWithCommaSpace("Story posting failed", TRY_LATER),
    });
  });
};

module.exports.getStoryFeed = async (req, res) => {
  var user = await getFollowingList(req.tokenData.authId);
  user.following.push(user.userId);

  const storiesFeed = await Story.aggregate([
    { $match: { userId: { $in: user.following } } },
    {
      $group: {
        _id: "$userId",
        stories: {
          $push: {
            storyId: "$_id",
            type: "$type",
            text: "$text",
            textStyle: "$textStyle",
            gradient: "$gradient",
            createdAt: "$createdAt",
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "userId",
        as: "user",
      },
    },
    {
      $project: {
        stories: 1,
        username: {
          $arrayElemAt: ["$user.username", 0],
        },
        photoUrl: {
          $arrayElemAt: ["$user.photoUrl", 0],
        },
      },
    },
  ]);

  //  const storiesFeed = await Story.find({ userId: user.following });
  return res.status(200).json({
    status: SUCCESS,
    message: "Fetched stories",
    storyFeed: storiesFeed,
  });
};

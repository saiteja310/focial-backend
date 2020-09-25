const mongoose = require("mongoose");
const { schema } = require("./user");
const {
  POST_COLLECTION,
  COMMENT_COLLECTION,
  USER_COLLECTION,
} = require("../utils/constants").collections;

const postSchema = new mongoose.Schema(
  {
    /*
      0 - Text
      1 - Image
      // not required for now
      2 - Video
    **/
    type: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // ref: USER_COLLECTION,
      // refPath: "users",
      // path: "userId",
    },
    // single text field for image, text and video posts
    caption: {
      type: String,
      maxlength: 1024,
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    reach: {
      type: [String],
      default: [],
    },
    comments: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: COMMENT_COLLECTION,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
  }
);

postSchema.virtual("user", {
  ref: USER_COLLECTION,
  localField: "userId",
  foreignField: "userId",
  justOne: true, // for many-to-1 relationships
});

module.exports = mongoose.model(POST_COLLECTION, postSchema);

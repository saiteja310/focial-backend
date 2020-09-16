const mongoose = require("mongoose");
const { POST_COLLECTION } = require("../utils/constants").collections;

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
  },
  { timestamps: true }
);

module.exports = mongoose.model(POST_COLLECTION, postSchema);

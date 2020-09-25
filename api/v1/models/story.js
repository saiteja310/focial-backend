const mongoose = require("mongoose");
const { STORY_COLLECTION } = require("../utils/constants").collections;

const tokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  /*
    0 - Text
    1 - Image
    2 - Video
  **/
  type: {
    type: Number,
    required: true,
  },
  text: String,
  textStyle: Number,
  gradient: Number,
  views: {
    type: Array,
    default: [],
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 60 * 60 * 24,
  },
});

module.exports = mongoose.model(STORY_COLLECTION, tokenSchema);

import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  profile_pic: { type: Number, default: 0 },
  nums_length_username: { type: Number, default: 0 },
  fullname_words: { type: Number, default: 0 },
  nums_length_fullname: { type: Number, default: 0 },
  name_equals_username: { type: Number, default: 0 },
  description_length: { type: Number, default: 0 },
  external_URL: { type: Number, default: 0 },
  private: { type: Number, default: 0 },
  posts: { type: Number, default: 0 },
  followers: { type: Number, default: 0 },
  follows: { type: Number, default: 0 }, 
  riskScore: { type: Number, default: 0 },
  isFake: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Profile", profileSchema);

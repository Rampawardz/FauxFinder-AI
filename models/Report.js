import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile", required: true },
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, required: true },
  severity: { type: String, enum: ["low", "medium", "high"], default: "low" },
  status: { type: String, enum: ["open", "closed"], default: "open" }
}, { timestamps: true });

export default mongoose.model("Report", reportSchema);

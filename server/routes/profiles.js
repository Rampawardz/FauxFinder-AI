import express from "express";
import Profile from "../models/Profile.js";
import authMiddleware from "../middleware/authMiddleware.js";
import runPrediction from "../ml/predictor.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ createdAt: -1 });
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const profile = new Profile(req.body);
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/predict", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    const result = await runPrediction(profile);
    profile.riskScore = result.riskScore;
    profile.isFake = result.isFake;
    await profile.save();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/analyze", authMiddleware, async (req, res) => {
  try {
    const profileData = req.body;
    const result = await runPrediction(profileData);
    res.json(result);
  } catch (err) {
    console.error("❌ Prediction error:", err);
    res.status(500).json({ error: "Prediction failed" });
  }
});

export default router;

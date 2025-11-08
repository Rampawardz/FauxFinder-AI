import express from "express";
import Report from "../models/Report.js";
import Profile from "../models/Profile.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

export default (io) => {
  router.get("/", authMiddleware, async (req, res) => {
    try {
      const reports = await Report.find()
        .populate("profileId", "handle")
        .populate("reporterId", "username");
      res.json(reports);
    } catch (err) {
      console.error("❌ Error fetching reports:", err);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  router.post("/", authMiddleware, async (req, res) => {
    try {
      const { profileId, reason, severity } = req.body;
      if (!profileId || !reason) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const report = new Report({
        profileId,
        reporterId: req.user.id,
        reason,
        severity,
      });
      await report.save();
      const profile = await Profile.findById(profileId);
      const alertData = {
        reportId: report._id,
        profileId,
        reason,
        severity,
        riskScore: profile?.riskScore || null,
        createdAt: report.createdAt,
      };
      console.log("📢 Emitting alert:new event:", alertData);
      io.emit("alert:new", alertData);
      res.status(201).json(report);
    } catch (err) {
      console.error("❌ Error creating report:", err);
      res.status(500).json({ error: "Failed to create report" });
    }
  });

  return router;
};

import express from "express";
import multer from "multer";
import JobApplication from "../models/jobApplicationModel.js";

const router = express.Router();
const upload = multer({ dest: "uploads/resumes/" });

// POST — submit application
router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const { name, email, phone, position, message } = req.body;

    const newApp = new JobApplication({
      name,
      email,
      phone,
      position,
      message,
      resumePath: req.file ? req.file.path : null,
    });

    await newApp.save();
    res.status(201).json({ message: "Application submitted successfully!" });
  } catch (error) {
    console.error("Job application error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET — for admin panel
router.get("/", async (req, res) => {
  try {
    const applications = await JobApplication.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

export default router;

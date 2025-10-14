import express from "express";
import Faq from "../models/faqModel.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// ✅ Public: Get all FAQs (no auth)
router.get("/", async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ createdAt: -1 });
    res.json({ faqs });
  } catch (err) {
    console.error("Error fetching FAQs:", err);
    res.status(500).json({ message: "Error fetching FAQs" });
  }
});

// ✅ Admin: Add FAQ
router.post("/", adminAuthMiddleware, async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ message: "Question and answer are required" });
    }

    const faq = new Faq({ question, answer });
    await faq.save();

    res.status(201).json({ faq, message: "FAQ created successfully" });
  } catch (err) {
    console.error("Error creating FAQ:", err);
    res.status(500).json({ message: "Error creating FAQ" });
  }
});

// ✅ Admin: Update FAQ
router.put("/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { question, answer } = req.body;
    const updatedFaq = await Faq.findByIdAndUpdate(
      req.params.id,
      { question, answer },
      { new: true }
    );

    if (!updatedFaq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.json({ faq: updatedFaq, message: "FAQ updated successfully" });
  } catch (err) {
    console.error("Error updating FAQ:", err);
    res.status(500).json({ message: "Error updating FAQ" });
  }
});

// ✅ Admin: Delete FAQ
router.delete("/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const deletedFaq = await Faq.findByIdAndDelete(req.params.id);
    if (!deletedFaq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.json({ message: "FAQ deleted successfully" });
  } catch (err) {
    console.error("Error deleting FAQ:", err);
    res.status(500).json({ message: "Error deleting FAQ" });
  }
});

export default router;

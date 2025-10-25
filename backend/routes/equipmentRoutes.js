import express from "express";
import Equipment from "../models/equipmentModel.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// ✅ GET all equipment
router.get("/", adminAuthMiddleware, async (req, res) => {
  try {
    const equipment = await Equipment.find().sort({ createdAt: -1 });
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ CREATE new equipment
router.post("/", adminAuthMiddleware, async (req, res) => {
  try {
    const newEquip = await Equipment.create(req.body);
    res.json(newEquip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ UPDATE equipment
router.put("/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const updatedEquip = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedEquip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ DELETE equipment
router.delete("/:id", adminAuthMiddleware, async (req, res) => {
  try {
    await Equipment.findByIdAndDelete(req.params.id);
    res.json({ message: "Equipment removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

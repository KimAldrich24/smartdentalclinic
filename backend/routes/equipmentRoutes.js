import express from "express";
import Equipment from "../models/equipmentModel.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

/* ===============================
   GET ALL EQUIPMENT
   Now populates supplier info
================================ */
router.get("/", adminAuthMiddleware, async (req, res) => {
  try {
    const equipment = await Equipment.find()
      .populate("supplier", "name phone email") // show supplier info
      .sort({ createdAt: -1 });

    res.json(equipment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ===============================
   CREATE NEW EQUIPMENT
================================ */
router.post("/", adminAuthMiddleware, async (req, res) => {
  try {
    const {
      name,
      category,
      serialNumber,
      supplier,
      location,
      status,
      lastMaintenance,
      nextMaintenance,
      notes,
    } = req.body;

    const newEquip = new Equipment({
      name,
      category,
      serialNumber,
      supplier,
      location,
      status,
      lastMaintenance,
      nextMaintenance,
      notes,
    });

    await newEquip.save();

    const populatedEquipment = await newEquip.populate("supplier", "name");

    res.json(populatedEquipment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ===============================
   UPDATE EQUIPMENT
================================ */
router.put("/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const updatedEquip = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("supplier", "name");

    res.json(updatedEquip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ===============================
   DELETE EQUIPMENT
================================ */
router.delete("/:id", adminAuthMiddleware, async (req, res) => {
  try {
    await Equipment.findByIdAndDelete(req.params.id);
    res.json({ message: "Equipment removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
import express from "express";
import Equipment from "../models/equipmentModel.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

/* ===============================
   GET ALL EQUIPMENT
   Populates supplier info
================================ */
router.get("/", adminAuthMiddleware, async (req, res) => {
  try {
    const equipment = await Equipment.find()
      .populate("supplier", "name phone email")
      .sort({ createdAt: -1 });

    res.json(equipment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch equipment" });
  }
});


/* ===============================
   CREATE NEW EQUIPMENT
================================ */
router.post("/", adminAuthMiddleware, async (req, res) => {
  try {
    const {
      name,
      type = "equipment", // ✅ NEW
      category,
      serialNumber,
      supplier,
      location,
      status,
      lastMaintenance,
      nextMaintenance,
      notes,
      capacity = 0,
      quantity = 0,
      unit = "mL",
      expirationDate
    } = req.body;

    const safeQuantity = Math.min(quantity, capacity);

    const newEquip = new Equipment({
      name,
      type, // ✅ save type
      category,
      serialNumber,
      supplier,
      location,
      status,
      lastMaintenance,
      nextMaintenance,
      notes,
      capacity,
      quantity: safeQuantity,
      unit,
      expirationDate
    });

    await newEquip.save();

    const populatedEquipment = await newEquip.populate("supplier", "name");

    res.json(populatedEquipment);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create equipment" });
  }
});


/* ===============================
   UPDATE EXISTING EQUIPMENT
================================ */
router.put("/:id", adminAuthMiddleware, async (req, res) => {
  try {

    const updateData = { ...req.body };

    // Ensure quantity never exceeds capacity
    if (updateData.capacity !== undefined && updateData.quantity !== undefined) {
      updateData.quantity = Math.min(updateData.quantity, updateData.capacity);
    } 
    else if (updateData.capacity !== undefined && updateData.quantity === undefined) {

      const existing = await Equipment.findById(req.params.id);

      if (existing) {
        updateData.quantity = Math.min(existing.quantity, updateData.capacity);
      }
    }

    const updatedEquip = await Equipment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("supplier", "name");

    res.json(updatedEquip);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update equipment" });
  }
});


/* ===============================
   DELETE EQUIPMENT
================================ */
router.delete("/:id", adminAuthMiddleware, async (req, res) => {
  try {

    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    await Equipment.findByIdAndDelete(req.params.id);

    res.json({ message: "Equipment removed successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete equipment" });
  }
});


/* ===============================
   UPDATE CONSUMABLE QUANTITY
   Example: doctor used X mL
================================ */
router.put("/:id/quantity", adminAuthMiddleware, async (req, res) => {
  try {

    const { used } = req.body;

    if (used === undefined) {
      return res.status(400).json({ message: "Used quantity required" });
    }

    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    // ✅ Only allow consumables to reduce quantity
    if (equipment.type !== "consumable") {
      return res.status(400).json({
        message: "Quantity update only allowed for consumables",
      });
    }

    // Reduce quantity but never below 0
    equipment.quantity = Math.max(equipment.quantity - used, 0);

    await equipment.save();

    res.json(equipment);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update quantity" });
  }
});

export default router;
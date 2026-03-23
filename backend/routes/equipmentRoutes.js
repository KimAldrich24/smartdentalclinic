import express from "express";
import Equipment from "../models/equipmentModel.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import { deductEquipmentBatch } from "../controllers/equipmentController.js";
import verifyToken from "../middlewares/verifyToken.js"; // make sure you have this middleware

const router = express.Router();

/* ===============================
   GET ALL EQUIPMENT
   Populates supplier info
   ✅ Accessible to any logged-in doctor or admin
================================ */
router.get("/", verifyToken, async (req, res) => {
  try {
    const equipment = await Equipment.find()
      .populate("supplier", "name phone email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      equipment
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch equipment" });
  }
});

/* ===============================
   CREATE NEW EQUIPMENT
   ✅ Admin only
================================ */
router.post("/", adminAuthMiddleware, async (req, res) => {
  try {
    const {
      name,
      type = "equipment",
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
      type,
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

    res.json({ success: true, equipment: populatedEquipment });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create equipment" });
  }
});

/* ===============================
   UPDATE EXISTING EQUIPMENT
   ✅ Admin only
================================ */
router.put("/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.capacity !== undefined && updateData.quantity !== undefined) {
      updateData.quantity = Math.min(updateData.quantity, updateData.capacity);
    } else if (updateData.capacity !== undefined && updateData.quantity === undefined) {
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

    res.json({ success: true, equipment: updatedEquip });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update equipment" });
  }
});

/* ===============================
   DELETE EQUIPMENT
   ✅ Admin only
================================ */
router.delete("/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ success: false, message: "Equipment not found" });
    }

    await Equipment.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Equipment removed successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete equipment" });
  }
});

/* ===============================
   UPDATE CONSUMABLE QUANTITY
   Example: doctor used X mL
   ✅ Admin only (you can change to verifyToken if doctors should reduce consumables)
================================ */
router.put("/:id/quantity", adminAuthMiddleware, async (req, res) => {
  try {
    const { used } = req.body;

    if (used === undefined) {
      return res.status(400).json({ success: false, message: "Used quantity required" });
    }

    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ success: false, message: "Equipment not found" });
    }

    if (equipment.type !== "consumable") {
      return res.status(400).json({ success: false, message: "Quantity update only allowed for consumables" });
    }

    equipment.quantity = Math.max(equipment.quantity - used, 0);
    await equipment.save();

    res.json({ success: true, equipment });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update quantity" });
  }
});

// // PUT /api/equipment/deduct
router.put("/deduct", verifyToken, deductEquipmentBatch);

export default router;
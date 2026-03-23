import Equipment from "../models/equipmentModel.js";

/* ===========================
   GET ALL EQUIPMENT
=========================== */
export const getEquipment = async (req, res) => {
  try {

    const equipment = await Equipment.find()
      .populate("supplier", "name phone email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      equipment
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch equipment"
    });
  }
};


/* ===========================
   CREATE NEW EQUIPMENT
=========================== */
export const createEquipment = async (req, res) => {
  try {

    const {
      name,
      type = "equipment",
      category,
      serialNumber,
      supplier,
      location,
      status,
      notes,
      capacity = 0,
      quantity = 0,
      unit = "mL",
      expirationDate
    } = req.body;

    const safeQuantity = Math.min(quantity, capacity);

    const equipment = new Equipment({
      name,
      type,
      category,
      serialNumber,
      supplier,
      location,
      status,
      notes,
      capacity,
      quantity: safeQuantity,
      unit,
      expirationDate
    });

    await equipment.save();

    const populatedEquipment = await equipment.populate(
      "supplier",
      "name"
    );

    res.json({
      success: true,
      equipment: populatedEquipment
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create equipment"
    });

  }
};


/* ===========================
   UPDATE EXISTING EQUIPMENT
=========================== */
export const updateEquipment = async (req, res) => {
  try {

    const updateData = { ...req.body };

    if (
      updateData.capacity !== undefined &&
      updateData.quantity !== undefined
    ) {
      updateData.quantity = Math.min(
        updateData.quantity,
        updateData.capacity
      );
    } 
    else if (
      updateData.capacity !== undefined &&
      updateData.quantity === undefined
    ) {

      const existing = await Equipment.findById(req.params.id);

      if (existing) {
        updateData.quantity = Math.min(
          existing.quantity,
          updateData.capacity
        );
      }

    }

    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("supplier", "name");

    res.json({
      success: true,
      equipment
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update equipment"
    });

  }
};


/* ===========================
   DELETE EQUIPMENT
=========================== */
export const deleteEquipment = async (req, res) => {
  try {

    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found"
      });
    }

    await Equipment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Equipment deleted successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete equipment"
    });

  }
};


/* ===========================
   UPDATE CONSUMABLE QUANTITY
=========================== */
export const updateQuantity = async (req, res) => {
  try {

    const { used } = req.body;

    if (used === undefined) {
      return res.status(400).json({
        success: false,
        message: "Used quantity required"
      });
    }

    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found"
      });
    }

    if (equipment.type !== "consumable") {
      return res.status(400).json({
        success: false,
        message: "Quantity update only allowed for consumables"
      });
    }

    equipment.quantity = Math.max(
      equipment.quantity - used,
      0
    );

    await equipment.save();

    res.json({
      success: true,
      equipment
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update quantity"
    });

  }
};

// controllers/equipmentController.js
export const deductEquipmentBatch = async (req, res) => {
  try {
    const { equipmentUsed } = req.body;

    if (!equipmentUsed || Object.keys(equipmentUsed).length === 0) {
      return res.status(400).json({ success: false, message: "No equipment provided" });
    }

    const updates = [];

    for (const [id, qty] of Object.entries(equipmentUsed)) {
      const eq = await Equipment.findById(id);
      if (!eq) continue;

      // Only allow deduction for consumables
      if (eq.type !== "consumable") continue;

      eq.quantity = Math.max(eq.quantity - Number(qty), 0);
      await eq.save();
      updates.push(eq);
    }

    res.json({ success: true, message: "Equipment deducted successfully", equipment: updates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to deduct equipment" });
  }
};

// PUT /api/equipment/deduct
export const deductEquipment = async (req, res) => {
  try {
    const { equipmentUsed } = req.body; // { equipmentId: quantityUsed }

    if (!equipmentUsed || Object.keys(equipmentUsed).length === 0) {
      return res.status(400).json({ success: false, message: "No equipment to deduct" });
    }

    for (const [eqId, qty] of Object.entries(equipmentUsed)) {
      const equipment = await Equipment.findById(eqId);
      if (!equipment) continue;

      // Deduct quantity, prevent negative stock
      equipment.quantity = Math.max(equipment.quantity - qty, 0);
      await equipment.save();
    }

    res.json({ success: true, message: "Equipment deducted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
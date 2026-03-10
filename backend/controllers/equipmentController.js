import Equipment from "../models/equipmentModel.js";

/* ===========================
   GET ALL EQUIPMENT
=========================== */
export const getEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find()
      .populate("supplier", "name phone email")
      .sort({ createdAt: -1 });

    res.json(equipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch equipment" });
  }
};


/* ===========================
   CREATE NEW EQUIPMENT
=========================== */
export const createEquipment = async (req, res) => {
  try {
    const {
      name,
      type = "equipment", // NEW
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

    // Prevent quantity exceeding capacity
    const safeQuantity = Math.min(quantity, capacity);

    const equipment = new Equipment({
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

    await equipment.save();

    const populatedEquipment = await equipment.populate("supplier", "name");

    res.json(populatedEquipment);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create equipment" });
  }
};


/* ===========================
   UPDATE EXISTING EQUIPMENT
=========================== */
export const updateEquipment = async (req, res) => {
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

    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("supplier", "name");

    res.json(equipment);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update equipment" });
  }
};


/* ===========================
   DELETE EQUIPMENT
=========================== */
export const deleteEquipment = async (req, res) => {
  try {

    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    await Equipment.findByIdAndDelete(req.params.id);

    res.json({ message: "Equipment deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete equipment" });
  }
};


/* ===========================
   UPDATE CONSUMABLE QUANTITY
   Example: doctor used X mL
=========================== */
export const updateQuantity = async (req, res) => {
  try {

    const { used } = req.body;

    if (used === undefined) {
      return res.status(400).json({ message: "Used quantity required" });
    }

    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    // Only allow quantity update for consumables
    if (equipment.type !== "consumable") {
      return res.status(400).json({
        message: "Quantity update only allowed for consumables",
      });
    }

    // Reduce quantity but never below 0
    equipment.quantity = Math.max(equipment.quantity - used, 0);

    await equipment.save();

    res.json(equipment);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update quantity" });
  }
};
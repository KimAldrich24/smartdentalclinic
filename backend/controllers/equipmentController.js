import Equipment from "../models/equipmentModel.js";

/* ===========================
   GET ALL EQUIPMENT
=========================== */
export const getEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find().populate("supplier");
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
    } = req.body;

    // Ensure quantity does not exceed capacity
    const safeQuantity = Math.min(quantity, capacity);

    const equipment = new Equipment({
      name,
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
    });

    await equipment.save();
    res.json(equipment);
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

    // If capacity/quantity are updated, make sure quantity <= capacity
    if (updateData.capacity !== undefined && updateData.quantity !== undefined) {
      updateData.quantity = Math.min(updateData.quantity, updateData.capacity);
    } else if (updateData.capacity !== undefined && updateData.quantity === undefined) {
      // If only capacity changes, make sure quantity <= capacity
      const existing = await Equipment.findById(req.params.id);
      if (existing) {
        updateData.quantity = Math.min(existing.quantity, updateData.capacity);
      }
    }

    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

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
    await Equipment.findByIdAndDelete(req.params.id);
    res.json({ message: "Equipment deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete equipment" });
  }
};

/* ===========================
   UPDATE CONSUMABLE QUANTITY (OPTIONAL)
   Example: doctor used X mL
=========================== */
export const updateQuantity = async (req, res) => {
  try {
    const { used } = req.body; // number of units used
    if (used === undefined) {
      return res.status(400).json({ message: "Used quantity required" });
    }

    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
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
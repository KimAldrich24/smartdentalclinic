import Equipment from "../models/equipmentModel.js";

export const getEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find().populate("supplier");
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch equipment" });
  }
};

export const createEquipment = async (req, res) => {
  try {
    const equipment = new Equipment(req.body);
    await equipment.save();
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: "Failed to create equipment" });
  }
};

export const updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: "Failed to update equipment" });
  }
};

export const deleteEquipment = async (req, res) => {
  try {
    await Equipment.findByIdAndDelete(req.params.id);
    res.json({ message: "Equipment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete equipment" });
  }
};
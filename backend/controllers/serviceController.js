import Service from "../models/serviceModel.js";

// Create service
export const addService = async (req, res) => {
  try {
    const { name, description, price, duration } = req.body;
    if (!name || !price) {
      return res.status(400).json({ success: false, message: "Name and price required" });
    }
    const service = new Service({ name, description, price, duration });
    await service.save();
    res.json({ success: true, message: "Service added successfully", service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all services
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({});
    res.json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update service
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Service.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Service not found" });
    res.json({ success: true, message: "Service updated successfully", service: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete service
export const removeService = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Service.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Service not found" });
    res.json({ success: true, message: "Service removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

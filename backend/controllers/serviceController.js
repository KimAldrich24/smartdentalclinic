import Service from "../models/serviceModel.js";

// --------------------------
// Create service (no duplicates)
// --------------------------
export const addService = async (req, res) => {
  try {
    const { name, description, price, duration } = req.body;

    // Validation
    if (!name || !price) {
      return res.status(400).json({ success: false, message: "Name and price required" });
    }

    // ✅ Check for duplicate (case-insensitive)
    const existingService = await Service.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
    if (existingService) {
      return res.status(400).json({ success: false, message: "Service with this name already exists" });
    }

    const service = new Service({ name, description, price, duration });
    await service.save();

    res.json({ success: true, message: "Service added successfully", service });
  } catch (error) {
    console.error("❌ Error adding service:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------
// Get all services
// --------------------------
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({});
    res.json({ success: true, services });
  } catch (error) {
    console.error("❌ Error fetching services:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------
// Update service (no duplicates)
// --------------------------
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Check if service exists
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });

    // ✅ Check for duplicate name (exclude current service)
    if (name) {
      const duplicate = await Service.findOne({ 
        _id: { $ne: id }, 
        name: { $regex: `^${name}$`, $options: "i" } 
      });
      if (duplicate) {
        return res.status(400).json({ success: false, message: "Another service with this name already exists" });
      }
    }

    // Update fields
    Object.assign(service, req.body);
    await service.save();

    res.json({ success: true, message: "Service updated successfully", service });
  } catch (error) {
    console.error("❌ Error updating service:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------
// Delete service
// --------------------------
export const removeService = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Service.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ success: false, message: "Service not found" });

    res.json({ success: true, message: "Service removed successfully" });
  } catch (error) {
    console.error("❌ Error deleting service:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

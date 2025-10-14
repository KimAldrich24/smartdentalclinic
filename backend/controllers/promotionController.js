// controllers/promotionController.js
import Promotion from "../models/Promotion.js";

// ADD PROMOTION
export const addPromotion = async (req, res) => {
  try {
    const { title, description, discountPercentage, startDate, endDate, serviceIds } = req.body;

    // Ensure serviceIds is always an array
    const newPromo = new Promotion({
      title,
      description,
      discountPercentage,
      startDate,
      endDate,
      serviceIds: Array.isArray(serviceIds) ? serviceIds : [],
    });

    await newPromo.save();
    res.status(201).json({ message: "Promotion added successfully", promotion: newPromo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL PROMOTIONS
export const getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find();
    res.status(200).json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE PROMOTION BY ID
export const getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await Promotion.findById(id);
    if (!promotion) return res.status(404).json({ message: "Promotion not found" });
    res.status(200).json(promotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PROMOTION
export const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, discountPercentage, startDate, endDate, isActive, serviceIds } = req.body;

    const updatedPromo = await Promotion.findByIdAndUpdate(
      id,
      {
        title,
        description,
        discountPercentage,
        startDate,
        endDate,
        isActive,
        serviceIds: Array.isArray(serviceIds) ? serviceIds : [],
      },
      { new: true }
    );

    if (!updatedPromo) return res.status(404).json({ message: "Promotion not found" });

    res.status(200).json({ message: "Promotion updated successfully", promotion: updatedPromo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE PROMOTION
export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Promotion.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Promotion not found" });
    res.status(200).json({ message: "Promotion deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD SERVICES TO PROMOTION
export const addServicesToPromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceIds } = req.body;

    if (!Array.isArray(serviceIds))
      return res.status(400).json({ message: "serviceIds must be an array" });

    const updatedPromo = await Promotion.findByIdAndUpdate(
      id,
      { serviceIds },
      { new: true }
    );

    if (!updatedPromo) return res.status(404).json({ message: "Promotion not found" });

    res.status(200).json({ message: "Services added to promotion successfully", promotion: updatedPromo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

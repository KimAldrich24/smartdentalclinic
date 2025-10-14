import Faq from "../models/faqModel.js";

// Get all FAQs
export const getFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ createdAt: -1 });
    res.json({ faqs }); // ✅ wrap in an object
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch FAQs" });
  }
};

// Admin: Add new FAQ
export const addFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const newFaq = new Faq({ question, answer });
    await newFaq.save();
    res.status(201).json({ faq: newFaq }); // ✅ wrap in an object
  } catch (err) {
    res.status(500).json({ message: "Failed to create FAQ" });
  }
};

// Admin: Update FAQ
export const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;

    const updatedFaq = await Faq.findByIdAndUpdate(
      id,
      { question, answer },
      { new: true } // return the updated doc
    );

    if (!updatedFaq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.json({ faq: updatedFaq }); // ✅ consistent response
  } catch (err) {
    res.status(500).json({ message: "Failed to update FAQ" });
  }
};

// Admin: Delete FAQ
export const deleteFaq = async (req, res) => {
  try {
    const deletedFaq = await Faq.findByIdAndDelete(req.params.id);

    if (!deletedFaq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.json({ message: "FAQ deleted", faq: deletedFaq }); // ✅ include deleted FAQ if needed
  } catch (err) {
    res.status(500).json({ message: "Failed to delete FAQ" });
  }
};

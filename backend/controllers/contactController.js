import Contact from "../models/contactModel.js";

// =============================
// ✅ Get current contact info
// =============================
export const getContact = async (req, res) => {
  try {
    // Fetch the single contact document
    let contact = await Contact.findOne();

    // 🟢 If no contact document exists, create a default one
    if (!contact) {
      contact = await Contact.create({
        phone: "",
        email: "",
        address: "",
        active: true, // default: hiring ON
        businessHours: "", // ✅ Added default
      });
      return res.json(contact);
    }

    // 🟡 If contact exists but hiring is off
    if (contact.active === false) {
      return res.json({
        phone: contact.phone,
        email: contact.email,
        address: contact.address,
        active: false,
        businessHours: contact.businessHours || "", // ✅ still return hours if needed
        message: "We are currently not hiring.",
      });
    }

    // 🟢 Return full contact info
    res.json(contact);
  } catch (error) {
    console.error("❌ Error fetching contact info:", error);
    res.status(500).json({
      message: "Error fetching contact info",
      error: error.message,
    });
  }
};

// =============================
// ✅ Update or create contact info (Admin only)
// =============================
export const updateContact = async (req, res) => {
  try {
    const { phone, email, address, active, businessHours } = req.body; // ✅ Added businessHours

    let contact = await Contact.findOne();

    // 🟢 Update existing or create new
    if (contact) {
      contact.phone = phone;
      contact.email = email;
      contact.address = address;
      contact.active = active ?? true;
      contact.businessHours = businessHours || ""; // ✅ update
      await contact.save();
    } else {
      contact = await Contact.create({
        phone,
        email,
        address,
        active: active ?? true,
        businessHours: businessHours || "", // ✅ create with hours
      });
    }

    res.json({
      message: "✅ Contact info updated successfully",
      contact,
    });
  } catch (error) {
    console.error("❌ Error updating contact info:", error);
    res.status(500).json({
      message: "Error updating contact info",
      error: error.message,
    });
  }
};

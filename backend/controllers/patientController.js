import User from "../models/User.js"; // your existing users collection

// Get all patients
export const getPatients = async (req, res) => {
  try {
    // Adjust this if you have roles; here we assume all users are patients
    const patients = await User.find({}, "-password"); // exclude password
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a patient
export const updatePatient = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, dob, gender } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (phone && !/^09\d{9}$/.test(phone)) {
    return res.status(400).json({ message: "Contact number must start with 09 and be exactly 11 digits." });
  }

  try {
    const patient = await User.findByIdAndUpdate(
      id,
      { name, email, phone, dob, gender },
      { new: true, fields: "-password" } // exclude password
    );
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a patient
export const deletePatient = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Patient not found" });
    res.json({ message: "Patient deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

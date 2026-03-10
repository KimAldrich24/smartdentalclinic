import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    category: {
      type: String, // Dental, Sterilization, X-Ray, Surgical, Medications, Anesthetic, etc.
    },

    serialNumber: {
      type: String,
      unique: true,
      sparse: true, // allows empty but keeps uniqueness
    },

    /* ===========================
       SUPPLIER CONNECTION
       Each equipment comes from a supplier
    ============================ */
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: false,
    },

    location: {
      type: String, // Example: Room 1, Operating Room, Storage
    },

    /* ===========================
       EQUIPMENT STATUS
    ============================ */
    status: {
      type: String,
      enum: ["Available", "In Use", "Under Maintenance", "Broken"],
      default: "Available",
    },

    /* ===========================
       CONSUMABLE / QUANTITY TRACKING
       For medications, anesthetics, or any consumables
    ============================ */
    capacity: {
      type: Number, // Total volume or count
      default: 0,
    },

    quantity: {
      type: Number, // Remaining volume or count
      default: 0,
    },

    unit: {
      type: String, // Example: mL, pcs, bottles
      default: "mL",
    },

    /* ===========================
       MAINTENANCE TRACKING
    ============================ */
    lastMaintenance: {
      type: Date,
    },

    nextMaintenance: {
      type: Date,
    },

    /* ===========================
       EXTRA NOTES
    ============================ */
    notes: {
      type: String,
    },
  },
  {
    timestamps: true, // automatically creates createdAt & updatedAt
  }
);

export default mongoose.model("Equipment", equipmentSchema);
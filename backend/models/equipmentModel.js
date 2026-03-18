import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema(
  {
    /* ===========================
       NAME
    ============================ */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    /* ===========================
       TYPE (NEW)
       equipment = machines/tools
       consumable = items/medications
    ============================ */
    type: {
      type: String,
      enum: ["equipment", "consumable"],
      default: "equipment",
    },

    /* ===========================
       CATEGORY
    ============================ */
    category: {
      type: String, // Dental, Sterilization, X-Ray, Surgical, Medications, Anesthetic, etc.
      trim: true,
    },

    /* ===========================
       SERIAL NUMBER
       Only for machines/tools
    ============================ */
    serialNumber: {
      type: String,
      unique: true,
      sparse: true, // allows empty but keeps uniqueness
      trim: true,
    },

    /* ===========================
       SUPPLIER CONNECTION
    ============================ */
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },

    /* ===========================
       LOCATION
    ============================ */
    location: {
      type: String, // Example: Room 1, Operating Room, Storage
      trim: true,
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
       CONSUMABLE TRACKING
       Used for medications/items
    ============================ */

    capacity: {
      type: Number, // Total amount purchased
      default: 0,
      min: 0,
    },

    quantity: {
      type: Number, // Remaining amount
      default: 0,
      min: 0,
    },

    unit: {
      type: String, // mL, pcs, box, bottles
      default: "mL",
      trim: true,
    },

    /* ===========================
       OPTIONAL: EXPIRATION DATE
       For medications/materials
    ============================ */
    expirationDate: {
      type: Date,
    },

    /* ===========================
       MAINTENANCE TRACKING
       Only used by machines
    ============================ */
    

    /* ===========================
       EXTRA NOTES
    ============================ */
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // creates createdAt & updatedAt
  }
);

export default mongoose.model("Equipment", equipmentSchema);
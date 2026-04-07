import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    contactPerson: {
      type: String,
    },

    phone: {
      type: String,
      validate: {
        validator: function (value) {
          return !value || /^09\d{9}$/.test(value);
        },
        message: "Phone number must start with 09 and be exactly 11 digits.",
      },
    },

    email: {
      type: String,
      validate: {
        validator: function (value) {
          return (
            !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          );
        },
        message: "Please enter a valid email address.",
      },
    },

    address: {
      type: String,
    },

    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Supplier", supplierSchema);
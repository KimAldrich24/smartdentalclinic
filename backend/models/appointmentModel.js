import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    // The patient: can be a child (linked via guardian)
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Who booked the appointment (could be guardian)
    bookedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: function () {
    return this.type !== "walk-in"; // ✅ only required for online bookings
  },
},

    /* ===========================
       SERVICES (Assigned by Doctor)
       Multiple services supported
    ============================ */
    services: [
      {
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    /* ===========================
       STATUS FLOW
    ============================ */
    status: {
      type: String,
      enum: [
        "PENDING_ADMIN",
        "APPROVED_ADMIN",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING_ADMIN",
    },

    /* ===========================
       PRICING
    ============================ */
    totalPrice: {
      type: Number,
      default: 0,
    },

    additionalPayment: {
      type: Number,
      default: 0,
    },

    additionalPaymentNote: {
      type: String,
    },

    /* ===========================
       PAYMENT TRACKING
    ============================ */
    paymentStatus: {
      type: String,
      enum: ["pending", "paid_cash", "paid_online"],
      default: "pending",
      set: (value) => {
        if (!value) return "pending";

        const normalized = value.toString().toLowerCase().replace(/\s+/g, "_");
        switch (normalized) {
          case "paid":
          case "paid_cash":
            return "paid_cash";
          case "paidonline":
          case "paid_online":
            return "paid_online";
          default:
            return "pending";
        }
      },
    },

    paymentProofId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentProof",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    creditAdded: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Credit",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* ===========================
   AUTO TOTAL PRICE CALCULATION
=========================== */
appointmentSchema.pre("save", function (next) {
  const servicesTotal = this.services.reduce(
    (sum, s) => sum + (s.price || 0),
    0
  );

  this.totalPrice = servicesTotal + (this.additionalPayment || 0);
  next();
});

export default mongoose.model("Appointment", appointmentSchema);
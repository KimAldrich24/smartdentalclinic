import mongoose from "mongoose";

const toothTreatmentSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor', 
    required: true 
  },
  appointmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment' 
  },
  toothNumber: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 32 
  },
  notes: { 
    type: String, 
    required: true 
  },
  treatmentDate: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

const ToothTreatment = mongoose.model("ToothTreatment", toothTreatmentSchema);
export default ToothTreatment;
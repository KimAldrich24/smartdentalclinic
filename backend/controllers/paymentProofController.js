import PaymentProof from '../models/paymentProofModel.js';
import Appointment from '../models/appointmentModel.js';

// Submit payment proof (Patient)
export const submitPaymentProof = async (req, res) => {
  try {
    const { appointmentId, referenceNumber, amount, patientName } = req.body;
    const patientId = req.user.id; // Assuming you have auth middleware

    console.log('📸 Payment proof submission:', { appointmentId, referenceNumber, amount });

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Screenshot is required' });
    }

    // Check if appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check if proof already submitted for this appointment
    const existingProof = await PaymentProof.findOne({ 
      appointmentId, 
      status: { $in: ['pending', 'approved'] } 
    });
    
    if (existingProof) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment proof already submitted for this appointment' 
      });
    }

    const paymentProof = await PaymentProof.create({
      appointmentId,
      patientId,
      patientName,
      referenceNumber,
      amount,
      screenshot: req.file.filename
    });

    console.log('✅ Payment proof submitted successfully');
    res.status(201).json({ 
      success: true, 
      message: 'Payment proof submitted successfully. Awaiting admin approval.',
      paymentProof 
    });
  } catch (err) {
    console.error('❌ Error submitting payment proof:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all payment proofs (Admin)
export const getAllPaymentProofs = async (req, res) => {
  try {
    const { status } = req.query; // Filter by status: pending, approved, rejected

    const filter = status ? { status } : {};
    
    const proofs = await PaymentProof.find(filter)
      .populate('appointmentId')
      .populate('patientId', 'name email phone')
      .sort({ submittedAt: -1 });

    res.json({ success: true, proofs });
  } catch (err) {
    console.error('❌ Error fetching payment proofs:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get payment proof by appointment ID (Patient)
export const getPaymentProofByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const proof = await PaymentProof.findOne({ appointmentId });

    if (!proof) {
      return res.status(404).json({ success: false, message: 'No payment proof found' });
    }

    res.json({ success: true, proof });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Approve payment proof (Admin)
export const approvePaymentProof = async (req, res) => {
  try {
    const { proofId } = req.params;
    const adminId = req.admin.id; // Assuming admin auth middleware

    const proof = await PaymentProof.findById(proofId);
    if (!proof) {
      return res.status(404).json({ success: false, message: 'Payment proof not found' });
    }

    // Update proof status
    proof.status = 'approved';
    proof.reviewedAt = new Date();
    proof.reviewedBy = adminId;
    await proof.save();

    // Update appointment payment status
    await Appointment.findByIdAndUpdate(proof.appointmentId, {
      paymentStatus: 'paid_online',
      paymentProofId: proof._id
    });

    console.log('✅ Payment proof approved');
    res.json({ success: true, message: 'Payment approved successfully', proof });
  } catch (err) {
    console.error('❌ Error approving payment:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reject payment proof (Admin)
export const rejectPaymentProof = async (req, res) => {
  try {
    const { proofId } = req.params;
    const { reason } = req.body;
    const adminId = req.admin.id;

    const proof = await PaymentProof.findById(proofId);
    if (!proof) {
      return res.status(404).json({ success: false, message: 'Payment proof not found' });
    }

    proof.status = 'rejected';
    proof.reviewedAt = new Date();
    proof.reviewedBy = adminId;
    proof.rejectionReason = reason || 'Invalid payment proof';
    await proof.save();

    console.log('❌ Payment proof rejected');
    res.json({ success: true, message: 'Payment proof rejected', proof });
  } catch (err) {
    console.error('❌ Error rejecting payment:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
import PaymentProof from '../models/paymentProofModel.js';
import Appointment from '../models/appointmentModel.js';

// Submit payment proof
export const submitPaymentProof = async (req, res) => {
  try {
    const { appointmentId, referenceNumber, amount } = req.body;

    if (!appointmentId || !referenceNumber || !amount || !req.file) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    const proof = await PaymentProof.create({
      appointmentId,
      referenceNumber,
      amount,
      screenshot: req.file.filename,
      status: 'pending', // default so admin can pick it up
    });

    return res.status(201).json({ success: true, message: 'Created successfully', proof });
  } catch (err) {
    console.error('❌ Payment proof error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
// Get all payment proofs (Admin)
export const getAllPaymentProofs = async (req, res) => {
  try {
    const { status } = req.query;
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

// Get payment proof by appointment
export const getPaymentProofByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const proof = await PaymentProof.findOne({ appointmentId });

    if (!proof) {
      return res.status(404).json({ success: false, message: 'No payment proof found' });
    }

    res.json({ success: true, proof });
  } catch (err) {
    console.error('❌ Error fetching payment proof:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Approve payment proof (Admin)
export const approvePaymentProof = async (req, res) => {
  try {
    const { proofId } = req.params;
    const adminId = req.admin?.id || null;

    const proof = await PaymentProof.findById(proofId);
    if (!proof) return res.status(404).json({ success: false, message: 'Payment proof not found' });

    proof.status = 'approved';
    proof.reviewedAt = new Date();
    proof.reviewedBy = adminId;
    await proof.save();

    // Update appointment
    await Appointment.findByIdAndUpdate(proof.appointmentId, {
      paymentStatus: 'paid_online',
      paymentProofId: proof._id
    });

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
    const adminId = req.admin?.id || null;

    const proof = await PaymentProof.findById(proofId);
    if (!proof) return res.status(404).json({ success: false, message: 'Payment proof not found' });

    proof.status = 'rejected';
    proof.reviewedAt = new Date();
    proof.reviewedBy = adminId;
    proof.rejectionReason = reason || 'Invalid payment proof';
    await proof.save();

    res.json({ success: true, message: 'Payment proof rejected', proof });
  } catch (err) {
    console.error('❌ Error rejecting payment:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

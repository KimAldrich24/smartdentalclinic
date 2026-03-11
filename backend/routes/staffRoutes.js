import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Staff from '../models/staffModel.js';
import Appointment from '../models/appointmentModel.js';
import User from '../models/userModel.js';
import Service from '../models/serviceModel.js';

const staffRouter = express.Router();

// Staff Login
staffRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const staff = await Staff.findOne({ email, role: 'staff' });

    if (!staff) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    if (staff.status !== 'active') {
      return res.json({ success: false, message: 'Account is inactive. Contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, staff.password);

    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: staff._id, email: staff.email, role: 'staff' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: 'staff'
      }
    });
  } catch (error) {
    console.error('Staff login error:', error);
    res.json({ success: false, message: error.message });
  }
});

// Staff Middleware
const staffAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.json({ success: false, message: 'Not authorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'staff') {
      return res.json({ success: false, message: 'Access denied: Staff only' });
    }

    req.staffId = decoded.id;
    next();
  } catch (error) {
    res.json({ success: false, message: 'Invalid token' });
  }
};

// Get all appointments
// Get all appointments for staff (fixed)
staffRouter.get('/appointments', staffAuth, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name email phone')        // actual patient (child or adult)
      .populate('bookedBy', 'name email phone')       // guardian or patient who booked
      .populate('doctor', 'name speciality email')
      .populate('services.service', 'name description price')
      .sort({ date: -1, time: -1 });

    res.json({ success: true, appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.json({ success: false, message: error.message });
  }
});
// Get all patients
staffRouter.get('/patients', staffAuth, async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json({ success: true, patients });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.json({ success: false, message: error.message });
  }
});

// Get patient history
staffRouter.get('/patients/:id/history', staffAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointments = await Appointment.find({ user: id })
      .populate('doctor', 'name speciality')
      .populate('service', 'name description price')
      .sort({ date: -1, time: -1 });
    
    const patient = await User.findById(id).select('-password');
    
    res.json({ 
      success: true, 
      patient,
      appointments 
    });
  } catch (error) {
    console.error('Error fetching patient history:', error);
    res.json({ success: false, message: error.message });
  }
});

// Get treatments/services
staffRouter.get('/treatments', staffAuth, async (req, res) => {
  try {
    const treatments = await Service.find().sort({ name: 1 });
    res.json({ success: true, treatments });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.json({ success: false, message: error.message });
  }
});

// Change Staff Password
staffRouter.put('/change-password', staffAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.json({
        success: false,
        message: 'Current and new password are required',
      });
    }

    // Find logged-in staff
    const staff = await Staff.findById(req.staffId);

    if (!staff) {
      return res.json({
        success: false,
        message: 'Staff not found',
      });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, staff.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Prevent same password reuse
    const isSamePassword = await bcrypt.compare(newPassword, staff.password);
    if (isSamePassword) {
      return res.json({
        success: false,
        message: 'New password must be different from old password',
      });
    }

    // Hash & save new password
    const salt = await bcrypt.genSalt(10);
    staff.password = await bcrypt.hash(newPassword, salt);
    await staff.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.json({
      success: false,
      message: 'Server error',
    });
  }
});


export default staffRouter;
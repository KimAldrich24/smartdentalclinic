import express from 'express';
import bcrypt from 'bcryptjs';
import Staff from '../models/staffModel.js';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';

const adminStaffRouter = express.Router();

// Get all staff members (Admin only)
adminStaffRouter.get('/', adminAuthMiddleware, async (req, res) => {
  try {
    const staffList = await Staff.find({ role: 'staff' }).select('-password');
    res.json({ success: true, staff: staffList });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Create new staff member (Admin only)
adminStaffRouter.post('/', adminAuthMiddleware, async (req, res) => {
  try {
    const { name, email, password, phone, status } = req.body;

    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.json({ success: false, message: 'Staff member already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = new Staff({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'staff',
      status: status || 'active'
    });

    await newStaff.save();

    res.json({ 
      success: true, 
      message: 'Staff member created successfully',
      staff: {
        id: newStaff._id,
        name: newStaff.name,
        email: newStaff.email,
        phone: newStaff.phone,
        status: newStaff.status
      }
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Update staff member (Admin only)
adminStaffRouter.put('/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { name, email, phone, status, password } = req.body;
    const updateData = { name, email, phone, status };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedStaff) {
      return res.json({ success: false, message: 'Staff member not found' });
    }

    res.json({ 
      success: true, 
      message: 'Staff member updated successfully',
      staff: updatedStaff
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Delete/Deactivate staff member (Admin only)
adminStaffRouter.delete('/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );

    if (!staff) {
      return res.json({ success: false, message: 'Staff member not found' });
    }

    res.json({ 
      success: true, 
      message: 'Staff member deactivated successfully'
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

export default adminStaffRouter;
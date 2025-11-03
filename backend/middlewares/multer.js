import multer from 'multer';
import path from 'path';

// Storage for doctor images
const doctorStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/doctors/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'doctor-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage for payment proofs
const paymentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/payment-proofs/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Export multer upload middleware for doctors
export const uploadDoctorImage = multer({
  storage: doctorStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Export multer upload middleware for payment proofs
export const uploadPaymentProof = multer({
  storage: paymentStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});
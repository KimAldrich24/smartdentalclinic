import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'

// Routes
import adminRoutes from './routes/adminRoutes.js'
import doctorRouter from './routes/doctorRoutes.js'
import serviceRoutes from './routes/serviceRoutes.js'
import userRoutes from "./routes/userRoutes.js"
import promotionRoutes from "./routes/promotionRoutes.js"
import appointmentRoutes from "./routes/appointmentRoutes.js"
import patientRecordsRoutes from "./routes/patientRecordRoutes.js"
import patientRoutes from './routes/patientRoutes.js'
import faqRoutes from "./routes/faqRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import prescriptionRoutes from "./routes/prescriptionRoutes.js"
import contactRoutes from "./routes/contactRoutes.js"
import doctorAuthRoutes from "./routes/doctorAuthRoutes.js"
import jobApplicationRoutes from "./routes/jobApplicationRoutes.js"
import doctorScheduleRoutes from "./routes/doctorScheduleRoutes.js"
import adminAppointmentRoutes from "./routes/adminAppointmentRoutes.js"
import salesRoutes from "./routes/salesRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import equipmentRoutes from "./routes/equipmentRoutes.js";
import staffRoutes from "./routes/staffRoutes.js"
import adminStaffRoutes from "./routes/adminStaffRoutes.js"
import { startScheduleCleanup } from './utils/scheduleCleanup.js' // ✅ ADD THIS
import paymentProofRoutes from './routes/paymentProofRoutes.js';
// Node Fetch for SMS
import fetch from 'node-fetch'

// app config
const app = express()
const port = process.env.PORT || 4000

// connect to DB and Cloudinary
connectDB()
connectCloudinary()

// middlewares
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://smartdental.site',
    'https://admin.smartdental.site',
    'https://smartdentalclinic-1.onrender.com',
    'https://smartdentalclinic-2.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// logging middleware
app.use((req, res, next) => {
    console.log(`➡️ Incoming request: ${req.method} ${req.originalUrl}`);
    next();
});

// api endpoints
app.use('/api/admin', adminRoutes)
app.use('/api/doctors', doctorRouter)
app.use('/api/services', serviceRoutes)
app.use("/api/users", userRoutes)
app.use("/api/patient-records", patientRecordsRoutes)
app.use("/api/promotions", promotionRoutes)
app.use('/api/patients', patientRoutes)
app.use("/api/appointments", appointmentRoutes)
app.use("/api/faqs", faqRoutes)
app.use("/dashboard", dashboardRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/prescriptions", prescriptionRoutes)
app.use("/api/contact", contactRoutes)
app.use("/api/doctors/auth", doctorAuthRoutes)
app.use("/api/job-applications", jobApplicationRoutes)
app.use("/api/doctor-schedule", doctorScheduleRoutes)
app.use("/api/admin/appointments", adminAppointmentRoutes)
app.use("/api/sales", salesRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/staff", staffRoutes)
app.use("/api/admin/staff", adminStaffRoutes)
app.use('/api/payment-proofs', paymentProofRoutes);
app.use('/uploads', express.static('uploads'));
// root endpoint
app.get('/', (req, res) => {
    res.send('API WORKING')
})

/* ==========================
   🔹 IPROGTECH SMS ROUTE
=========================== */
app.post('/api/send-sms', async (req, res) => {
    const { phone, message } = req.body

    if (!phone || !message) {
        return res.status(400).json({ success: false, error: 'Phone and message are required' })
    }

    try {
        const response = await fetch('https://sms.iprogtech.com/api/v1/sms_messages/send_bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_token: process.env.IPROGTECH_API_KEY, // Your iprogtech API key
                phone_number: phone,
                message: message
            })
        })

        const data = await response.json()
        console.log('📱 iprogtech SMS response:', data)
        res.json({ success: true, data })
    } catch (err) {
        console.error('❌ SMS Error:', err)
        res.status(500).json({ success: false, error: err.message })
    }
})
// ✅ ADD THIS before app.listen()
startScheduleCleanup();
// start server
app.listen(port, () => console.log(`Server Started on port ${port}`))

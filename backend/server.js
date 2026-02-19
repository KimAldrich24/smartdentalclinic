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
import salesRoutes from "./routes/salesRoutes.js"
import auditRoutes from "./routes/auditRoutes.js"
import equipmentRoutes from "./routes/equipmentRoutes.js"
import staffRoutes from "./routes/staffRoutes.js"
import adminStaffRoutes from "./routes/adminStaffRoutes.js"
import paymentProofRoutes from './routes/paymentProofRoutes.js'
import { startScheduleCleanup } from './utils/scheduleCleanup.js'
import doctorScheduleRequestRoutes from "./routes/doctorScheduleRequestRoutes.js";
// import creditRouter from "./routes/creditRoutes.js";

// SMS
import fetch from 'node-fetch'

// App config
const app = express()
const port = process.env.PORT || 4000

// DB & Cloudinary
connectDB()
connectCloudinary()

// Middlewares
app.use(express.json())
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://www.smartdental.site',
    'https://smartdental.site',
    'https://admin.smartdental.site',
    'https://smartdentalclinic-1.onrender.com',
    'https://smartdentalclinic-2.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Logger
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`)
  next()
})

// Helper to mount routes safely
const safeUse = (path, router, name) => {
  try {
    app.use(path, router)
    console.log(`✅ Mounted ${name} at ${path}`)
  } catch (err) {
    console.error(`❌ Failed to mount ${name}:`, err.message)
  }
}

// Routes
safeUse('/api/admin', adminRoutes, 'adminRoutes')
safeUse('/api/doctors', doctorRouter, 'doctorRoutes')
safeUse('/api/services', serviceRoutes, 'serviceRoutes')
safeUse('/api/users', userRoutes, 'userRoutes')
safeUse('/api/patient-records', patientRecordsRoutes, 'patientRecordsRoutes')
safeUse('/api/promotions', promotionRoutes, 'promotionRoutes')
safeUse('/api/patients', patientRoutes, 'patientRoutes')
safeUse('/api/appointments', appointmentRoutes, 'appointmentRoutes')
safeUse('/api/faqs', faqRoutes, 'faqRoutes')
safeUse('/dashboard', dashboardRoutes, 'dashboardRoutes')
safeUse('/api/auth', authRoutes, 'authRoutes')
safeUse('/api/prescriptions', prescriptionRoutes, 'prescriptionRoutes')
safeUse('/api/contact', contactRoutes, 'contactRoutes')
safeUse('/api/doctors/auth', doctorAuthRoutes, 'doctorAuthRoutes')
safeUse('/api/job-applications', jobApplicationRoutes, 'jobApplicationRoutes')
safeUse('/api/admin/appointments', adminAppointmentRoutes, 'adminAppointmentRoutes')
safeUse('/api/sales', salesRoutes, 'salesRoutes')
safeUse('/api/audit', auditRoutes, 'auditRoutes')
safeUse('/api/equipment', equipmentRoutes, 'equipmentRoutes')
safeUse('/api/staff', staffRoutes, 'staffRoutes')
safeUse('/api/admin/staff', adminStaffRoutes, 'adminStaffRoutes')
safeUse('/api/payment-proofs', paymentProofRoutes, 'paymentProofRoutes')
safeUse('/api/admin/schedule', doctorScheduleRoutes, 'doctorScheduleRoutes')
safeUse("/api/doctor/schedule-request", doctorScheduleRequestRoutes);
// safeUse("/api/credits", creditRouter);

// Static uploads only
app.use('/uploads', express.static('uploads'))

// Health check
app.get('/api', (req, res) => {
  res.send('API WORKING')
})

// SMS route
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
        api_token: process.env.IPROGTECH_API_KEY,
        phone_number: phone,
        message
      })
    })

    const data = await response.json()
    res.json({ success: true, data })
  } catch (err) {
    console.error('❌ SMS Error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// Cleanup job
startScheduleCleanup()

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`)
})

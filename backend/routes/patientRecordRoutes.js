// routes/patientRecordRoutes.js
import express from "express";
import { addRecord, getUserRecords } from "../controllers/patientRecordController.js";


const router = express.Router();

router.post("/add", addRecord); // admin/doctor adds record
router.get("/:userId", getUserRecords); // user views his records


export default router;

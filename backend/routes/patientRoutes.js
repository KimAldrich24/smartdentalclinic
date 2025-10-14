import express from "express";
import { getPatients, updatePatient, deletePatient } from "../controllers/patientController.js";

const router = express.Router();

router.get("/", getPatients);
router.put("/:id", updatePatient);
router.delete("/:id", deletePatient);

export default router;

import express from "express";
import { addService, getAllServices, updateService, removeService } from "../controllers/serviceController.js";

const router = express.Router();

// CRUD routes
router.post("/", addService);
router.get("/", getAllServices);
router.put("/:id", updateService);
router.delete("/:id", removeService);

export default router;

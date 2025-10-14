import express from "express";
import { getContact, updateContact } from "../controllers/contactController.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

router.get("/", getContact); // anyone can view contact info
router.put("/", adminAuthMiddleware, updateContact); // only admin can edit

export default router;

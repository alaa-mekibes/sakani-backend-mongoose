import { Router } from "express";
import { validate } from "../middleware/validate";
import authMiddleware from "../middleware/auth";
import InquiryController from "../controllers/inquiry";
import {  inquiryIdSchema, propertyIdSchema } from "../schemas/property";

const router = Router();
const inquiryController = new InquiryController();

router.get("/property/:propertyId", authMiddleware, validate(propertyIdSchema, 'params'), (req, res) => inquiryController.getInquiries(req, res));
router.get("/:inquiryId", authMiddleware, validate(inquiryIdSchema, 'params'), (req, res) => inquiryController.getInquiry(req, res));
router.post("/property/:propertyId", authMiddleware, validate(propertyIdSchema, 'params'), (req, res) => inquiryController.sendMessage(req, res));
router.patch("/:inquiryId/read", authMiddleware, validate(inquiryIdSchema, 'params'), (req, res) => inquiryController.markInquiryRead(req, res));


export default router;
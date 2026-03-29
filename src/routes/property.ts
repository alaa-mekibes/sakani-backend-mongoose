import { Router } from "express";
import { validate } from "../middleware/validate";
import authMiddleware from "../middleware/auth";
import PropertyController from "../controllers/property";
import { createPropertySchema, inquiryIdSchema, propertyIdSchema, updatePropertySchema } from "../schemas/property";

const router = Router();
const propertyController = new PropertyController();

router.get("/my", authMiddleware, (req, res) => propertyController.getMyProperties(req, res));
router.post("/", authMiddleware, validate(createPropertySchema), (req, res) => propertyController.addProperty(req, res));
router.patch("/:propertyId", authMiddleware, validate(updatePropertySchema), validate(propertyIdSchema, 'params'), (req, res) => propertyController.updateProperty(req, res));
router.delete("/:propertyId", authMiddleware, validate(propertyIdSchema, 'params'), (req, res) => propertyController.deleteProperty(req, res));

router.get("/:propertyId", authMiddleware, validate(propertyIdSchema, 'params'), (req, res) => propertyController.getProperty(req, res));
router.post("/:propertyId/inquire", authMiddleware, validate(propertyIdSchema, 'params'), (req, res) => propertyController.sendMessage(req, res));

router.get("/:propertyId/inquiries", authMiddleware, validate(propertyIdSchema, 'params'), (req, res) => propertyController.getInquiries(req, res));
router.get("/inquiry/:inquiryId", authMiddleware, validate(inquiryIdSchema, 'params'), (req, res) => propertyController.getInquiry(req, res));
router.patch("/inquiry/:inquiryId/read", authMiddleware, validate(inquiryIdSchema, 'params'), (req, res) => propertyController.markInquiryRead(req, res));

export default router;
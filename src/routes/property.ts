import { Router } from "express";
import { validate } from "../middleware/validate";
import authMiddleware from "../middleware/auth";
import PropertyController from "../controllers/property";
import { createPropertySchema, propertyIdSchema, searchPropertySchema, updatePropertySchema } from "../schemas/property";
import { uploadToCloudinary } from "../middleware/uploadToCloudinary";
import { uploadProperty } from "../config/multer";

const router = Router();
const propertyController = new PropertyController();

router.get("/my", authMiddleware, (req, res) => propertyController.getMyProperties(req, res));
router.get("/", authMiddleware, validate(searchPropertySchema, 'query'), (req, res) => propertyController.getProperties(req, res));
router.post("/", authMiddleware, uploadProperty.array('images', 5), validate(createPropertySchema), uploadToCloudinary("properties"), (req, res) => propertyController.addProperty(req, res));
router.patch("/:propertyId", authMiddleware, uploadProperty.array('images', 5), validate(updatePropertySchema), validate(propertyIdSchema, 'params'), uploadToCloudinary("properties"), (req, res) => propertyController.updateProperty(req, res));
router.delete("/:propertyId", authMiddleware, validate(propertyIdSchema, 'params'), (req, res) => propertyController.deleteProperty(req, res));

router.get("/:propertyId", authMiddleware, validate(propertyIdSchema, 'params'), (req, res) => propertyController.getProperty(req, res));

export default router;
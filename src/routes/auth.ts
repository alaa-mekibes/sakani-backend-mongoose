import { Router } from "express";
import { validate } from "../middleware/validate";
import { createUserSchema, loginUserSchema, updateUserSchema, userIdSchema, verifyEmailSchema, verifyOnlyEmailSchema, resetPasswordSchema } from "../schemas/user";
import AuthController from "../controllers/auth";
import authMiddleware from "../middleware/auth";
import { uploadToCloudinary } from "../middleware/uploadToCloudinary";
import { uploadAvatar } from "../config/multer";

const router = Router();
const authController = new AuthController();

router.post("/register", validate(createUserSchema), (req, res) => authController.registerUser(req, res));
router.post("/login", validate(loginUserSchema), (req, res) => authController.loginUser(req, res));
router.get("/me", authMiddleware, (req, res) => authController.getMyProfile(req, res));
router.get("/:userId", authMiddleware, validate(userIdSchema, 'params'), (req, res) => authController.getUserProfile(req, res));
router.patch("/me", authMiddleware, uploadAvatar.single('avatar'), validate(updateUserSchema), uploadToCloudinary("avatars"), (req, res) => authController.updateMyProfile(req, res));
router.post("/logout", (req, res) => authController.logoutUser(req, res));
router.delete("/", (req, res) => authController.removeUser(req, res));
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post('/resend-code', validate(verifyOnlyEmailSchema), authController.resendVerificationCode);
router.post('/forgot-password', validate(verifyOnlyEmailSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

export default router;
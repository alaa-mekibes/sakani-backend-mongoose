import { Router } from "express";
import { validate } from "../middleware/validate";
import { createUserSchema, loginUserSchema, updateUserSchema, userIdSchema } from "../schemas/user";
import AuthController from "../controllers/auth";
import authMiddleware from "../middleware/auth";

const router = Router();
const authController = new AuthController();

router.post("/register", validate(createUserSchema), (req, res) => authController.registerUser(req, res));
router.post("/login", validate(loginUserSchema), (req, res) => authController.loginUser(req, res));
router.get("/me", authMiddleware, (req, res) => authController.getMyProfile(req, res));
router.get("/:userId", authMiddleware, validate(userIdSchema, 'params'), (req, res) => authController.getUserProfile(req, res));
router.patch("/me", authMiddleware, validate(updateUserSchema), (req, res) => authController.updateMyProfile(req, res));
router.post("/logout", (req, res) => authController.logoutUser(req, res));
router.delete("/remove", (req, res) => authController.removeUser(req, res));

export default router;
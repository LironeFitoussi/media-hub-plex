import { asyncHandler } from "@/utils/errorHandler";
import { Router } from "express";
import AuthController from "../controllers/auth.controllers";
// import { checkJwt } from "../utils/auth0";
import { auth0Middleware } from "../middleware/auth0.mdw";
const router = Router();
const authController = new AuthController();

router.get("/me", auth0Middleware, asyncHandler(authController.getCurrentUser.bind(authController)));
router.get("/validate", auth0Middleware, asyncHandler(authController.validateToken.bind(authController)));
export default router;
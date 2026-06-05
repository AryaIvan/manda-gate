import { Router } from "express";
import { getSettings, updateSettings, getUsers, updateUser, resetPassword, changeStatus } from "../controllers/setting.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

// Settings endpoints
router.get("/settings", authMiddleware, getSettings);
router.put("/settings", authMiddleware, roleMiddleware(["ADMIN"]), updateSettings);

// User management endpoints
router.get("/users", authMiddleware, roleMiddleware(["ADMIN"]), getUsers);
router.put("/users/:id", authMiddleware, roleMiddleware(["ADMIN"]), updateUser);
router.patch("/users/:id/reset-password", authMiddleware, roleMiddleware(["ADMIN"]), resetPassword);
router.patch("/users/:id/change-status", authMiddleware, roleMiddleware(["ADMIN"]), changeStatus);

export default router;

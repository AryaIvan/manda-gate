import { Router } from "express";
import { getAchievements, getAchievementById, createAchievement, updateAchievement, deleteAchievement, getAchievementsByStudent } from "../controllers/achievement.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

router.get("/", authMiddleware, getAchievements);
router.get("/:id", authMiddleware, getAchievementById);
router.post("/", authMiddleware, roleMiddleware(["ADMIN", "TEACHER", "HOMEROOM_TEACHER"]), createAchievement);
router.put("/:id", authMiddleware, roleMiddleware(["ADMIN", "TEACHER", "HOMEROOM_TEACHER"]), updateAchievement);
router.delete("/:id", authMiddleware, roleMiddleware(["ADMIN"]), deleteAchievement);

export default router;

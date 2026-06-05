import { Router } from "express";
import { getSchedules, getScheduleById, createSchedule, updateSchedule, deleteSchedule, getSchedulesByClass, getSchedulesByTeacher } from "../controllers/schedule.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

router.get("/", authMiddleware, getSchedules);
router.get("/:id", authMiddleware, getScheduleById);
router.post("/", authMiddleware, roleMiddleware(["ADMIN"]), createSchedule);
router.put("/:id", authMiddleware, roleMiddleware(["ADMIN"]), updateSchedule);
router.delete("/:id", authMiddleware, roleMiddleware(["ADMIN"]), deleteSchedule);

export default router;

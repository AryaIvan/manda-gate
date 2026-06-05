import { Router } from "express";
import { getAttendances, getAttendanceById, createAttendance, updateAttendance, deleteAttendance } from "../controllers/attendance.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

router.get("/", authMiddleware, getAttendances);
router.get("/:id", authMiddleware, getAttendanceById);
router.post("/", authMiddleware, roleMiddleware(["ADMIN", "TEACHER", "HOMEROOM_TEACHER"]), createAttendance);
router.put("/:id", authMiddleware, roleMiddleware(["ADMIN", "TEACHER", "HOMEROOM_TEACHER"]), updateAttendance);
router.delete("/:id", authMiddleware, roleMiddleware(["ADMIN"]), deleteAttendance);

export default router;

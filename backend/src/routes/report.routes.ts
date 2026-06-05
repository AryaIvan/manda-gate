import { Router } from "express";
import { getSummaryReport, getAttendanceReport, getGradesReport, getLeaveRequestsReport, getAchievementsReport, getStudentsReport, getTeachersReport } from "../controllers/report.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

const reportRoles = ["ADMIN", "TEACHER", "HOMEROOM_TEACHER", "BK", "HEADMASTER"];

router.get("/summary", authMiddleware, roleMiddleware(reportRoles), getSummaryReport);
router.get("/attendance", authMiddleware, roleMiddleware(reportRoles), getAttendanceReport);
router.get("/grades", authMiddleware, roleMiddleware(reportRoles), getGradesReport);
router.get("/leave-requests", authMiddleware, roleMiddleware(reportRoles), getLeaveRequestsReport);
router.get("/achievements", authMiddleware, roleMiddleware(reportRoles), getAchievementsReport);
router.get("/students", authMiddleware, roleMiddleware(reportRoles), getStudentsReport);
router.get("/teachers", authMiddleware, roleMiddleware(reportRoles), getTeachersReport);

export default router;

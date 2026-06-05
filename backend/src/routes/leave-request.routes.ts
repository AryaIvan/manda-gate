import { Router } from "express";
import { getLeaveRequests, getLeaveRequestById, createLeaveRequest, updateLeaveRequest, deleteLeaveRequest, approveLeaveRequest, rejectLeaveRequest } from "../controllers/leave-request.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

router.get("/", authMiddleware, roleMiddleware(["ADMIN", "HOMEROOM_TEACHER", "STUDENT", "BK", "HEADMASTER"]), getLeaveRequests);
router.get("/:id", authMiddleware, roleMiddleware(["ADMIN", "HOMEROOM_TEACHER", "STUDENT", "BK", "HEADMASTER"]), getLeaveRequestById);
router.post("/", authMiddleware, roleMiddleware(["STUDENT"]), createLeaveRequest);
router.put("/:id", authMiddleware, roleMiddleware(["ADMIN", "HOMEROOM_TEACHER", "STUDENT"]), updateLeaveRequest);
router.delete("/:id", authMiddleware, roleMiddleware(["ADMIN", "STUDENT"]), deleteLeaveRequest);
router.patch("/:id/approve", authMiddleware, roleMiddleware(["ADMIN", "HOMEROOM_TEACHER", "BK"]), approveLeaveRequest);
router.patch("/:id/reject", authMiddleware, roleMiddleware(["ADMIN", "HOMEROOM_TEACHER", "BK"]), rejectLeaveRequest);

export default router;

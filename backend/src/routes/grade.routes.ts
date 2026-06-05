import { Router } from "express";
import { getGrades, getGradeById, createGrade, updateGrade, deleteGrade } from "../controllers/grade.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

router.get("/", authMiddleware, getGrades);
router.get("/:id", authMiddleware, getGradeById);
router.post("/", authMiddleware, roleMiddleware(["ADMIN", "TEACHER", "HOMEROOM_TEACHER"]), createGrade);
router.put("/:id", authMiddleware, roleMiddleware(["ADMIN", "TEACHER", "HOMEROOM_TEACHER"]), updateGrade);
router.delete("/:id", authMiddleware, roleMiddleware(["ADMIN"]), deleteGrade);

export default router;

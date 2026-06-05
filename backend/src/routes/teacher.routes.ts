import { Router } from "express";
import {
    createTeacher,
    createTeacherAccount,
    deleteTeacher,
    getTeacherById,
    getTeachers,
    updateTeacher,
} from "../controllers/teacher.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

router.get(
    "/",
    authMiddleware,
    roleMiddleware(["ADMIN", "TEACHER", "HOMEROOM_TEACHER", "HEADMASTER"]),
    getTeachers
);

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware(["ADMIN", "TEACHER", "HOMEROOM_TEACHER", "HEADMASTER"]),
    getTeacherById
);

router.post(
    "/",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    createTeacher
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    updateTeacher
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    deleteTeacher
);

router.post(
    "/:id/create-account",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    createTeacherAccount
);

export default router;

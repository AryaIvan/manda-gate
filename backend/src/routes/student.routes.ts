import { Router } from "express";
import {
    changeStudentClass,
    createStudent,
    createStudentAccount,
    deleteStudent,
    getStudentById,
    getStudents,
    updateStudent,
} from "../controllers/student.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

router.get(
    "/",
    authMiddleware,
    roleMiddleware(["ADMIN", "TEACHER", "HOMEROOM_TEACHER", "BK", "HEADMASTER"]),
    getStudents
);

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware(["ADMIN", "TEACHER", "HOMEROOM_TEACHER", "STUDENT", "BK", "HEADMASTER"]),
    getStudentById
);

router.post(
    "/",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    createStudent
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    updateStudent
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    deleteStudent
);

router.post(
    "/:id/create-account",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    createStudentAccount
);

router.patch(
    "/:id/change-class",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    changeStudentClass
);

export default router;

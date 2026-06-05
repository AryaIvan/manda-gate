import { Router } from "express";
import {
    assignStudentToClass,
    createClass,
    deleteClass,
    getClassById,
    getClasses,
    getStudentsByClass,
    updateClass,
} from "../controllers/class.controller";
import { getSubjectsByClass } from "../controllers/subject.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

router.get(
    "/",
    authMiddleware,
    roleMiddleware(["ADMIN", "TEACHER", "HOMEROOM_TEACHER", "BK", "HEADMASTER"]),
    getClasses
);

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware(["ADMIN", "TEACHER", "HOMEROOM_TEACHER", "BK", "HEADMASTER"]),
    getClassById
);

router.post(
    "/",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    createClass
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    updateClass
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    deleteClass
);

router.get(
    "/:id/students",
    authMiddleware,
    roleMiddleware(["ADMIN", "TEACHER", "HOMEROOM_TEACHER", "BK", "HEADMASTER"]),
    getStudentsByClass
);

router.post(
    "/:id/students",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    assignStudentToClass
);

router.get(
    "/:id/subjects",
    authMiddleware,
    roleMiddleware(["ADMIN", "TEACHER", "HOMEROOM_TEACHER", "STUDENT", "HEADMASTER"]),
    getSubjectsByClass
);

export default router;

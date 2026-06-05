import { Router } from "express";
import {
    getSubjects,
    getSubjectById,
    createSubject,
    updateSubject,
    deleteSubject,
} from "../controllers/subject.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

router.get(
    "/",
    authMiddleware,
    roleMiddleware(["ADMIN", "TEACHER", "HOMEROOM_TEACHER", "HEADMASTER"]),
    getSubjects
);

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware(["ADMIN", "TEACHER", "HOMEROOM_TEACHER", "STUDENT", "HEADMASTER"]),
    getSubjectById
);

router.post(
    "/",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    createSubject
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    updateSubject
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(["ADMIN"]),
    deleteSubject
);

export default router;

import { Router } from "express";
import { getAnnouncements, getAnnouncementById, createAnnouncement, updateAnnouncement, deleteAnnouncement } from "../controllers/announcement.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router = Router();

router.get("/", authMiddleware, getAnnouncements);
router.get("/:id", authMiddleware, getAnnouncementById);
router.post("/", authMiddleware, roleMiddleware(["ADMIN"]), createAnnouncement);
router.put("/:id", authMiddleware, roleMiddleware(["ADMIN"]), updateAnnouncement);
router.delete("/:id", authMiddleware, roleMiddleware(["ADMIN"]), deleteAnnouncement);

export default router;

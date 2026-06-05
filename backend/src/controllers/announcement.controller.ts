import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function getAnnouncements(req: Request, res: Response) {
    try {
        const { targetRole, category, search, activeOnly } = req.query;

        const whereClause: any = {};
        
        if (targetRole) {
            whereClause.OR = [
                { targetRole: targetRole as string },
                { targetRole: "ALL" }
            ];
        }

        if (category) {
            whereClause.category = category as string;
        }

        if (activeOnly === "true") {
            whereClause.status = "ACTIVE";
        }

        if (search) {
            whereClause.OR = [
                ...(whereClause.OR || []),
                { title: { contains: search as string } },
                { content: { contains: search as string } }
            ];
        }

        const announcements = await prisma.announcement.findMany({
            where: whereClause,
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                }
            },
            orderBy: {
                publishDate: "desc"
            }
        });

        return res.json({
            message: "Data pengumuman berhasil diambil",
            status: "success",
            data: announcements
        });
    } catch (error: any) {
        console.error("Error in getAnnouncements:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil data pengumuman",
            status: "error",
            error: error.message || error
        });
    }
}

export async function getAnnouncementById(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const announcement = await prisma.announcement.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                }
            }
        });

        if (!announcement) {
            return res.status(404).json({
                message: "Pengumuman tidak ditemukan",
                status: "error"
            });
        }

        return res.json({
            message: "Detail pengumuman berhasil diambil",
            status: "success",
            data: announcement
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil detail pengumuman",
            status: "error",
            error: error.message || error
        });
    }
}

export async function createAnnouncement(req: Request, res: Response) {
    try {
        const { title, content, category, targetRole, status } = req.body;
        const user = (req as any).user;

        if (!title || !content || !category || !targetRole) {
            return res.status(400).json({
                message: "Judul, konten, kategori, dan target role wajib diisi",
                status: "error"
            });
        }

        const newAnnouncement = await prisma.announcement.create({
            data: {
                title,
                content,
                category,
                targetRole,
                status: status || "ACTIVE",
                createdById: user.id
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                }
            }
        });

        return res.status(201).json({
            message: "Pengumuman berhasil ditambahkan",
            status: "success",
            data: newAnnouncement
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat menambahkan pengumuman",
            status: "error",
            error: error.message || error
        });
    }
}

export async function updateAnnouncement(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const { title, content, category, targetRole, status } = req.body;

        const announcement = await prisma.announcement.findUnique({
            where: { id }
        });

        if (!announcement) {
            return res.status(404).json({
                message: "Pengumuman tidak ditemukan",
                status: "error"
            });
        }

        const updatedAnnouncement = await prisma.announcement.update({
            where: { id },
            data: {
                title: title !== undefined ? title : announcement.title,
                content: content !== undefined ? content : announcement.content,
                category: category !== undefined ? category : announcement.category,
                targetRole: targetRole !== undefined ? targetRole : announcement.targetRole,
                status: status !== undefined ? status : announcement.status
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                }
            }
        });

        return res.json({
            message: "Pengumuman berhasil diperbarui",
            status: "success",
            data: updatedAnnouncement
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat memperbarui pengumuman",
            status: "error",
            error: error.message || error
        });
    }
}

export async function deleteAnnouncement(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const announcement = await prisma.announcement.findUnique({
            where: { id }
        });

        if (!announcement) {
            return res.status(404).json({
                message: "Pengumuman tidak ditemukan",
                status: "error"
            });
        }

        await prisma.announcement.delete({
            where: { id }
        });

        return res.json({
            message: "Pengumuman berhasil dihapus",
            status: "success"
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat menghapus pengumuman",
            status: "error",
            error: error.message || error
        });
    }
}

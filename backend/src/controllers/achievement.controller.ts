import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function getAchievements(req: Request, res: Response) {
    try {
        const { classId, studentId, level, search } = req.query;

        const whereClause: any = {};
        if (classId) {
            whereClause.classId = classId as string;
        }
        if (studentId) {
            whereClause.studentId = studentId as string;
        }
        if (level) {
            whereClause.level = level as string;
        }
        if (search) {
            whereClause.OR = [
                { title: { contains: search as string } },
                { code: { contains: search as string } },
                { student: { fullName: { contains: search as string } } }
            ];
        }

        const achievements = await prisma.achievement.findMany({
            where: whereClause,
            include: {
                student: {
                    select: {
                        id: true,
                        fullName: true,
                        nis: true
                    }
                },
                class: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                date: "desc"
            }
        });

        return res.json({
            message: "Data prestasi berhasil diambil",
            status: "success",
            data: achievements
        });
    } catch (error: any) {
        console.error("Error in getAchievements:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil data prestasi",
            status: "error",
            error: error.message || error
        });
    }
}

export async function getAchievementById(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const achievement = await prisma.achievement.findUnique({
            where: { id },
            include: {
                student: true,
                class: true
            }
        });

        if (!achievement) {
            return res.status(404).json({
                message: "Prestasi tidak ditemukan",
                status: "error"
            });
        }

        return res.json({
            message: "Detail prestasi berhasil diambil",
            status: "success",
            data: achievement
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil detail prestasi",
            status: "error",
            error: error.message || error
        });
    }
}

export async function createAchievement(req: Request, res: Response) {
    try {
        const { studentId, classId, title, level, date, code } = req.body;

        if (!studentId || !classId || !title || !level || !date) {
            return res.status(400).json({
                message: "Siswa, kelas, judul prestasi, tingkat, dan tanggal wajib diisi",
                status: "error"
            });
        }

        // Generate achievement code if not provided
        let achCode = code;
        if (!achCode) {
            const count = await prisma.achievement.count();
            achCode = `PR${String(count + 1).padStart(3, "0")}`;
        }

        // Check if code is unique
        const existing = await prisma.achievement.findUnique({
            where: { code: achCode }
        });

        if (existing) {
            return res.status(409).json({
                message: `Kode prestasi ${achCode} sudah terdaftar. Gunakan kode lain.`,
                status: "error"
            });
        }

        const newAchievement = await prisma.achievement.create({
            data: {
                studentId,
                classId,
                title,
                level,
                date: new Date(date),
                code: achCode
            },
            include: {
                student: true,
                class: true
            }
        });

        return res.status(201).json({
            message: "Prestasi berhasil ditambahkan",
            status: "success",
            data: newAchievement
        });
    } catch (error: any) {
        console.error("Error in createAchievement:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan saat menambahkan prestasi",
            status: "error",
            error: error.message || error
        });
    }
}

export async function updateAchievement(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const { studentId, classId, title, level, date, code } = req.body;

        const achievement = await prisma.achievement.findUnique({
            where: { id }
        });

        if (!achievement) {
            return res.status(404).json({
                message: "Prestasi tidak ditemukan",
                status: "error"
            });
        }

        if (code && code !== achievement.code) {
            const existing = await prisma.achievement.findUnique({
                where: { code }
            });
            if (existing) {
                return res.status(409).json({
                    message: `Kode prestasi ${code} sudah digunakan.`,
                    status: "error"
                });
            }
        }

        const updated = await prisma.achievement.update({
            where: { id },
            data: {
                studentId: studentId !== undefined ? studentId : achievement.studentId,
                classId: classId !== undefined ? classId : achievement.classId,
                title: title !== undefined ? title : achievement.title,
                level: level !== undefined ? level : achievement.level,
                date: date !== undefined ? new Date(date) : achievement.date,
                code: code !== undefined ? code : achievement.code
            },
            include: {
                student: true,
                class: true
            }
        });

        return res.json({
            message: "Prestasi berhasil diperbarui",
            status: "success",
            data: updated
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat memperbarui prestasi",
            status: "error",
            error: error.message || error
        });
    }
}

export async function deleteAchievement(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const achievement = await prisma.achievement.findUnique({
            where: { id }
        });

        if (!achievement) {
            return res.status(404).json({
                message: "Prestasi tidak ditemukan",
                status: "error"
            });
        }

        await prisma.achievement.delete({
            where: { id }
        });

        return res.json({
            message: "Prestasi berhasil dihapus",
            status: "success"
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat menghapus prestasi",
            status: "error",
            error: error.message || error
        });
    }
}

export async function getAchievementsByStudent(req: Request, res: Response) {
    try {
        const studentId = req.params.id as string;

        const student = await prisma.student.findUnique({
            where: { id: studentId }
        });

        if (!student) {
            return res.status(404).json({
                message: "Siswa tidak ditemukan",
                status: "error"
            });
        }

        const achievements = await prisma.achievement.findMany({
            where: { studentId },
            include: {
                class: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                date: "desc"
            }
        });

        return res.json({
            message: "Prestasi siswa berhasil diambil",
            status: "success",
            data: achievements
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil prestasi siswa",
            status: "error",
            error: error.message || error
        });
    }
}

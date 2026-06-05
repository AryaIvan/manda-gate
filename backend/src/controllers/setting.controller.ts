import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";

export async function getSettings(req: Request, res: Response) {
    try {
        let settings = await prisma.systemSetting.findFirst();
        if (!settings) {
            settings = await prisma.systemSetting.create({
                data: {
                    schoolName: "MAN 2 Gresik",
                    academicYear: "2026/2027",
                    semester: "Ganjil"
                }
            });
        }
        return res.json({
            message: "Pengaturan sistem berhasil diambil",
            status: "success",
            data: settings
        });
    } catch (error: any) {
        console.error("Error in getSettings:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil pengaturan",
            status: "error",
            error: error.message || error
        });
    }
}

export async function updateSettings(req: Request, res: Response) {
    try {
        const { schoolName, academicYear, semester } = req.body;
        let settings = await prisma.systemSetting.findFirst();
        if (!settings) {
            settings = await prisma.systemSetting.create({
                data: {
                    schoolName: schoolName || "MAN 2 Gresik",
                    academicYear: academicYear || "2026/2027",
                    semester: semester || "Ganjil"
                }
            });
        } else {
            settings = await prisma.systemSetting.update({
                where: { id: settings.id },
                data: {
                    schoolName: schoolName !== undefined ? schoolName : settings.schoolName,
                    academicYear: academicYear !== undefined ? academicYear : settings.academicYear,
                    semester: semester !== undefined ? semester : settings.semester
                }
            });
        }
        return res.json({
            message: "Pengaturan sistem berhasil diperbarui",
            status: "success",
            data: settings
        });
    } catch (error: any) {
        console.error("Error in updateSettings:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan saat memperbarui pengaturan",
            status: "error",
            error: error.message || error
        });
    }
}

export async function getUsers(req: Request, res: Response) {
    try {
        const { role } = req.query;
        const whereClause: any = {};
        if (role) {
            whereClause.role = role as any;
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                role: true,
                status: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: "desc",
            }
        });

        return res.json({
            message: "Daftar user berhasil diambil",
            status: "success",
            data: users
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil daftar user",
            status: "error",
            error: error.message || error
        });
    }
}

export async function updateUser(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const { name, email, username, role, status } = req.body;

        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            return res.status(404).json({
                message: "User tidak ditemukan",
                status: "error"
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name: name !== undefined ? name : user.name,
                email: email !== undefined ? email : user.email,
                username: username !== undefined ? username : user.username,
                role: role !== undefined ? role : user.role,
                status: status !== undefined ? status : user.status
            },
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        return res.json({
            message: "User berhasil diperbarui",
            status: "success",
            data: updatedUser
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat memperbarui user",
            status: "error",
            error: error.message || error
        });
    }
}

export async function resetPassword(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const { password } = req.body;

        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            return res.status(404).json({
                message: "User tidak ditemukan",
                status: "error"
            });
        }

        const newPassword = password || "password123";
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id },
            data: {
                password: hashedPassword
            }
        });

        return res.json({
            message: "Password user berhasil di-reset",
            status: "success"
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat me-reset password",
            status: "error",
            error: error.message || error
        });
    }
}

export async function changeStatus(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const { status } = req.body;

        if (!status || (status !== "ACTIVE" && status !== "INACTIVE")) {
            return res.status(400).json({
                message: "Status tidak valid. Harus ACTIVE atau INACTIVE",
                status: "error"
            });
        }

        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            return res.status(404).json({
                message: "User tidak ditemukan",
                status: "error"
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                status
            },
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                role: true,
                status: true,
            }
        });

        return res.json({
            message: `Status user berhasil diubah menjadi ${status}`,
            status: "success",
            data: updatedUser
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengubah status user",
            status: "error",
            error: error.message || error
        });
    }
}

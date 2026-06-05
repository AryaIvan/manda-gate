import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";

function createUsername(fullName: string) {
    return fullName.toLowerCase().replace(/\s+/g, ".");
}

export async function getTeachers(req: Request, res: Response) {
    try {
        const { search } = req.query;

        const teachers = await prisma.teacher.findMany({
            where: search
                ? {
                    OR: [
                        {
                            fullName: {
                                contains: String(search),
                            },
                        },
                        {
                            nip: {
                                contains: String(search),
                            },
                        },
                        {
                            subject: {
                                contains: String(search),
                            },
                        },
                    ],
                }
                : {},
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        username: true,
                        role: true,
                        status: true,
                        lastLogin: true,
                    },
                },
                homeroomClasses: {
                    select: {
                        id: true,
                        name: true,
                        grade: true,
                        major: true,
                        academicYear: true,
                        status: true,
                    },
                },
            },
        });

        return res.json({
            message: "Data guru berhasil diambil",
            status: "success",
            data: teachers.map((teacher) => ({
                id: teacher.id,
                nip: teacher.nip,
                fullName: teacher.fullName,
                gender: teacher.gender,
                subject: teacher.subject,
                phone: teacher.phone,
                address: teacher.address,
                status: teacher.status,
                account: teacher.user,
                homeroomClasses: teacher.homeroomClasses,
                createdAt: teacher.createdAt,
                updatedAt: teacher.updatedAt,
            })),
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil data guru",
            status: "error",
            error,
        });
    }
}

export async function getTeacherById(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const teacher = await prisma.teacher.findUnique({
            where: {
                id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        username: true,
                        role: true,
                        status: true,
                        lastLogin: true,
                        createdAt: true,
                    },
                },
                homeroomClasses: {
                    select: {
                        id: true,
                        name: true,
                        grade: true,
                        major: true,
                        academicYear: true,
                        status: true,
                    },
                },
            },
        });

        if (!teacher) {
            return res.status(404).json({
                message: "Guru tidak ditemukan",
                status: "error",
            });
        }

        return res.json({
            message: "Detail guru berhasil diambil",
            status: "success",
            data: teacher,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil detail guru",
            status: "error",
            error,
        });
    }
}

export async function createTeacher(req: Request, res: Response) {
    try {
        const { nip, fullName, gender, subject, phone, address, status } = req.body;

        if (!fullName || !gender) {
            return res.status(400).json({
                message: "Nama lengkap dan jenis kelamin wajib diisi",
                status: "error",
            });
        }

        if (nip) {
            const existingTeacher = await prisma.teacher.findUnique({
                where: {
                    nip,
                },
            });

            if (existingTeacher) {
                return res.status(409).json({
                    message: "NIP sudah digunakan",
                    status: "error",
                });
            }
        }

        const teacher = await prisma.teacher.create({
            data: {
                nip: nip || null,
                fullName,
                gender,
                subject: subject || null,
                phone: phone || null,
                address: address || null,
                status: status || "ACTIVE",
            },
        });

        return res.status(201).json({
            message: "Guru berhasil dibuat",
            status: "success",
            data: teacher,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat membuat guru",
            status: "error",
            error,
        });
    }
}

export async function updateTeacher(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const { nip, fullName, gender, subject, phone, address, status } = req.body;

        const existingTeacher = await prisma.teacher.findUnique({
            where: {
                id,
            },
        });

        if (!existingTeacher) {
            return res.status(404).json({
                message: "Guru tidak ditemukan",
                status: "error",
            });
        }

        const updatedTeacher = await prisma.teacher.update({
            where: {
                id,
            },
            data: {
                nip,
                fullName,
                gender,
                subject,
                phone,
                address,
                status,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        username: true,
                        role: true,
                        status: true,
                    },
                },
            },
        });

        if (updatedTeacher.userId && fullName) {
            await prisma.user.update({
                where: {
                    id: updatedTeacher.userId,
                },
                data: {
                    name: fullName,
                },
            });
        }

        return res.json({
            message: "Guru berhasil diperbarui",
            status: "success",
            data: updatedTeacher,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat memperbarui guru",
            status: "error",
            error,
        });
    }
}

export async function deleteTeacher(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const existingTeacher = await prisma.teacher.findUnique({
            where: {
                id,
            },
        });

        if (!existingTeacher) {
            return res.status(404).json({
                message: "Guru tidak ditemukan",
                status: "error",
            });
        }

        await prisma.teacher.delete({
            where: {
                id,
            },
        });

        return res.json({
            message: "Guru berhasil dihapus",
            status: "success",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat menghapus guru",
            status: "error",
            error,
        });
    }
}

export async function createTeacherAccount(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const { email, username, password, role } = req.body;

        const teacher = await prisma.teacher.findUnique({
            where: {
                id,
            },
            include: {
                user: true,
            },
        });

        if (!teacher) {
            return res.status(404).json({
                message: "Guru tidak ditemukan",
                status: "error",
            });
        }

        if (teacher.user) {
            return res.status(409).json({
                message: "Guru ini sudah memiliki akun",
                status: "error",
            });
        }

        const finalUsername = username || createUsername(teacher.fullName);
        const finalEmail = email || `${finalUsername}@guru.manda.sch.id`;
        const finalPassword = password || "password123";
        const finalRole = role || "TEACHER";

        if (!["TEACHER", "HOMEROOM_TEACHER"].includes(finalRole)) {
            return res.status(400).json({
                message: "Role guru hanya boleh TEACHER atau HOMEROOM_TEACHER",
                status: "error",
            });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    {
                        email: finalEmail,
                    },
                    {
                        username: finalUsername,
                    },
                ],
            },
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email atau username sudah digunakan",
                status: "error",
            });
        }

        const hashedPassword = await bcrypt.hash(finalPassword, 10);

        const user = await prisma.user.create({
            data: {
                name: teacher.fullName,
                email: finalEmail,
                username: finalUsername,
                password: hashedPassword,
                role: finalRole,
                status: "ACTIVE",
            },
        });

        const updatedTeacher = await prisma.teacher.update({
            where: {
                id: teacher.id,
            },
            data: {
                userId: user.id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        username: true,
                        role: true,
                        status: true,
                    },
                },
            },
        });

        return res.status(201).json({
            message: "Akun guru berhasil dibuat",
            status: "success",
            data: {
                teacher: updatedTeacher,
                defaultPassword: finalPassword,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat membuat akun guru",
            status: "error",
            error,
        });
    }
}
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";

function createUsername(fullName: string) {
    return fullName.toLowerCase().replace(/\s+/g, ".");
}

export async function getStudents(req: Request, res: Response) {
    try {
        const { classId, search } = req.query;

        const students = await prisma.student.findMany({
            where: {
                AND: [
                    search
                        ? {
                            OR: [
                                {
                                    fullName: {
                                        contains: String(search),
                                    },
                                },
                                {
                                    nis: {
                                        contains: String(search),
                                    },
                                },
                                {
                                    nisn: {
                                        contains: String(search),
                                    },
                                },
                            ],
                        }
                        : {},
                    classId
                        ? {
                            studentClasses: {
                                some: {
                                    classId: String(classId),
                                    status: "ACTIVE",
                                },
                            },
                        }
                        : {},
                ],
            },
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
                studentClasses: {
                    where: {
                        status: "ACTIVE",
                    },
                    include: {
                        class: {
                            select: {
                                id: true,
                                name: true,
                                grade: true,
                                major: true,
                                academicYear: true,
                            },
                        },
                    },
                },
            },
        });

        const formattedStudents = students.map((student) => ({
            id: student.id,
            nis: student.nis,
            nisn: student.nisn,
            fullName: student.fullName,
            gender: student.gender,
            birthDate: student.birthDate,
            address: student.address,
            phone: student.phone,
            status: student.status,
            account: student.user,
            currentClass: student.studentClasses[0]?.class || null,
            createdAt: student.createdAt,
            updatedAt: student.updatedAt,
        }));

        return res.json({
            message: "Data siswa berhasil diambil",
            status: "success",
            data: formattedStudents,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil data siswa",
            status: "error",
            error,
        });
    }
}

export async function getStudentById(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const student = await prisma.student.findUnique({
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
                studentClasses: {
                    include: {
                        class: {
                            select: {
                                id: true,
                                name: true,
                                grade: true,
                                major: true,
                                academicYear: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });

        if (!student) {
            return res.status(404).json({
                message: "Siswa tidak ditemukan",
                status: "error",
            });
        }

        return res.json({
            message: "Detail siswa berhasil diambil",
            status: "success",
            data: {
                id: student.id,
                nis: student.nis,
                nisn: student.nisn,
                fullName: student.fullName,
                gender: student.gender,
                birthDate: student.birthDate,
                address: student.address,
                phone: student.phone,
                status: student.status,
                account: student.user,
                classHistory: student.studentClasses.map((item) => ({
                    id: item.id,
                    academicYear: item.academicYear,
                    status: item.status,
                    class: item.class,
                })),
                createdAt: student.createdAt,
                updatedAt: student.updatedAt,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil detail siswa",
            status: "error",
            error,
        });
    }
}

export async function createStudent(req: Request, res: Response) {
    try {
        const {
            nis,
            nisn,
            fullName,
            gender,
            birthDate,
            address,
            phone,
            status,
            classId,
            academicYear,
        } = req.body;

        if (!nis || !fullName || !gender) {
            return res.status(400).json({
                message: "NIS, nama lengkap, dan jenis kelamin wajib diisi",
                status: "error",
            });
        }

        const existingStudent = await prisma.student.findFirst({
            where: {
                OR: [
                    {
                        nis,
                    },
                    nisn
                        ? {
                            nisn,
                        }
                        : {},
                ],
            },
        });

        if (existingStudent) {
            return res.status(409).json({
                message: "NIS atau NISN sudah digunakan",
                status: "error",
            });
        }

        const student = await prisma.student.create({
            data: {
                nis,
                nisn: nisn || null,
                fullName,
                gender,
                birthDate: birthDate ? new Date(birthDate) : null,
                address: address || null,
                phone: phone || null,
                status: status || "ACTIVE",
            },
        });

        if (classId && academicYear) {
            await prisma.studentClass.create({
                data: {
                    studentId: student.id,
                    classId,
                    academicYear,
                    status: "ACTIVE",
                },
            });
        }

        return res.status(201).json({
            message: "Siswa berhasil dibuat",
            status: "success",
            data: student,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat membuat siswa",
            status: "error",
            error,
        });
    }
}

export async function updateStudent(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const {
            nis,
            nisn,
            fullName,
            gender,
            birthDate,
            address,
            phone,
            status,
        } = req.body;

        const existingStudent = await prisma.student.findUnique({
            where: {
                id,
            },
        });

        if (!existingStudent) {
            return res.status(404).json({
                message: "Siswa tidak ditemukan",
                status: "error",
            });
        }

        const updatedStudent = await prisma.student.update({
            where: {
                id,
            },
            data: {
                nis,
                nisn,
                fullName,
                gender,
                birthDate: birthDate ? new Date(birthDate) : null,
                address,
                phone,
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

        if (updatedStudent.userId && fullName) {
            await prisma.user.update({
                where: {
                    id: updatedStudent.userId,
                },
                data: {
                    name: fullName,
                },
            });
        }

        return res.json({
            message: "Siswa berhasil diperbarui",
            status: "success",
            data: updatedStudent,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat memperbarui siswa",
            status: "error",
            error,
        });
    }
}

export async function deleteStudent(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const existingStudent = await prisma.student.findUnique({
            where: {
                id,
            },
        });

        if (!existingStudent) {
            return res.status(404).json({
                message: "Siswa tidak ditemukan",
                status: "error",
            });
        }

        await prisma.student.delete({
            where: {
                id,
            },
        });

        return res.json({
            message: "Siswa berhasil dihapus",
            status: "success",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat menghapus siswa",
            status: "error",
            error,
        });
    }
}

export async function createStudentAccount(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const { email, username, password } = req.body;

        const student = await prisma.student.findUnique({
            where: {
                id,
            },
            include: {
                user: true,
            },
        });

        if (!student) {
            return res.status(404).json({
                message: "Siswa tidak ditemukan",
                status: "error",
            });
        }

        if (student.user) {
            return res.status(409).json({
                message: "Siswa ini sudah memiliki akun",
                status: "error",
            });
        }

        const finalUsername = username || createUsername(student.fullName);
        const finalEmail = email || `${finalUsername}@siswa.manda.sch.id`;
        const finalPassword = password || "password123";

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
                name: student.fullName,
                email: finalEmail,
                username: finalUsername,
                password: hashedPassword,
                role: "STUDENT",
                status: "ACTIVE",
            },
        });

        const updatedStudent = await prisma.student.update({
            where: {
                id: student.id,
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
            message: "Akun siswa berhasil dibuat",
            status: "success",
            data: {
                student: updatedStudent,
                defaultPassword: finalPassword,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat membuat akun siswa",
            status: "error",
            error,
        });
    }
}

export async function changeStudentClass(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const { classId, academicYear } = req.body;

        if (!classId || !academicYear) {
            return res.status(400).json({
                message: "Class ID dan tahun ajaran wajib diisi",
                status: "error",
            });
        }

        const student = await prisma.student.findUnique({
            where: {
                id,
            },
        });

        if (!student) {
            return res.status(404).json({
                message: "Siswa tidak ditemukan",
                status: "error",
            });
        }

        const schoolClass = await prisma.schoolClass.findUnique({
            where: {
                id: classId,
            },
        });

        if (!schoolClass) {
            return res.status(404).json({
                message: "Kelas tujuan tidak ditemukan",
                status: "error",
            });
        }

        await prisma.studentClass.updateMany({
            where: {
                studentId: id,
                academicYear,
                status: "ACTIVE",
            },
            data: {
                status: "INACTIVE",
            },
        });

        const newStudentClass = await prisma.studentClass.upsert({
            where: {
                studentId_classId_academicYear: {
                    studentId: id,
                    classId,
                    academicYear,
                },
            },
            update: {
                status: "ACTIVE",
            },
            create: {
                studentId: id,
                classId,
                academicYear,
                status: "ACTIVE",
            },
            include: {
                class: true,
                student: true,
            },
        });

        return res.json({
            message: "Kelas siswa berhasil diperbarui",
            status: "success",
            data: newStudentClass,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengganti kelas siswa",
            status: "error",
            error,
        });
    }
}
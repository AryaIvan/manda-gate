import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function getClasses(req: Request, res: Response) {
    try {
        const classes = await prisma.schoolClass.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                homeroomTeacher: {
                    select: {
                        id: true,
                        fullName: true,
                        nip: true,
                        subject: true,
                    },
                },
                studentClasses: {
                    where: {
                        status: "ACTIVE",
                    },
                    include: {
                        student: {
                            select: {
                                id: true,
                                nis: true,
                                nisn: true,
                                fullName: true,
                                gender: true,
                                phone: true,
                                status: true,
                            },
                        },
                    },
                },
            },
        });

        const formattedClasses = classes.map((item) => ({
            id: item.id,
            name: item.name,
            grade: item.grade,
            major: item.major,
            academicYear: item.academicYear,
            status: item.status,
            homeroomTeacher: item.homeroomTeacher,
            totalStudents: item.studentClasses.length,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        }));

        return res.json({
            message: "Data kelas berhasil diambil",
            status: "success",
            data: formattedClasses,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil data kelas",
            status: "error",
            error,
        });
    }
}

export async function getClassById(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const schoolClass = await prisma.schoolClass.findUnique({
            where: {
                id,
            },
            include: {
                homeroomTeacher: {
                    select: {
                        id: true,
                        fullName: true,
                        nip: true,
                        subject: true,
                        phone: true,
                    },
                },
                studentClasses: {
                    where: {
                        status: "ACTIVE",
                    },
                    include: {
                        student: {
                            select: {
                                id: true,
                                nis: true,
                                nisn: true,
                                fullName: true,
                                gender: true,
                                phone: true,
                                status: true,
                            },
                        },
                    },
                },
            },
        });

        if (!schoolClass) {
            return res.status(404).json({
                message: "Kelas tidak ditemukan",
                status: "error",
            });
        }

        return res.json({
            message: "Detail kelas berhasil diambil",
            status: "success",
            data: {
                id: schoolClass.id,
                name: schoolClass.name,
                grade: schoolClass.grade,
                major: schoolClass.major,
                academicYear: schoolClass.academicYear,
                status: schoolClass.status,
                homeroomTeacher: schoolClass.homeroomTeacher,
                students: schoolClass.studentClasses.map((item) => item.student),
                totalStudents: schoolClass.studentClasses.length,
                createdAt: schoolClass.createdAt,
                updatedAt: schoolClass.updatedAt,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil detail kelas",
            status: "error",
            error,
        });
    }
}

export async function createClass(req: Request, res: Response) {
    try {
        const { name, grade, major, academicYear, homeroomTeacherId, status } =
            req.body;

        if (!name || !grade || !major || !academicYear) {
            return res.status(400).json({
                message: "Nama kelas, tingkat, jurusan, dan tahun ajaran wajib diisi",
                status: "error",
            });
        }

        const existingClass = await prisma.schoolClass.findFirst({
            where: {
                name,
                academicYear,
            },
        });

        if (existingClass) {
            return res.status(409).json({
                message: "Kelas dengan tahun ajaran tersebut sudah ada",
                status: "error",
            });
        }

        const schoolClass = await prisma.schoolClass.create({
            data: {
                name,
                grade,
                major,
                academicYear,
                homeroomTeacherId: homeroomTeacherId || null,
                status: status || "ACTIVE",
            },
            include: {
                homeroomTeacher: {
                    select: {
                        id: true,
                        fullName: true,
                        nip: true,
                        subject: true,
                    },
                },
            },
        });

        return res.status(201).json({
            message: "Kelas berhasil dibuat",
            status: "success",
            data: schoolClass,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat membuat kelas",
            status: "error",
            error,
        });
    }
}

export async function updateClass(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const { name, grade, major, academicYear, homeroomTeacherId, status } =
            req.body;

        const existingClass = await prisma.schoolClass.findUnique({
            where: {
                id,
            },
        });

        if (!existingClass) {
            return res.status(404).json({
                message: "Kelas tidak ditemukan",
                status: "error",
            });
        }

        const updatedClass = await prisma.schoolClass.update({
            where: {
                id,
            },
            data: {
                name,
                grade,
                major,
                academicYear,
                homeroomTeacherId: homeroomTeacherId || null,
                status,
            },
            include: {
                homeroomTeacher: {
                    select: {
                        id: true,
                        fullName: true,
                        nip: true,
                        subject: true,
                    },
                },
            },
        });

        return res.json({
            message: "Kelas berhasil diperbarui",
            status: "success",
            data: updatedClass,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat memperbarui kelas",
            status: "error",
            error,
        });
    }
}

export async function deleteClass(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const existingClass = await prisma.schoolClass.findUnique({
            where: {
                id,
            },
        });

        if (!existingClass) {
            return res.status(404).json({
                message: "Kelas tidak ditemukan",
                status: "error",
            });
        }

        await prisma.schoolClass.delete({
            where: {
                id,
            },
        });

        return res.json({
            message: "Kelas berhasil dihapus",
            status: "success",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat menghapus kelas",
            status: "error",
            error,
        });
    }
}

export async function getStudentsByClass(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const schoolClass = await prisma.schoolClass.findUnique({
            where: {
                id,
            },
            include: {
                studentClasses: {
                    where: {
                        status: "ACTIVE",
                    },
                    include: {
                        student: {
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
                        },
                    },
                },
            },
        });

        if (!schoolClass) {
            return res.status(404).json({
                message: "Kelas tidak ditemukan",
                status: "error",
            });
        }

        const students = schoolClass.studentClasses.map((item) => ({
            id: item.student.id,
            nis: item.student.nis,
            nisn: item.student.nisn,
            fullName: item.student.fullName,
            gender: item.student.gender,
            phone: item.student.phone,
            address: item.student.address,
            status: item.student.status,
            user: item.student.user,
        }));

        return res.json({
            message: "Data siswa dalam kelas berhasil diambil",
            status: "success",
            data: {
                class: {
                    id: schoolClass.id,
                    name: schoolClass.name,
                    grade: schoolClass.grade,
                    major: schoolClass.major,
                    academicYear: schoolClass.academicYear,
                },
                students,
                totalStudents: students.length,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil siswa dalam kelas",
            status: "error",
            error,
        });
    }
}

export async function assignStudentToClass(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const { studentId, academicYear } = req.body;

        if (!studentId || !academicYear) {
            return res.status(400).json({
                message: "Student ID dan tahun ajaran wajib diisi",
                status: "error",
            });
        }

        const schoolClass = await prisma.schoolClass.findUnique({
            where: {
                id,
            },
        });

        if (!schoolClass) {
            return res.status(404).json({
                message: "Kelas tidak ditemukan",
                status: "error",
            });
        }

        const student = await prisma.student.findUnique({
            where: {
                id: studentId,
            },
        });

        if (!student) {
            return res.status(404).json({
                message: "Siswa tidak ditemukan",
                status: "error",
            });
        }

        const studentClass = await prisma.studentClass.upsert({
            where: {
                studentId_classId_academicYear: {
                    studentId,
                    classId: id,
                    academicYear,
                },
            },
            update: {
                status: "ACTIVE",
            },
            create: {
                studentId,
                classId: id,
                academicYear,
                status: "ACTIVE",
            },
            include: {
                student: true,
                class: true,
            },
        });

        return res.status(201).json({
            message: "Siswa berhasil dimasukkan ke kelas",
            status: "success",
            data: studentClass,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat memasukkan siswa ke kelas",
            status: "error",
            error,
        });
    }
}
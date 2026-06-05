import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function getSubjects(req: Request, res: Response) {
    try {
        const { classId, status, search } = req.query;

        const whereClause: any = {};
        if (classId) {
            whereClause.classId = classId as string;
        }
        if (status) {
            whereClause.status = status as any;
        }
        if (search) {
            whereClause.OR = [
                { name: { contains: search as string } },
                { code: { contains: search as string } },
            ];
        }

        const subjects = await prisma.subject.findMany({
            where: whereClause,
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
                teacher: {
                    select: {
                        id: true,
                        fullName: true,
                        nip: true,
                        subject: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.json({
            message: "Data mata pelajaran berhasil diambil",
            status: "success",
            data: subjects,
        });
    } catch (error: any) {
        console.error("Error in getSubjects:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil data mata pelajaran",
            status: "error",
            error: error.message || error,
        });
    }
}

export async function getSubjectById(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const subject = await prisma.subject.findUnique({
            where: { id },
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
                teacher: {
                    select: {
                        id: true,
                        fullName: true,
                        nip: true,
                        subject: true,
                    },
                },
            },
        });

        if (!subject) {
            return res.status(404).json({
                message: "Mata pelajaran tidak ditemukan",
                status: "error",
            });
        }

        return res.json({
            message: "Detail mata pelajaran berhasil diambil",
            status: "success",
            data: subject,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil detail mata pelajaran",
            status: "error",
            error,
        });
    }
}

export async function createSubject(req: Request, res: Response) {
    try {
        const { name, code, classId, teacherId, status } = req.body;

        if (!name || !classId) {
            return res.status(400).json({
                message: "Nama mata pelajaran dan Kelas wajib diisi",
                status: "error",
            });
        }

        const schoolClass = await prisma.schoolClass.findUnique({
            where: { id: classId },
        });

        if (!schoolClass) {
            return res.status(404).json({
                message: "Kelas tidak ditemukan",
                status: "error",
            });
        }

        if (teacherId) {
            const teacher = await prisma.teacher.findUnique({
                where: { id: teacherId },
            });
            if (!teacher) {
                return res.status(404).json({
                    message: "Guru pengampu tidak ditemukan",
                    status: "error",
                });
            }
        }

        const existingSubject = await prisma.subject.findFirst({
            where: {
                name,
                classId,
            },
        });

        if (existingSubject) {
            return res.status(409).json({
                message: "Mata pelajaran dengan nama tersebut sudah ada di kelas ini",
                status: "error",
            });
        }

        const newSubject = await prisma.subject.create({
            data: {
                name,
                code: code || null,
                classId,
                teacherId: teacherId || null,
                status: status || "ACTIVE",
            },
            include: {
                class: true,
                teacher: true,
            },
        });

        return res.status(201).json({
            message: "Mata pelajaran berhasil ditambahkan",
            status: "success",
            data: newSubject,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat menambahkan mata pelajaran",
            status: "error",
            error,
        });
    }
}

export async function updateSubject(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const { name, code, classId, teacherId, status } = req.body;

        const subject = await prisma.subject.findUnique({
            where: { id },
        });

        if (!subject) {
            return res.status(404).json({
                message: "Mata pelajaran tidak ditemukan",
                status: "error",
            });
        }

        if (classId && classId !== subject.classId) {
            const schoolClass = await prisma.schoolClass.findUnique({
                where: { id: classId },
            });
            if (!schoolClass) {
                return res.status(404).json({
                    message: "Kelas tidak ditemukan",
                    status: "error",
                });
            }

            const existingSubject = await prisma.subject.findFirst({
                where: {
                    name: name || subject.name,
                    classId,
                    id: { not: id },
                },
            });
            if (existingSubject) {
                return res.status(409).json({
                    message: "Mata pelajaran dengan nama tersebut sudah ada di kelas baru",
                    status: "error",
                });
            }
        } else if (name && name !== subject.name) {
            const existingSubject = await prisma.subject.findFirst({
                where: {
                    name,
                    classId: subject.classId,
                    id: { not: id },
                },
            });
            if (existingSubject) {
                return res.status(409).json({
                    message: "Mata pelajaran dengan nama tersebut sudah ada di kelas ini",
                    status: "error",
                });
            }
        }

        if (teacherId) {
            const teacher = await prisma.teacher.findUnique({
                where: { id: teacherId },
            });
            if (!teacher) {
                return res.status(404).json({
                    message: "Guru pengampu tidak ditemukan",
                    status: "error",
                });
            }
        }

        const updatedSubject = await prisma.subject.update({
            where: { id },
            data: {
                name: name !== undefined ? name : subject.name,
                code: code !== undefined ? code : subject.code,
                classId: classId !== undefined ? classId : subject.classId,
                teacherId: teacherId !== undefined ? teacherId : subject.teacherId,
                status: status !== undefined ? status : subject.status,
            },
            include: {
                class: true,
                teacher: true,
            },
        });

        return res.json({
            message: "Mata pelajaran berhasil diperbarui",
            status: "success",
            data: updatedSubject,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat memperbarui mata pelajaran",
            status: "error",
            error,
        });
    }
}

export async function deleteSubject(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const subject = await prisma.subject.findUnique({
            where: { id },
        });

        if (!subject) {
            return res.status(404).json({
                message: "Mata pelajaran tidak ditemukan",
                status: "error",
            });
        }

        await prisma.subject.delete({
            where: { id },
        });

        return res.json({
            message: "Mata pelajaran berhasil dihapus",
            status: "success",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat menghapus mata pelajaran",
            status: "error",
            error,
        });
    }
}

export async function getSubjectsByClass(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const schoolClass = await prisma.schoolClass.findUnique({
            where: { id },
        });

        if (!schoolClass) {
            return res.status(404).json({
                message: "Kelas tidak ditemukan",
                status: "error",
            });
        }

        const subjects = await prisma.subject.findMany({
            where: { classId: id },
            include: {
                teacher: {
                    select: {
                        id: true,
                        fullName: true,
                        nip: true,
                        subject: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        return res.json({
            message: "Data mata pelajaran kelas berhasil diambil",
            status: "success",
            data: {
                class: {
                    id: schoolClass.id,
                    name: schoolClass.name,
                    grade: schoolClass.grade,
                    major: schoolClass.major,
                    academicYear: schoolClass.academicYear,
                },
                subjects,
                totalSubjects: subjects.length,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil mata pelajaran kelas",
            status: "error",
            error,
        });
    }
}

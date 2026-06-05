import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function getAttendances(req: Request, res: Response) {
    try {
        const { classId, studentId, subjectId, date } = req.query;

        const whereClause: any = {};
        if (classId) {
            whereClause.classId = classId as string;
        }
        if (studentId) {
            whereClause.studentId = studentId as string;
        }
        if (subjectId) {
            whereClause.subjectId = subjectId as string;
        }
        if (date) {
            whereClause.date = new Date(date as string);
        }

        const attendances = await prisma.attendance.findMany({
            where: whereClause,
            include: {
                student: {
                    select: {
                        id: true,
                        fullName: true,
                        nis: true,
                    }
                },
                class: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                subject: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                teacher: {
                    select: {
                        id: true,
                        fullName: true,
                    }
                }
            },
            orderBy: {
                date: "desc"
            }
        });

        return res.json({
            message: "Data absensi berhasil diambil",
            status: "success",
            data: attendances
        });
    } catch (error: any) {
        console.error("Error in getAttendances:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil data absensi",
            status: "error",
            error: error.message || error
        });
    }
}

export async function getAttendanceById(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const attendance = await prisma.attendance.findUnique({
            where: { id },
            include: {
                student: true,
                class: true,
                subject: true,
                teacher: true,
            }
        });

        if (!attendance) {
            return res.status(404).json({
                message: "Data absensi tidak ditemukan",
                status: "error"
            });
        }

        return res.json({
            message: "Detail absensi berhasil diambil",
            status: "success",
            data: attendance
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil detail absensi",
            status: "error",
            error: error.message || error
        });
    }
}

export async function createAttendance(req: Request, res: Response) {
    try {
        const { studentId, classId, subjectId, teacherId, date, status, note } = req.body;

        if (!studentId || !classId || !subjectId || !date || !status) {
            return res.status(400).json({
                message: "Student ID, Kelas, Mata Pelajaran, Tanggal, dan Status absensi wajib diisi",
                status: "error"
            });
        }

        // Check if attendance already exists for this student on this day for this subject
        const attendanceDate = new Date(date);
        const existing = await prisma.attendance.findFirst({
            where: {
                studentId,
                subjectId,
                date: attendanceDate
            }
        });

        if (existing) {
            return res.status(409).json({
                message: "Absensi siswa untuk mata pelajaran ini pada tanggal tersebut sudah ada",
                status: "error"
            });
        }

        const newAttendance = await prisma.attendance.create({
            data: {
                studentId,
                classId,
                subjectId,
                teacherId: teacherId || null,
                date: attendanceDate,
                status,
                note: note || null
            },
            include: {
                student: true,
                class: true,
                subject: true
            }
        });

        return res.status(201).json({
            message: "Absensi berhasil disimpan",
            status: "success",
            data: newAttendance
        });
    } catch (error: any) {
        console.error("Error in createAttendance:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan saat menyimpan absensi",
            status: "error",
            error: error.message || error
        });
    }
}

export async function updateAttendance(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const { status, note, date } = req.body;

        const attendance = await prisma.attendance.findUnique({
            where: { id }
        });

        if (!attendance) {
            return res.status(404).json({
                message: "Absensi tidak ditemukan",
                status: "error"
            });
        }

        const updatedAttendance = await prisma.attendance.update({
            where: { id },
            data: {
                status: status !== undefined ? status : attendance.status,
                note: note !== undefined ? note : attendance.note,
                date: date !== undefined ? new Date(date) : attendance.date
            },
            include: {
                student: true,
                class: true,
                subject: true
            }
        });

        return res.json({
            message: "Absensi berhasil diperbarui",
            status: "success",
            data: updatedAttendance
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat memperbarui absensi",
            status: "error",
            error: error.message || error
        });
    }
}

export async function deleteAttendance(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const attendance = await prisma.attendance.findUnique({
            where: { id }
        });

        if (!attendance) {
            return res.status(404).json({
                message: "Absensi tidak ditemukan",
                status: "error"
            });
        }

        await prisma.attendance.delete({
            where: { id }
        });

        return res.json({
            message: "Absensi berhasil dihapus",
            status: "success"
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat menghapus absensi",
            status: "error",
            error: error.message || error
        });
    }
}

export async function getAttendancesByClass(req: Request, res: Response) {
    try {
        const classId = req.params.id as string;

        const schoolClass = await prisma.schoolClass.findUnique({
            where: { id: classId }
        });

        if (!schoolClass) {
            return res.status(404).json({
                message: "Kelas tidak ditemukan",
                status: "error"
            });
        }

        const attendances = await prisma.attendance.findMany({
            where: { classId },
            include: {
                student: {
                    select: {
                        id: true,
                        fullName: true,
                        nis: true
                    }
                },
                subject: {
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
            message: "Data absensi kelas berhasil diambil",
            status: "success",
            data: attendances
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil absensi kelas",
            status: "error",
            error: error.message || error
        });
    }
}

export async function getAttendancesByStudent(req: Request, res: Response) {
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

        const attendances = await prisma.attendance.findMany({
            where: { studentId },
            include: {
                class: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                subject: {
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

        // Calculate statistics
        const total = attendances.length;
        const present = attendances.filter(a => a.status === "PRESENT").length;
        const permission = attendances.filter(a => a.status === "PERMISSION").length;
        const sick = attendances.filter(a => a.status === "SICK").length;
        const absent = attendances.filter(a => a.status === "ABSENT").length;
        const late = attendances.filter(a => a.status === "LATE").length;

        const presencePercentage = total > 0 ? Math.round(((total - absent) / total) * 100) : 100;

        return res.json({
            message: "Data absensi siswa berhasil diambil",
            status: "success",
            data: {
                student: {
                    id: student.id,
                    fullName: student.fullName,
                    nis: student.nis
                },
                stats: {
                    total,
                    present,
                    permission,
                    sick,
                    absent,
                    late,
                    presencePercentage
                },
                attendances
            }
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil absensi siswa",
            status: "error",
            error: error.message || error
        });
    }
}

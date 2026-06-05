import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function getSchedules(req: Request, res: Response) {
    try {
        const { classId, teacherId, day, status } = req.query;

        const whereClause: any = {};
        if (classId) {
            whereClause.classId = classId as string;
        }
        if (teacherId) {
            whereClause.teacherId = teacherId as string;
        }
        if (day) {
            whereClause.day = day as string;
        }
        if (status) {
            whereClause.status = status as any;
        }

        const schedules = await prisma.schedule.findMany({
            where: whereClause,
            include: {
                class: {
                    select: {
                        id: true,
                        name: true,
                        grade: true,
                        major: true,
                        academicYear: true,
                    }
                },
                teacher: {
                    select: {
                        id: true,
                        fullName: true,
                        nip: true,
                    }
                },
                subject: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    }
                }
            },
            orderBy: [
                { day: "asc" },
                { startTime: "asc" }
            ]
        });

        return res.json({
            message: "Data jadwal pelajaran berhasil diambil",
            status: "success",
            data: schedules
        });
    } catch (error: any) {
        console.error("Error in getSchedules:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil data jadwal pelajaran",
            status: "error",
            error: error.message || error
        });
    }
}

export async function getScheduleById(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const schedule = await prisma.schedule.findUnique({
            where: { id },
            include: {
                class: true,
                teacher: true,
                subject: true,
            }
        });

        if (!schedule) {
            return res.status(404).json({
                message: "Jadwal pelajaran tidak ditemukan",
                status: "error"
            });
        }

        return res.json({
            message: "Detail jadwal pelajaran berhasil diambil",
            status: "success",
            data: schedule
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil detail jadwal pelajaran",
            status: "error",
            error: error.message || error
        });
    }
}

export async function createSchedule(req: Request, res: Response) {
    try {
        const { day, startTime, endTime, subjectId, teacherId, classId, room, semester, academicYear, status } = req.body;

        if (!day || !startTime || !endTime || !subjectId || !classId || !room || !semester || !academicYear) {
            return res.status(400).json({
                message: "Semua field wajib diisi (hari, jam mulai, jam selesai, mata pelajaran, kelas, ruang, semester, tahun ajaran)",
                status: "error"
            });
        }

        const newSchedule = await prisma.schedule.create({
            data: {
                day,
                startTime,
                endTime,
                subjectId,
                teacherId: teacherId || null,
                classId,
                room,
                semester,
                academicYear,
                status: status || "ACTIVE"
            },
            include: {
                class: true,
                teacher: true,
                subject: true
            }
        });

        return res.status(201).json({
            message: "Jadwal pelajaran berhasil ditambahkan",
            status: "success",
            data: newSchedule
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat menambahkan jadwal pelajaran",
            status: "error",
            error: error.message || error
        });
    }
}

export async function updateSchedule(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const { day, startTime, endTime, subjectId, teacherId, classId, room, semester, academicYear, status } = req.body;

        const schedule = await prisma.schedule.findUnique({
            where: { id }
        });

        if (!schedule) {
            return res.status(404).json({
                message: "Jadwal pelajaran tidak ditemukan",
                status: "error"
            });
        }

        const updatedSchedule = await prisma.schedule.update({
            where: { id },
            data: {
                day: day !== undefined ? day : schedule.day,
                startTime: startTime !== undefined ? startTime : schedule.startTime,
                endTime: endTime !== undefined ? endTime : schedule.endTime,
                subjectId: subjectId !== undefined ? subjectId : schedule.subjectId,
                teacherId: teacherId !== undefined ? teacherId : schedule.teacherId,
                classId: classId !== undefined ? classId : schedule.classId,
                room: room !== undefined ? room : schedule.room,
                semester: semester !== undefined ? semester : schedule.semester,
                academicYear: academicYear !== undefined ? academicYear : schedule.academicYear,
                status: status !== undefined ? status : schedule.status
            },
            include: {
                class: true,
                teacher: true,
                subject: true
            }
        });

        return res.json({
            message: "Jadwal pelajaran berhasil diperbarui",
            status: "success",
            data: updatedSchedule
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat memperbarui jadwal pelajaran",
            status: "error",
            error: error.message || error
        });
    }
}

export async function deleteSchedule(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const schedule = await prisma.schedule.findUnique({
            where: { id }
        });

        if (!schedule) {
            return res.status(404).json({
                message: "Jadwal pelajaran tidak ditemukan",
                status: "error"
            });
        }

        await prisma.schedule.delete({
            where: { id }
        });

        return res.json({
            message: "Jadwal pelajaran berhasil dihapus",
            status: "success"
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat menghapus jadwal pelajaran",
            status: "error",
            error: error.message || error
        });
    }
}

export async function getSchedulesByClass(req: Request, res: Response) {
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

        const schedules = await prisma.schedule.findMany({
            where: { classId },
            include: {
                teacher: true,
                subject: true
            },
            orderBy: [
                { day: "asc" },
                { startTime: "asc" }
            ]
        });

        return res.json({
            message: "Jadwal pelajaran kelas berhasil diambil",
            status: "success",
            data: schedules
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil jadwal kelas",
            status: "error",
            error: error.message || error
        });
    }
}

export async function getSchedulesByTeacher(req: Request, res: Response) {
    try {
        const teacherId = req.params.id as string;

        const teacher = await prisma.teacher.findUnique({
            where: { id: teacherId }
        });

        if (!teacher) {
            return res.status(404).json({
                message: "Guru tidak ditemukan",
                status: "error"
            });
        }

        const schedules = await prisma.schedule.findMany({
            where: { teacherId },
            include: {
                class: true,
                subject: true
            },
            orderBy: [
                { day: "asc" },
                { startTime: "asc" }
            ]
        });

        return res.json({
            message: "Jadwal mengajar guru berhasil diambil",
            status: "success",
            data: schedules
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil jadwal mengajar guru",
            status: "error",
            error: error.message || error
        });
    }
}

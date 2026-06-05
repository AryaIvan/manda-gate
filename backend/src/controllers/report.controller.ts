import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function getSummaryReport(req: Request, res: Response) {
    try {
        const studentCount = await prisma.student.count();
        const teacherCount = await prisma.teacher.count();
        const classCount = await prisma.schoolClass.count();
        const subjectCount = await prisma.subject.count();
        const scheduleCount = await prisma.schedule.count();
        
        const activeLeaveRequests = await prisma.leaveRequest.count({
            where: { status: "Menunggu" }
        });

        const achievementsCount = await prisma.achievement.count();

        return res.json({
            message: "Data ringkasan laporan berhasil diambil",
            status: "success",
            data: {
                studentCount,
                teacherCount,
                classCount,
                subjectCount,
                scheduleCount,
                activeLeaveRequests,
                achievementsCount
            }
        });
    } catch (error: any) {
        console.error("Error in getSummaryReport:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil ringkasan laporan",
            status: "error",
            error: error.message || error
        });
    }
}

export async function getAttendanceReport(req: Request, res: Response) {
    try {
        const { classId } = req.query;

        const whereClause: any = {};
        if (classId) {
            whereClause.classId = classId as string;
        }

        const attendances = await prisma.attendance.findMany({
            where: whereClause
        });

        const total = attendances.length;
        const present = attendances.filter(a => a.status === "PRESENT").length;
        const permission = attendances.filter(a => a.status === "PERMISSION").length;
        const sick = attendances.filter(a => a.status === "SICK").length;
        const absent = attendances.filter(a => a.status === "ABSENT").length;
        const late = attendances.filter(a => a.status === "LATE").length;

        const presencePercentage = total > 0 ? Math.round(((total - absent) / total) * 100) : 100;

        return res.json({
            message: "Laporan absensi berhasil diambil",
            status: "success",
            data: {
                total,
                present,
                permission,
                sick,
                absent,
                late,
                presencePercentage
            }
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil laporan absensi",
            status: "error",
            error: error.message || error
        });
    }
}

export async function getGradesReport(req: Request, res: Response) {
    try {
        const { classId } = req.query;

        const whereClause: any = {};
        if (classId) {
            whereClause.classId = classId as string;
        }

        const grades = await prisma.grade.findMany({
            where: whereClause
        });

        const total = grades.length;
        const averageScore = total > 0 
            ? Number((grades.reduce((sum, g) => sum + g.finalScore, 0) / total).toFixed(2)) 
            : 0;

        const distribution = {
            A: grades.filter(g => g.predicate === "A").length,
            B: grades.filter(g => g.predicate === "B").length,
            C: grades.filter(g => g.predicate === "C").length,
            D: grades.filter(g => g.predicate === "D").length,
            E: grades.filter(g => g.predicate === "E").length,
        };

        const highest = total > 0 ? Math.max(...grades.map(g => g.finalScore)) : 0;
        const lowest = total > 0 ? Math.min(...grades.map(g => g.finalScore)) : 0;

        return res.json({
            message: "Laporan nilai berhasil diambil",
            status: "success",
            data: {
                total,
                averageScore,
                distribution,
                highest,
                lowest
            }
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil laporan nilai",
            status: "error",
            error: error.message || error
        });
    }
}

export async function getLeaveRequestsReport(req: Request, res: Response) {
    try {
        const { classId } = req.query;
        const whereClause: any = {};
        if (classId) {
            whereClause.classId = classId as string;
        }

        const requests = await prisma.leaveRequest.findMany({
            where: whereClause
        });

        const total = requests.length;
        const pending = requests.filter(r => r.status === "Menunggu").length;
        const approved = requests.filter(r => r.status === "Disetujui").length;
        const rejected = requests.filter(r => r.status === "Ditolak").length;

        return res.json({
            message: "Laporan surat izin berhasil diambil",
            status: "success",
            data: {
                total,
                pending,
                approved,
                rejected
            }
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil laporan surat izin",
            status: "error",
            error: error.message || error
        });
    }
}

export async function getAchievementsReport(req: Request, res: Response) {
    try {
        const { classId } = req.query;
        const whereClause: any = {};
        if (classId) {
            whereClause.classId = classId as string;
        }

        const achievements = await prisma.achievement.findMany({
            where: whereClause
        });

        const total = achievements.length;
        const levelStats = {
            Kabupaten: achievements.filter(a => a.level === "Kabupaten").length,
            Provinsi: achievements.filter(a => a.level === "Provinsi").length,
            Nasional: achievements.filter(a => a.level === "Nasional").length,
        };

        return res.json({
            message: "Laporan prestasi berhasil diambil",
            status: "success",
            data: {
                total,
                levelStats
            }
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil laporan prestasi",
            status: "error",
            error: error.message || error
        });
    }
}

export async function getStudentsReport(req: Request, res: Response) {
    try {
        const { status } = req.query;
        const whereClause: any = {};
        if (status) {
            whereClause.status = status as any;
        }

        const students = await prisma.student.findMany({
            where: whereClause,
            include: {
                studentClasses: {
                    where: { status: "ACTIVE" },
                    include: { class: true }
                }
            },
            orderBy: {
                fullName: "asc"
            }
        });

        const formatted = students.map(s => {
            const currentClass = s.studentClasses[0]?.class?.name || "Belum ada kelas";
            return {
                id: s.id,
                nis: s.nis,
                nisn: s.nisn,
                fullName: s.fullName,
                gender: s.gender,
                className: currentClass,
                status: s.status
            };
        });

        return res.json({
            message: "Laporan data siswa berhasil diambil",
            status: "success",
            data: formatted
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil laporan data siswa",
            status: "error",
            error: error.message || error
        });
    }
}

export async function getTeachersReport(req: Request, res: Response) {
    try {
        const teachers = await prisma.teacher.findMany({
            include: {
                subjects: {
                    select: { name: true }
                },
                homeroomClasses: {
                    select: { name: true }
                }
            },
            orderBy: {
                fullName: "asc"
            }
        });

        const formatted = teachers.map(t => {
            return {
                id: t.id,
                nip: t.nip,
                fullName: t.fullName,
                gender: t.gender,
                subject: t.subject || "Umum",
                isHomeroomTeacher: t.homeroomClasses.length > 0,
                homeroomClassName: t.homeroomClasses[0]?.name || null,
                status: t.status
            };
        });

        return res.json({
            message: "Laporan data guru berhasil diambil",
            status: "success",
            data: formatted
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil laporan data guru",
            status: "error",
            error: error.message || error
        });
    }
}

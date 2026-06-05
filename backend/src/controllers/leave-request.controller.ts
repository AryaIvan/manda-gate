import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function getLeaveRequests(req: Request, res: Response) {
    try {
        const { classId, studentId, status } = req.query;

        const whereClause: any = {};
        if (classId) {
            whereClause.classId = classId as string;
        }
        if (studentId) {
            whereClause.studentId = studentId as string;
        }
        if (status) {
            whereClause.status = status as any;
        }

        const leaveRequests = await prisma.leaveRequest.findMany({
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
            message: "Data surat izin berhasil diambil",
            status: "success",
            data: leaveRequests
        });
    } catch (error: any) {
        console.error("Error in getLeaveRequests:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil data surat izin",
            status: "error",
            error: error.message || error
        });
    }
}

export async function getLeaveRequestById(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const leaveRequest = await prisma.leaveRequest.findUnique({
            where: { id },
            include: {
                student: true,
                class: true
            }
        });

        if (!leaveRequest) {
            return res.status(404).json({
                message: "Surat izin tidak ditemukan",
                status: "error"
            });
        }

        return res.json({
            message: "Detail surat izin berhasil diambil",
            status: "success",
            data: leaveRequest
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil detail surat izin",
            status: "error",
            error: error.message || error
        });
    }
}

export async function createLeaveRequest(req: Request, res: Response) {
    try {
        const { studentId, classId, type, date, description } = req.body;

        if (!studentId || !classId || !type || !date || !description) {
            return res.status(400).json({
                message: "Siswa, kelas, jenis izin, tanggal, dan deskripsi wajib diisi",
                status: "error"
            });
        }

        const newLeaveRequest = await prisma.leaveRequest.create({
            data: {
                studentId,
                classId,
                type,
                date: new Date(date),
                description,
                status: "Menunggu"
            },
            include: {
                student: true,
                class: true
            }
        });

        return res.status(201).json({
            message: "Surat izin berhasil diajukan",
            status: "success",
            data: newLeaveRequest
        });
    } catch (error: any) {
        console.error("Error in createLeaveRequest:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengajukan surat izin",
            status: "error",
            error: error.message || error
        });
    }
}

export async function updateLeaveRequest(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const { type, date, description, status } = req.body;

        const leaveRequest = await prisma.leaveRequest.findUnique({
            where: { id }
        });

        if (!leaveRequest) {
            return res.status(404).json({
                message: "Surat izin tidak ditemukan",
                status: "error"
            });
        }

        const updated = await prisma.leaveRequest.update({
            where: { id },
            data: {
                type: type !== undefined ? type : leaveRequest.type,
                date: date !== undefined ? new Date(date) : leaveRequest.date,
                description: description !== undefined ? description : leaveRequest.description,
                status: status !== undefined ? status : leaveRequest.status
            },
            include: {
                student: true,
                class: true
            }
        });

        return res.json({
            message: "Surat izin berhasil diperbarui",
            status: "success",
            data: updated
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat memperbarui surat izin",
            status: "error",
            error: error.message || error
        });
    }
}

export async function approveLeaveRequest(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const leaveRequest = await prisma.leaveRequest.findUnique({
            where: { id }
        });

        if (!leaveRequest) {
            return res.status(404).json({
                message: "Surat izin tidak ditemukan",
                status: "error"
            });
        }

        const updated = await prisma.leaveRequest.update({
            where: { id },
            data: {
                status: "Disetujui"
            },
            include: {
                student: true,
                class: true
            }
        });

        return res.json({
            message: "Surat izin berhasil disetujui",
            status: "success",
            data: updated
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat menyetujui surat izin",
            status: "error",
            error: error.message || error
        });
    }
}

export async function rejectLeaveRequest(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const leaveRequest = await prisma.leaveRequest.findUnique({
            where: { id }
        });

        if (!leaveRequest) {
            return res.status(404).json({
                message: "Surat izin tidak ditemukan",
                status: "error"
            });
        }

        const updated = await prisma.leaveRequest.update({
            where: { id },
            data: {
                status: "Ditolak"
            },
            include: {
                student: true,
                class: true
            }
        });

        return res.json({
            message: "Surat izin berhasil ditolak",
            status: "success",
            data: updated
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat menolak surat izin",
            status: "error",
            error: error.message || error
        });
    }
}

export async function deleteLeaveRequest(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const leaveRequest = await prisma.leaveRequest.findUnique({
            where: { id }
        });

        if (!leaveRequest) {
            return res.status(404).json({
                message: "Surat izin tidak ditemukan",
                status: "error"
            });
        }

        await prisma.leaveRequest.delete({
            where: { id }
        });

        return res.json({
            message: "Surat izin berhasil dihapus",
            status: "success"
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat menghapus surat izin",
            status: "error",
            error: error.message || error
        });
    }
}

export async function getLeaveRequestsByClass(req: Request, res: Response) {
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

        const leaveRequests = await prisma.leaveRequest.findMany({
            where: { classId },
            include: {
                student: {
                    select: {
                        id: true,
                        fullName: true,
                        nis: true
                    }
                }
            },
            orderBy: {
                date: "desc"
            }
        });

        return res.json({
            message: "Surat izin kelas berhasil diambil",
            status: "success",
            data: leaveRequests
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil surat izin kelas",
            status: "error",
            error: error.message || error
        });
    }
}

export async function getLeaveRequestsByStudent(req: Request, res: Response) {
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

        const leaveRequests = await prisma.leaveRequest.findMany({
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
            message: "Surat izin siswa berhasil diambil",
            status: "success",
            data: leaveRequests
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil surat izin siswa",
            status: "error",
            error: error.message || error
        });
    }
}

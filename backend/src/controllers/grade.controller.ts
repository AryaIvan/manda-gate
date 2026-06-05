import { Request, Response } from "express";
import { prisma } from "../config/prisma";

function calculateFinalScore(
    assignmentScore: number,
    dailyScore: number,
    midtermScore: number,
    finalExamScore: number
) {
    return (
        assignmentScore * 0.2 +
        dailyScore * 0.2 +
        midtermScore * 0.25 +
        finalExamScore * 0.35
    );
}

function getPredicate(score: number): string {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "E";
}

export async function getGrades(req: Request, res: Response) {
    try {
        const { classId, studentId, subjectId, predicate } = req.query;

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
        if (predicate) {
            whereClause.predicate = predicate as string;
        }

        const grades = await prisma.grade.findMany({
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
                student: {
                    fullName: "asc"
                }
            }
        });

        return res.json({
            message: "Data nilai berhasil diambil",
            status: "success",
            data: grades
        });
    } catch (error: any) {
        console.error("Error in getGrades:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil data nilai",
            status: "error",
            error: error.message || error
        });
    }
}

export async function getGradeById(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const grade = await prisma.grade.findUnique({
            where: { id },
            include: {
                student: true,
                class: true,
                subject: true,
                teacher: true,
            }
        });

        if (!grade) {
            return res.status(404).json({
                message: "Data nilai tidak ditemukan",
                status: "error"
            });
        }

        return res.json({
            message: "Detail nilai berhasil diambil",
            status: "success",
            data: grade
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil detail nilai",
            status: "error",
            error: error.message || error
        });
    }
}

export async function createGrade(req: Request, res: Response) {
    try {
        const { studentId, classId, subjectId, teacherId, assignmentScore, dailyScore, midtermScore, finalExamScore, note } = req.body;

        if (!studentId || !classId || !subjectId) {
            return res.status(400).json({
                message: "Student ID, Kelas, dan Mata Pelajaran wajib diisi",
                status: "error"
            });
        }

        // Check if grade already exists for this student for this subject
        const existing = await prisma.grade.findFirst({
            where: {
                studentId,
                subjectId
            }
        });

        if (existing) {
            return res.status(409).json({
                message: "Nilai siswa untuk mata pelajaran ini sudah ada. Silakan perbarui nilai yang ada.",
                status: "error"
            });
        }

        const assignVal = assignmentScore !== undefined ? Number(assignmentScore) : 0;
        const dailyVal = dailyScore !== undefined ? Number(dailyScore) : 0;
        const midtermVal = midtermScore !== undefined ? Number(midtermScore) : 0;
        const finalExamVal = finalExamScore !== undefined ? Number(finalExamScore) : 0;

        const finalScore = Number(calculateFinalScore(assignVal, dailyVal, midtermVal, finalExamVal).toFixed(2));
        const predicate = getPredicate(finalScore);

        const newGrade = await prisma.grade.create({
            data: {
                studentId,
                classId,
                subjectId,
                teacherId: teacherId || null,
                assignmentScore: assignVal,
                dailyScore: dailyVal,
                midtermScore: midtermVal,
                finalExamScore: finalExamVal,
                finalScore,
                predicate,
                note: note || null
            },
            include: {
                student: true,
                class: true,
                subject: true
            }
        });

        return res.status(201).json({
            message: "Nilai berhasil disimpan",
            status: "success",
            data: newGrade
        });
    } catch (error: any) {
        console.error("Error in createGrade:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan saat menyimpan nilai",
            status: "error",
            error: error.message || error
        });
    }
}

export async function updateGrade(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const { assignmentScore, dailyScore, midtermScore, finalExamScore, note } = req.body;

        const grade = await prisma.grade.findUnique({
            where: { id }
        });

        if (!grade) {
            return res.status(404).json({
                message: "Data nilai tidak ditemukan",
                status: "error"
            });
        }

        const assignVal = assignmentScore !== undefined ? Number(assignmentScore) : grade.assignmentScore;
        const dailyVal = dailyScore !== undefined ? Number(dailyScore) : grade.dailyScore;
        const midtermVal = midtermScore !== undefined ? Number(midtermScore) : grade.midtermScore;
        const finalExamVal = finalExamScore !== undefined ? Number(finalExamScore) : grade.finalExamScore;

        const finalScore = Number(calculateFinalScore(assignVal, dailyVal, midtermVal, finalExamVal).toFixed(2));
        const predicate = getPredicate(finalScore);

        const updatedGrade = await prisma.grade.update({
            where: { id },
            data: {
                assignmentScore: assignVal,
                dailyScore: dailyVal,
                midtermScore: midtermVal,
                finalExamScore: finalExamVal,
                finalScore,
                predicate,
                note: note !== undefined ? note : grade.note
            },
            include: {
                student: true,
                class: true,
                subject: true
            }
        });

        return res.json({
            message: "Nilai berhasil diperbarui",
            status: "success",
            data: updatedGrade
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat memperbarui nilai",
            status: "error",
            error: error.message || error
        });
    }
}

export async function deleteGrade(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const grade = await prisma.grade.findUnique({
            where: { id }
        });

        if (!grade) {
            return res.status(404).json({
                message: "Data nilai tidak ditemukan",
                status: "error"
            });
        }

        await prisma.grade.delete({
            where: { id }
        });

        return res.json({
            message: "Nilai berhasil dihapus",
            status: "success"
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat menghapus nilai",
            status: "error",
            error: error.message || error
        });
    }
}

export async function getGradesByClass(req: Request, res: Response) {
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

        const grades = await prisma.grade.findMany({
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
                student: {
                    fullName: "asc"
                }
            }
        });

        return res.json({
            message: "Data nilai kelas berhasil diambil",
            status: "success",
            data: grades
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil nilai kelas",
            status: "error",
            error: error.message || error
        });
    }
}

export async function getGradesByStudent(req: Request, res: Response) {
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

        const grades = await prisma.grade.findMany({
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
                },
                teacher: {
                    select: {
                        id: true,
                        fullName: true
                    }
                }
            },
            orderBy: {
                subject: {
                    name: "asc"
                }
            }
        });

        return res.json({
            message: "Data nilai siswa berhasil diambil",
            status: "success",
            data: grades
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan saat mengambil nilai siswa",
            status: "error",
            error: error.message || error
        });
    }
}

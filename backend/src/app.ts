import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./config/prisma";
import authRoutes from "./routes/auth.routes";
import classRoutes from "./routes/class.routes";
import studentRoutes from "./routes/student.routes";
import teacherRoutes from "./routes/teacher.routes";
import subjectRoutes from "./routes/subject.routes";
import settingRoutes from "./routes/setting.routes";
import announcementRoutes from "./routes/announcement.routes";
import scheduleRoutes from "./routes/schedule.routes";
import attendanceRoutes from "./routes/attendance.routes";
import gradeRoutes from "./routes/grade.routes";
import leaveRequestRoutes from "./routes/leave-request.routes";
import achievementRoutes from "./routes/achievement.routes";
import reportRoutes from "./routes/report.routes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message: "MANDA Gate API is running",
    status: "success",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    message: "Backend connected successfully",
    app: process.env.APP_NAME,
    environment: process.env.APP_ENV,
  });
});

app.get("/api/db-check", async (req, res) => {
  try {
    await prisma.$connect();

    res.json({
      message: "Database connected successfully",
      database: "manda_gate",
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed",
      status: "error",
      error,
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api", settingRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/attendances", attendanceRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/leave-requests", leaveRequestRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/reports", reportRoutes);

export default app;
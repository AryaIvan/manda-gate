import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../config/prisma";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Token tidak ditemukan",
        status: "error",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Format token tidak valid",
        status: "error",
      });
    }

    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "User tidak ditemukan",
        status: "error",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        message: "Akun tidak aktif",
        status: "error",
      });
    }

    (req as any).user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token tidak valid atau sudah expired",
      status: "error",
    });
  }
}
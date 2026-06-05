import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { generateToken } from "../utils/jwt";

export async function register(req: Request, res: Response) {
  try {
    const { name, email, username, password, role } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({
        message: "Nama, email, username, dan password wajib diisi",
        status: "error",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email atau username sudah digunakan",
        status: "error",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        role: role || "STUDENT",
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "Register berhasil",
      status: "success",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan saat register",
      status: "error",
      error,
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Email/username dan password wajib diisi",
        status: "error",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Email/username atau password salah",
        status: "error",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        message: "Akun tidak aktif",
        status: "error",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Email/username atau password salah",
        status: "error",
      });
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLogin: new Date(),
      },
    });

    const token = generateToken({
      userId: user.id,
      role: user.role,
    });

    return res.json({
      message: "Login berhasil",
      status: "success",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          status: user.status,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan saat login",
      status: "error",
      error,
    });
  }
}

export async function profile(req: Request, res: Response) {
  try {
    const user = (req as any).user;

    return res.json({
      message: "Profile berhasil diambil",
      status: "success",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan saat mengambil profile",
      status: "error",
      error,
    });
  }
}
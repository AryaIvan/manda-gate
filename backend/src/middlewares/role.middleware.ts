import { NextFunction, Request, Response } from "express";
import { UserRole } from "@prisma/client";

export function roleMiddleware(allowedRoles: (UserRole | string)[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
        status: "error",
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        message: "Akses ditolak - Anda tidak memiliki izin untuk mengakses resource ini",
        status: "error",
      });
    }

    next();
  };
}

import jwt, { SignOptions } from "jsonwebtoken";

type JwtPayload = {
  userId: string;
  role: string;
};

export function generateToken(payload: JwtPayload) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET belum diatur di .env");
  }

  const expiresIn = (process.env.JWT_EXPIRES_IN ||
    "7d") as SignOptions["expiresIn"];

  return jwt.sign(payload, secret, {
    expiresIn,
  });
}

export function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET belum diatur di .env");
  }

  return jwt.verify(token, secret) as JwtPayload;
}
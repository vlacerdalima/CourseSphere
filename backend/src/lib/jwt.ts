import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

export type JwtPayload = { id: string; email: string };

export function sign(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verify(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}

import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { HoraAtual, LogEvent } from "../funcGlobal";
import { tokenJaUsado } from "../mongo";

// Extender o Request para incluir `userId`
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

function verificarTokenJWT(token: string): JwtPayload & { id: string; ip: string } {
  if (!token) throw new Error("Token ausente");

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET não definido");

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload & { id: string; ip: string };
    return decoded;
  } catch (err) {
    throw new Error("Token inválido ou expirado");
  }
}

// Middleware principal
export async function autenticar(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const UserIp = req.headers["userip"] as string;

    if (!authHeader) return res.status(401).json({ erro: "Token ausente" });
    if (!UserIp) return res.status(400).json({ erro: "IP do usuário ausente" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ erro: "Token ausente" });

    // Verifica validade JWT
    const decoded = verificarTokenJWT(token);

    // Verifica se token já foi usado
    const usado = await tokenJaUsado(token);
    if (usado) return res.status(403).json({ erro: "Token já usado ou inválido" });
    LogEvent(`[${HoraAtual()}] verify token in mongodb: ${usado}`);

    if (UserIp !== decoded.ip)
      return res.status(403).json({ erro: "IP do usuário não corresponde ao token" });

    LogEvent(`[${HoraAtual()}] IP do usuário corresponde ao token: ${UserIp}`);

    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(403).json({ erro: "Token inválido ou expirado" });
  }
}
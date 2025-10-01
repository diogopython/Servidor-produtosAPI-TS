import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { LogEvent, ValidIP } from "../funcGlobal";
import { tokenJaUsado, HashTokenJaUsado } from "../mongo";

// Extender o Request para incluir `userId`
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userIp?: string;
    }
  }
}

export function verificarTokenJWT(token: string): JwtPayload & { id: string; ip: string; hash: string } {
  if (!token) throw new Error("Token ausente");

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET não definido");

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload & { id: string; ip: string; hash: string };
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

    const ip_valido = await ValidIP(UserIp, req);
    if (!ip_valido) return res.status(400).json({ erro: "IP invalido" })

    // Verifica validade JWT
    const decoded = verificarTokenJWT(token);

    // Verifica se token já foi usado
    const usado = await tokenJaUsado(token);
    if (usado) {
      return res.status(403).json({ erro: "Token já usado ou inválido" });
    }
    LogEvent(`verify token in mongodb: ${usado}`);

    if (UserIp !== decoded.ip){
      LogEvent(`erro IP do usuário não corresponde ao token`)
      return res.status(403).json({ erro: "IP do usuário não corresponde ao token" });
    }

    const hash_usado = await HashTokenJaUsado(decoded.hash)
    if (!hash_usado) {
      LogEvent(`Hash de integridade do token violado`)
      return res.status(403).json({ erro: "Hash de integridade do token violado" });
    }

    LogEvent(`Token verificado com sucesso: ${UserIp}`);

    req.userId = decoded.id;
    req.userIp = UserIp;
    next();
  } catch (err) {
    return res.status(403).json({ erro: "Token inválido ou expirado" });
  }
}
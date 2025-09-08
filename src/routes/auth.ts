import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import * as jwt from 'jsonwebtoken'; // Import “namespace” obrigatório no TS
import pool from "../db";
import { autenticar } from "./autenticar";
import { registrarTokenUsado } from "../mongo"
import { HoraAtual, LogEvent } from "../funcGlobal";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

interface User {
  id: number;
  nome: string;
  email: string;
  senha: string;
}

// Rota: Registro
router.post("/register", async (req: Request, res: Response) => {
  const { nome, email, senha } = req.body;
  LogEvent(`[${HoraAtual()}][REGISTER][POST] - Tentativa de registro do usuário: ${email}`);

  try {
    const hashed = await bcrypt.hash(senha, 10);
    const conn = await pool.getConnection();
    await conn.query("INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)", [
      nome,
      email,
      hashed,
    ]);
    conn.release();

    LogEvent(`[${HoraAtual()}][REGISTER][POST] - Usuário registrado com sucesso: ${email}`);
    res.status(201).json({ msg: "Usuário registrado com sucesso" });
  } catch (err: any) {
    LogEvent(
      `[${HoraAtual()}][REGISTER][POST][ERROR] - Erro ao registrar usuário: ${email} - ${err.message}`
    );
    res.status(500).json({ erro: "Erro inesperado no login" });
  }
});

// Rota: Login
router.post("/login", async (req: Request, res: Response) => {
  const { email, senha } = req.body;
  const UserIp = req.headers["userip"] as string;
  LogEvent(`[${UserIp || "*null*"}][${HoraAtual()}][LOGIN][POST] - Tentativa de login: ${email}`);

  try {
    const conn = await pool.getConnection();

    const [rows] = await conn.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    conn.release();

    if (!rows) {
      LogEvent(`[${UserIp || "*null*"}][${HoraAtual()}] Usuario ou senha incorretos: ${email}`);
      return res.status(401).json({ erro: "Usuario ou senha incorretos" });
    }

    const valido = await bcrypt.compare(senha, rows.senha);
    if (!valido) return res.status(401).json({ erro: "Usuario ou senha incorretos" });

    const jwtSecret = process.env.JWT_SECRET as string;
    const expiresIn: string | number = process.env.JWT_EXPIRES_IN || "1h";

    const payload = { id: rows.id, ip: UserIp };
    const token = jwt.sign(payload, jwtSecret, { expiresIn } as any);

    LogEvent(`[${UserIp || "*null*"}][${HoraAtual()}] Login bem-sucedido: ${email}`);
    res.json({ tokenUS: token, username: rows.nome });
  } catch (err: any) {
    LogEvent(
      `[${UserIp || "*null*"}][${HoraAtual()}][LOGIN][POST][ERROR] - Erro no login do usuário ${email} - ${err.message}`
    );
    res.status(500).json({ erro: "Erro inesperado no login" });
  }
});

// Rota: Logout
router.post("/logout", autenticar, async (req: Request, res: Response) => {
  LogEvent(`[${req.userIp || "*null*"}][${HoraAtual()}][LOGOUT][POST] - Logout solicitado pelo usuário ID: ${req.userId}`);
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    LogEvent(
      `[${req.userIp || "*null*"}][${HoraAtual()}][LOGOUT][POST] - Falha: Token não fornecido para logout do usuário ID: ${req.userId}`
    );
    return res.status(401).json({ erro: "Token não fornecido" });
  }

  try {
    const resp = await registrarTokenUsado(token);

    if (!resp[0]) {
      LogEvent(
        `[${req.userIp || "*null*"}][${HoraAtual()}][LOGOUT][POST][ERROR] - Erro ao registrar token usado no logout do usuário ID: ${req.userId} - ${resp[1].message}`
      );
      return res.status(500).json({ erro: resp[1].message });
    }

    LogEvent(`[${req.userIp || "*null*"}][${HoraAtual()}][LOGOUT][POST] - Logout realizado com sucesso para usuário ID: ${req.userId}`);
    return res.status(200).json({ mensagem: "Logout realizado com sucesso." });
  } catch (error: any) {
    LogEvent(
      `[${req.userIp || "*null*"}][${HoraAtual()}][LOGOUT][POST][ERROR] - Erro inesperado no logout do usuário ID: ${req.userId} - ${error.message}`
    );
    return res.status(500).json({ erro: "Erro inesperado no logout." });
  }
});

export default router;
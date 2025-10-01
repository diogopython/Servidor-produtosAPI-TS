import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import * as jwt from 'jsonwebtoken'; // Import “namespace” obrigatório no TS
import { v4 as uuidv4 } from 'uuid';
import { autenticar, verificarTokenJWT } from "./autenticar";
import { registrarTokenUsado, registrarHashToken, HashTokenJaUsado } from "../mongo"
import { LogEvent } from "../funcGlobal";
import dotenv from "dotenv";
import pool from "../db";
import * as Mail from "../mail";

dotenv.config();

const router = Router();

// Rota: Registro
router.post("/register", async (req: Request, res: Response) => {
  const { nome, email, senha } = req.body;
  LogEvent(`[REGISTER][POST] - Tentativa de registro do usuário: ${email}`);

  try {
    const hashed = await bcrypt.hash(senha, 10);
    const conn = await pool.getConnection();
    await conn.query("INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)", [
      nome,
      email,
      hashed,
    ]);
    conn.release();

    await Promise.all([
      Mail.BoasVindas(nome, email),
      Mail.AvisoRegistro(nome, email)
    ]);

    LogEvent(`[REGISTER][POST] - Usuário registrado com sucesso: ${email}`);
    res.status(201).json({ msg: "Usuário registrado com sucesso" });
  } catch (err: any) {
    LogEvent(
      `[REGISTER][POST][ERROR] - Erro ao registrar usuário: ${email} - ${err.message}`
    );
    res.status(500).json({ erro: "Erro inesperado no login" });
  }
});

// Rota: Login
router.post("/login", async (req: Request, res: Response) => {
  const { email, senha } = req.body;
  const UserIp = req.headers["userip"] as string;

  if (!email) return res.status(400).json({ erro: "Email do usuario ausente" });
  if (!senha) return res.status(400).json({ erro: "Senha do usuario ausente" });
  if (!UserIp) return res.status(400).json({ erro: "IP do usuario ausente" });

  LogEvent(`[${UserIp}][LOGIN][POST] - Tentativa de login: ${email}`);

  try {
    const conn = await pool.getConnection();

    const [rows] = await conn.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    conn.release();

    if (!rows) {
      LogEvent(`[${UserIp}] Usuario ou senha incorretos: ${email}`);
      return res.status(401).json({ erro: "Usuario ou senha incorretos" });
    }

    const valido = await bcrypt.compare(senha, rows.senha);
    if (!valido) return res.status(401).json({ erro: "Usuario ou senha incorretos" });

    const jwtSecret = process.env.JWT_SECRET as string;
    const expiresIn: string | number = process.env.JWT_EXPIRES_IN || "1h";

    const hash = uuidv4();

    await registrarHashToken(hash);

    const payload = { id: rows.id, ip: UserIp, hash };
    const token = jwt.sign(payload, jwtSecret, { expiresIn } as any);

    Mail.AvisoLogin(rows.nome, rows.email, UserIp)

    LogEvent(`[${UserIp}] Login bem-sucedido: ${email}`);
    res.json({ tokenUS: token, username: rows.nome });
  } catch (err: any) {
    LogEvent(
      `[${UserIp}][LOGIN][POST][ERROR] - Erro no login do usuário ${email} - ${err.message}`
    );
    res.status(500).json({ erro: "Erro inesperado no login" });
  }
});

// Rota: Logout
router.post("/logout", autenticar, async (req: Request, res: Response) => {
  LogEvent(`[${req.userIp}][LOGOUT][POST] - Logout solicitado pelo usuário ID: ${req.userId}`);
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    LogEvent(
      `[${req.userIp}][LOGOUT][POST] - Falha: Token não fornecido para logout do usuário ID: ${req.userId}`
    );
    return res.status(401).json({ erro: "Token não fornecido" });
  }

  try {
    const resp = await registrarTokenUsado(token);

    if (!resp[0]) {
      LogEvent(
        `[${req.userIp}][LOGOUT][POST][ERROR] - Erro ao registrar token usado no logout do usuário ID: ${req.userId} - ${resp[1].message}`
      );
      return res.status(500).json({ erro: resp[1].message });
    }

    LogEvent(`[${req.userIp}][LOGOUT][POST] - Logout realizado com sucesso para usuário ID: ${req.userId}`);
    return res.status(200).json({ msg: "Logout realizado com sucesso." });
  } catch (error: any) {
    LogEvent(
      `[${req.userIp}][LOGOUT][POST][ERROR] - Erro inesperado no logout do usuário ID: ${req.userId} - ${error.message}`
    );
    return res.status(500).json({ erro: "Erro inesperado no logout." });
  }
});

router.delete("/delacct", autenticar, async (req: Request, res: Response) => {
  LogEvent(
    `[${req.userIp}][DELACCT][DELETE] - Solicitação para deletar conta do usuário ID: ${req.userId}`
  );

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    LogEvent(
      `[${req.userIp}][DELACCT][DELETE] - Falha: Token não fornecido (usuário ID: ${req.userId})`
    );
    return res.status(401).json({ erro: "Token não fornecido" });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.execute(
      "SELECT * FROM users WHERE id = ?",
      [req.userId]
    );
    conn.release();
    await conn.beginTransaction();

    // Deleta produtos relacionados ao usuário
    await conn.execute("DELETE FROM produtos WHERE user_id = ?", [req.userId]);

    // Deleta o usuário
    await conn.execute("DELETE FROM users WHERE id = ?", [req.userId]);

    await conn.commit();
    LogEvent(
      `[${req.userIp}][DELACCT][DELETE] - Conta do usuário ID: ${req.userId} deletada com sucesso`
    );

    Mail.AvisoExclusaoConta(rows.nome, rows.email)

    return res.status(200).json({ msg: "Conta deletada com sucesso" });

  } catch (err: any) {
    if (conn) await conn.rollback();
    LogEvent(
      `[${req.userIp}][DELACCT][DELETE][ERROR] - Erro ao deletar conta do usuário ID: ${req.userId} - ${err.message}`
    );
    return res.status(500).json({ erro: "Erro inesperado ao deletar conta." });
  } finally {
    if (conn) conn.release();
  }
});

router.post("/GeCredential", autenticar,async (req: Request, res: Response) => {
  const UserIp = req.headers["userip"] as string;

  LogEvent(`[${UserIp}][LOGIN][POST] - Tentativa de gerar a credencial: ${req.userId}`);

  try {
    const conn = await pool.getConnection();

    const [rows] = await conn.execute(
      "SELECT * FROM users WHERE id = ?",
      [req.userId]
    );
    conn.release();

    const jwtSecret = process.env.JWT_SECRET as string;

    const hash = uuidv4()
    const payload = { id: rows.id, hash};
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '30d' } as any);

    await registrarHashToken(hash)

    LogEvent(`[${UserIp || "*null*"}] Credencial gerada bem-sucedido: ${req.userId}`);
    res.json({ tokenUS: token });
  } catch (err: any) {
    LogEvent(
      `[${UserIp || "*null*"}][LOGIN][POST][ERROR] - Erro ao gerar a credencial do usuário ${req.userId} - ${err.message}`
    );
    res.status(500).json({ erro: "Erro inesperado ao gerar a credencial" });
  }
});

router.post("/LoginByCredential", async (req: Request, res: Response) => {
  const { cred } = req.body;
  const UserIp = req.headers["userip"] as string;

  if (!cred) return res.status(400).json({ erro: "credencial ausente" });
  if (!UserIp) return res.status(400).json({ erro: "IP ausente" });

  LogEvent(`[${UserIp || "*null*"}][LOGIN][POST] - Tentativa de login por credencial`);

  let rows;
  try {
    const conn = await pool.getConnection();

    const {id, hash} = verificarTokenJWT(cred);

    const valid = HashTokenJaUsado(hash)
    if (!valid) {
      return res.status(401).json({ erro: "Hash do token nao esta cadastrado no banco de dados" })
    }

    [rows] = await conn.execute(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    conn.release();

    if (!rows) {
      LogEvent(`[${UserIp || "*null*"}] Nao foi possivel o login por credencial: ${id}`);
      return res.status(401).json({ erro: "Nao foi possivel o login por credencial." });
    }

    const jwtSecret = process.env.JWT_SECRET as string;
    const expiresIn: string = process.env.JWT_EXPIRES_IN || "1h";

    const hash_ = uuidv4()
    const payload = { id: rows.id, ip: UserIp, hash: hash_ };
    const token = jwt.sign(payload, jwtSecret, { expiresIn } as any);

    await registrarHashToken(hash_)

    LogEvent(`[${UserIp || "*null*"}] Login por credencial bem-sucedido: ${rows.email}`);
    res.json({ tokenUS: token, username: rows.nome });
  } catch (err: any) {
    LogEvent(
      `[${UserIp || "*null*"}][LOGIN][POST][ERROR] - Erro no login do usuário ${rows.email} - ${err.message}`
    );
    res.status(500).json({ erro: "Erro inesperado no login" });
  }
});

export default router;
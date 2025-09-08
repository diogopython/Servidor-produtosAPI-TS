import { Router, Request, Response } from "express";
import pool from "../db";
import { autenticar } from "./autenticar";
import { HoraAtual, LogEvent } from "../funcGlobal";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

// Interface para corpo da requisição de produtos
interface ProdutoBody {
  nome: string;
  preco: number;
  quantidade: number;
}

// Criar produto
router.post("/", autenticar, async (req: Request, res: Response) => {
  const { nome, preco, quantidade } = req.body as ProdutoBody;
  LogEvent(`[${req.userIp || "*null*"}][${HoraAtual()}][PRODUTO][CREATE][POST] - Usuário ID: ${req.userId} tentando criar produto`);

  try {
    const conn = await pool.getConnection();
    await conn.query(
      "INSERT INTO produtos (user_id, nome, preco, quantidade) VALUES (?, ?, ?, ?)",
      [req.userId, nome, preco, quantidade]
    );
    conn.release();

    LogEvent(`[${req.userIp || "*null*"}][${HoraAtual()}][PRODUTO][CREATE][POST] - Produto criado com sucesso pelo usuário ID: ${req.userId} | Nome: ${nome}`);
    res.status(201).json({ msg: "Produto criado" });
  } catch (err: any) {
    LogEvent(`[${req.userIp || "*null*"}][${HoraAtual()}][PRODUTO][CREATE][POST][ERROR] - Erro ao criar produto para usuário ID: ${req.userId} - ${err.message}`);
    res.status(500).json({ erro: "Erro inesperado ao criar o produto" });
  }
});

// Listar produtos do usuário
router.get("/", autenticar, async (req: Request, res: Response) => {
  LogEvent(`[${req.userIp || "*null*"}][${HoraAtual()}][PRODUTO][LIST][GET] - Listando produtos do usuário ID: ${req.userId}`);

  try {
    const conn = await pool.getConnection();
    const produtos = await conn.query("SELECT * FROM produtos WHERE user_id = ?", [req.userId]);
    conn.release();

    LogEvent(`[${req.userIp || "*null*"}][${HoraAtual()}][PRODUTO][LIST][GET] - Produtos listados com sucesso para usuário ID: ${req.userId} | Quantidade: ${produtos.length}`);
    res.json(produtos);
  } catch (err: any) {
    LogEvent(`[${req.userIp || "*null*"}][${HoraAtual()}][PRODUTO][LIST][GET][ERROR] - Erro ao listar produtos para usuário ID: ${req.userId} - ${err.message}`);
    res.status(500).json({ erro: "Erro inesperado ao listar os produtos" });
  }
});

// Atualizar produto
router.put("/:id", autenticar, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, preco, quantidade } = req.body as ProdutoBody;

  LogEvent(`[${req.userIp || "*null*"}][${HoraAtual()}][PRODUTO][UPDATE][PUT] - Usuário ID: ${req.userId} tentando atualizar produto ID: ${id}`);

  try {
    const conn = await pool.getConnection();
    const result: any = await conn.query(
      "UPDATE produtos SET nome = ?, preco = ?, quantidade = ? WHERE id = ? AND user_id = ?",
      [nome, preco, quantidade, id, req.userId]
    );
    conn.release();

    if (result.affectedRows === 0) {
      LogEvent(`[${req.userIp || "*null*"}][${HoraAtual()}][PRODUTO][UPDATE][PUT] - Produto ID: ${id} não encontrado ou sem permissão pelo usuário ID: ${req.userId}`);
      return res.status(404).json({ erro: "Produto não encontrado ou sem permissão para atualizar" });
    }

    LogEvent(`[${req.userIp || "*null*"}][${HoraAtual()}][PRODUTO][UPDATE][PUT] - Produto ID: ${id} atualizado com sucesso pelo usuário ID: ${req.userId}`);
    res.json({ msg: "Produto atualizado com sucesso" });
  } catch (err: any) {
    LogEvent(`[${req.userIp || "*null*"}][${HoraAtual()}][PRODUTO][UPDATE][PUT][ERROR] - Erro ao atualizar produto ID: ${id} para usuário ID: ${req.userId} - ${err.message}`);
    res.status(500).json({ erro: "Erro inesperado ao atualizar o produto" });
  }
});

// Deletar produto
router.delete("/:id", autenticar, async (req: Request, res: Response) => {
  const { id } = req.params;
  LogEvent(`[${req.userIp || "*null*"}][${HoraAtual()}][PRODUTO][DELETE][DELETE] - Usuário ID: ${req.userId} tentando deletar produto ID: ${id}`);

  try {
    const conn = await pool.getConnection();
    const result: any = await conn.query("DELETE FROM produtos WHERE id = ? AND user_id = ?", [id, req.userId]);
    conn.release();

    if (result.affectedRows === 0) {
      LogEvent(`[${req.userIp || "*null*"}][${HoraAtual()}][PRODUTO][DELETE][DELETE] - Produto ID: ${id} não encontrado ou sem permissão pelo usuário ID: ${req.userId}`);
      return res.status(404).json({ erro: "Produto não encontrado ou sem permissão para deletar" });
    }

    LogEvent(`[${req.userIp || "*null*"}][${HoraAtual()}][PRODUTO][DELETE][DELETE] - Produto ID: ${id} deletado com sucesso pelo usuário ID: ${req.userId}`);
    res.json({ msg: "Produto deletado" });
  } catch (err: any) {
    LogEvent(`[${req.userIp || "*null*"}][${HoraAtual()}][PRODUTO][DELETE][DELETE][ERROR] - Erro ao deletar produto ID: ${id} para usuário ID: ${req.userId} - ${err.message}`);
    res.status(500).json({ erro: "Erro inesperado ao deletar o produto" });
  }
});

// Pesquisar produtos pelo nome
router.post("/search", autenticar, async (req: Request, res: Response) => {
  const { query } = req.body as { query: string };
  LogEvent(`[${req.userIp || "*null*"}][${HoraAtual()}][PRODUTO][SEARCH][POST] - Usuário ID: ${req.userId} pesquisando produtos com query: "${query}"`);

  if (!query) {
    LogEvent(`[${req.userIp || "*null*"}][${HoraAtual()}][PRODUTO][SEARCH][POST] - Parâmetro de busca ausente para usuário ID: ${req.userId}`);
    return res.status(400).json({ erro: 'Parâmetro de busca "q" é obrigatório.' });
  }

  try {
    const conn = await pool.getConnection();
    const produtos = await conn.query(
      "SELECT * FROM produtos WHERE user_id = ? AND nome LIKE ?",
      [req.userId, `%${query}%`]
    );
    conn.release();

    LogEvent(`[${req.userIp || "*null*"}][${HoraAtual()}][PRODUTO][SEARCH][POST] - Pesquisa concluída para usuário ID: ${req.userId} | Resultados: ${produtos.length}`);
    res.json({ produtos });
  } catch (err: any) {
    LogEvent(`[${req.userIp || "*null*"}][${HoraAtual()}][PRODUTO][SEARCH][POST][ERROR] - Erro na pesquisa para usuário ID: ${req.userId} - ${err.message}`);
    res.status(500).json({ erro: "Erro inesperado ao pesquisar o produto" });
  }
});

export default router;

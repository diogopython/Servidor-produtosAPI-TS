import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import produtoRoutes from "./routes/produtos";

import { HoraAtual, LogEvent } from "./funcGlobal";

dotenv.config();
const app = express();
const valido = process.env.VALID === "true"
const Port = process.env.PORT ?? 3000

// Permitir requisições de qualquer origem (ou só do seu frontend)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "userip"],
  })
);

app.use(express.json());

// Rotas
if (valido) {
  app.use("/auth", authRoutes);
  app.use("/produtos", produtoRoutes);
}

app.get("/valid", (req: Request, res: Response) => {
  const msg = process.env.MSG || "estamos fechados";
  if (valido) {
    res.json({ valid: true });
  } else {
    res.json({ valid: false, msg: msg });
  }
});

app.listen(Port, () => {
  LogEvent(`[${HoraAtual()}] API rodando em http://localhost:${Port}`);
});
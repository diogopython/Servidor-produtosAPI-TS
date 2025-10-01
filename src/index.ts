import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import produtoRoutes from "./routes/produtos";

import { LogEvent, getClientIP } from "./funcGlobal";
import path from "path";
import BlackList_ips from "./BlackList-ips.json"

dotenv.config();

// ######### WEB #########
const Web_Port = process.env.WEB_PORT ?? 4040
const app2 = express();
app2.use(express.static(path.join(__dirname, "public")));

app2.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app2.listen(Web_Port, () => {
  LogEvent(`App web rodando em http://localhost:${Web_Port}`);
});
// ######### WEB #########

// ######### API #########
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

app.set("trust proxy", true);

// Rotas
if (valido) {
  app.use("/auth", authRoutes);
  app.use("/produtos", produtoRoutes);
}

app.get("/valid", async (req: Request, res: Response) => {
  const ip = await getClientIP(req);
  LogEvent(`[VALID][GET] - IP:${ip}`)
  const msg = process.env.MSG || "estamos fechados";

  for (const ip_blak of BlackList_ips) {
    if (ip === ip_blak) return res.json({ valid: true, msg: "Seu ip nao esta autorizado"});
  }

  if (valido) {
    res.json({ valid: true });
  } else {
    res.json({ valid: false, msg: msg });
  }
});

app.listen(Port, async () => {
  LogEvent(`API rodando em http://localhost:${Port}`);
});
// ######### API #########
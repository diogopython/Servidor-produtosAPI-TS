import { promises as fs } from "fs";
import { existsSync } from "fs"

// Função para pegar data/hora formatada
export function HoraAtual(): string {
  const agora = new Date();
  const pad = (n: number): string => n.toString().padStart(2, "0");

  const ano = agora.getFullYear();
  const mes = pad(agora.getMonth() + 1);
  const dia = pad(agora.getDate());
  const hora = pad(agora.getHours());
  const minuto = pad(agora.getMinutes());
  const segundo = pad(agora.getSeconds());

  return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
}

// Função para logar eventos em arquivo e console
export async function LogEvent(message: string): Promise<void> {
  const logLine = `${message}\n`;

  console.log(logLine.trim()); // imprime no console
  try {
    if (!existsSync("logs")) await fs.mkdir("logs");
    await fs.appendFile("./logs/log-server.log", logLine);
  } catch (err) {
    console.error("Erro ao escrever no log:", err);
  }
}
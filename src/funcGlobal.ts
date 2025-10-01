import { promises as fs } from "fs";
import { existsSync } from "fs"
import ping from "ping"
import { Request } from "express";
import BlackList_ips from "./BlackList-ips.json"

// Função para pegar data/hora formatada
function HoraAtual(): string {
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
  const logLine = `[${HoraAtual()}] ${message}\n`;

  console.log(logLine.trim()); // imprime no console
  try {
    if (!existsSync("logs")) await fs.mkdir("logs");
    await fs.appendFile("./logs/log-server.log", logLine);
  } catch (err) {
    console.error("Erro ao escrever no log:", err);
  }
}

export function getClientIP(req: Request): string {
  console.log("REQ HEADERS:", JSON.stringify(req.body, null, 2));
  // Cloudflare
  const cfIP = req.headers["cf-connecting-ip"];
  console.log(`cfIP: ${cfIP}`)
  if (typeof cfIP === "string" && cfIP.length > 0) return cfIP;

  // X-Forwarded-For
  const xff = req.headers["x-forwarded-for"];
  console.log(`xff: ${xff}`)

  if (typeof xff === "string"){ 
    console.log(`1. ${xff.split(",")[0]?.trim() ?? "0.0.0.0"}`);
    return xff.split(",")[0]?.trim() ?? "0.0.0.0";
  }

  if (Array.isArray(xff)){
    console.log(`2. ${xff[0]?.split(",")[0]?.trim() ?? "0.0.0.0"}`);
    return xff[0]?.split(",")[0]?.trim() ?? "0.0.0.0";
  }

  // fallback
  console.log(`fallback: ${req.socket.remoteAddress ?? "0.0.0.0"}`)
  return req.socket.remoteAddress ?? "0.0.0.0";
}

export async function ValidIP(ip: string, req: Request) {
  const ip_cloud = getClientIP(req);

  // IP do cliente precisa bater com o esperado
  if (ip !== ip_cloud) return false;

  // Verifica se está na blacklist
  for (const ip_blak of BlackList_ips) {
    if (ip === ip_blak) return false;
  }

  return true;
}
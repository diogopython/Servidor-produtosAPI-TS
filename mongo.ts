import { MongoClient } from "mongodb";
import { LogEvent, HoraAtual } from "./funcGlobal"
import dotenv from "dotenv"

dotenv.config();

const uri = "mongodb://diogo:Diogo.908@72.60.1.190:27017"; // URL do MongoDB
const client = new MongoClient(uri);
const dbName = "produtosdb";

export async function registrarTokenUsado(token: string): Promise<[boolean, any?]> {
  try {
    await client.connect();
    const db = client.db(dbName);
    const colecao = db.collection("tokens_usados");

    await colecao.insertOne({
      token: token,
      usado_em: new Date(), // campo para TTL
    });

    return [true];
  } catch (erro) {
    return [false, erro];
  } finally {
    await client.close();
  }
}

// Função para verificar se token já foi usado (está no MongoDB)
export async function tokenJaUsado(token: string): Promise<boolean> {
  try {
    await client.connect();
    const db = client.db(dbName);
    const colecao = db.collection("tokens_usados");

    const res = await colecao.findOne({ token });
    return !!res; // true se token está usado
  } catch (err) {
    LogEvent(`[${HoraAtual()}] error in tokenJaUsado: ${err}`);
    return false;
  }
}
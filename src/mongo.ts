import { MongoClient } from "mongodb";
import { LogEvent } from "./funcGlobal"
import dotenv from "dotenv"

dotenv.config();

const uri = String(process.env.MONGO_URL); // URL do MongoDB
const client = new MongoClient(uri);
const dbName = process.env.MONGO_DB;

export async function registrarHashToken(hash: string): Promise<[boolean, any?]> {
  try {
    await client.connect();
    const db = client.db(dbName);
    const colecao = db.collection("Hashs_Tokens");

    await colecao.insertOne({ hash, criado_em: new Date() });

    return [true];
  } catch (erro) {
    return [false, erro];
  } finally {
    await client.close();
  }
}

// Função para verificar se hash do token já foi usado (está no MongoDB)
export async function HashTokenJaUsado(hash: string): Promise<boolean> {
  try {
    await client.connect();
    const db = client.db(dbName);
    const colecao = db.collection("Hashs_Tokens");

    const res = await colecao.findOne({ hash });
    return !!res; // true se hash token está usado
  } catch (err) {
    LogEvent(`error in HashTokenJaUsado: ${err}`);
    return false;
  }
}

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
    LogEvent(`error in tokenJaUsado: ${err}`);
    return false;
  }
}
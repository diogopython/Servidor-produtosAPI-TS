import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { LogEvent } from "./funcGlobal";
import { NONAME } from "dns";

dotenv.config();

const SMTP_ACTIV = process.env.SMTP_ACTIV === 'true';
const SMTP_SERVER = process.env.SMTP_SERVER;
const SMTP_PORT = Number(process.env.SMTP_PORT);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim();

class EmailService {
  remetente: string;
  nomeRemetente: string;
  transporter;

  constructor(remetente: string, nomeRemetente: string) {
    this.remetente = remetente;
    this.nomeRemetente = nomeRemetente;

    this.transporter = nodemailer.createTransport({
      host: SMTP_SERVER,
      port: SMTP_PORT,
      secure: false, // true se for 465
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  async enviarBoasVindas(destinatario: string, nomeUsuario: string): Promise<[boolean, any?]> {
    const assunto = "Bem-vindo ao Produtos CLI 🚀";
    const corpo = `
      <html>
        <body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background:#f4f6f9;">
          <table align="center" width="650" cellpadding="0" cellspacing="0" 
                style="background:#ffffff; border-radius:10px; overflow:hidden; margin-top:40px; 
                        box-shadow:0 6px 18px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <tr>
              <td style="background:#1e1b4b; padding:25px; text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size:22px; font-weight:bold;">
                  Produtos CLI
                </h1>
              </td>
            </tr>

            <!-- Corpo -->
            <tr>
              <td style="padding:30px; color:#333; font-size:15px; line-height:1.8;">
                <h2 style="color:#1e1b4b; margin-top:0;">Bem-vindo, ${nomeUsuario}</h2>
                <p>
                  É um prazer recebê-lo em nossa plataforma.  
                  O <strong>Produtos CLI</strong> foi desenvolvido para oferecer 
                  praticidade, segurança e eficiência em suas operações diárias.
                </p>
                <p style="margin:25px 0; text-align:center;">
                  <a href="https://produtoscli.nuvemhost.xyz"
                    style="display:inline-block; padding:14px 28px; background:#1e1b4b; 
                          color:#fff; text-decoration:none; border-radius:6px; 
                          font-weight:bold; font-size:14px;">
                    Acessar Produtos CLI
                  </a>
                </p>
                <p>
                  Caso tenha dúvidas ou precise de suporte, nossa equipe estará sempre à disposição 
                  para auxiliá-lo.
                </p>
                <p style="margin-top:30px;">
                  Atenciosamente,<br>
                  <strong>${this.nomeRemetente}</strong><br>
                  Equipe Produtos CLI
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f0f2f8; text-align:center; padding:20px; font-size:12px; color:#777;">
                <p style="margin:5px 0;">
                  Este é um email automático. Não é necessário respondê-lo.
                </p>
                <hr style="margin:20px 0; border:none; border-top:1px solid #ddd;">
                <p style="margin:0; font-size:11px; color:#555;">
                  <strong>© 2025 NuvemHost</strong>. Todos os direitos reservados.<br>
                  Este conteúdo é protegido por leis de propriedade intelectual.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${this.nomeRemetente}" <${this.remetente}>`,
        to: destinatario,
        subject: assunto,
        html: corpo,
      });
      return [true];
    } catch (e) {
      return [false, e];
    }
  }

  async avisoRegistroEmail(username: string, email: string): Promise<[boolean, any?]> {
    const assunto = "Novo registro no Produtos CLI";
    const corpo = `
      <html>
        <body style="font-family: Arial, Helvetica, sans-serif; background:#f4f6f9; padding:30px;">
          <table align="center" width="650" cellpadding="0" cellspacing="0" 
                style="background:#ffffff; border-radius:10px; box-shadow:0 6px 18px rgba(0,0,0,0.1); overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td style="background:#1e1b4b; padding:25px; text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size:22px;">Novo Registro</h1>
              </td>
            </tr>

            <!-- Corpo -->
            <tr>
              <td style="padding:30px; color:#333; font-size:15px; line-height:1.8;">
                <p>Um novo usuário foi registrado na plataforma <strong>Produtos CLI</strong>.</p>
                
                <div style="background:#f9fafc; padding:15px; border:1px solid #e5e7eb; border-radius:6px; margin:20px 0;">
                  <p style="margin:6px 0;"><strong>Usuário:</strong> ${username}</p>
                  <p style="margin:6px 0;"><strong>Email:</strong> ${email}</p>
                </div>

                <p style="margin:25px 0; text-align:center;">
                  <a href="https://cockpit.nuvemhost.xyz"
                    style="display:inline-block; padding:14px 28px; background:#1e1b4b; 
                          color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">
                    Acessar Painel Administrativo
                  </a>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f0f2f8; text-align:center; padding:20px; font-size:12px; color:#777;">
                <p style="margin:5px 0;">Aviso confidencial: apenas administradores devem receber este email.</p>
                <hr style="margin:20px 0; border:none; border-top:1px solid #ddd;">
                <p style="margin:0; font-size:11px; color:#555;">
                  <strong>© 2025 NuvemHost</strong>. Todos os direitos reservados.<br>
                  Conteúdo confidencial e de uso restrito.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${this.nomeRemetente}" <${this.remetente}>`,
        to: ADMIN_EMAIL,
        subject: assunto,
        html: corpo,
      });
      return [true]
    } catch (e) {
      return [false, e];
    }
  }

  async avisoExclusaoConta(destinatario: string, nomeUsuario: string): Promise<[boolean, any?]> {
    const assunto = "Conta excluída - Produtos CLI";
    const corpo = `
      <html>
        <body style="font-family: Arial, Helvetica, sans-serif; background:#f4f6f9; padding:30px;">
          <table align="center" width="650" cellpadding="0" cellspacing="0" 
                style="background:#ffffff; border-radius:10px; box-shadow:0 6px 18px rgba(0,0,0,0.1); overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td style="background:#991b1b; padding:25px; text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size:22px;">Conta Excluída</h1>
              </td>
            </tr>

            <!-- Corpo -->
            <tr>
              <td style="padding:30px; color:#333; font-size:15px; line-height:1.8;">
                <p>Olá, ${nomeUsuario}.</p>
                <p>
                  Sua conta na plataforma <strong>Produtos CLI</strong> foi excluída com sucesso.
                </p>
                <p style="color:#555;">
                  Caso não tenha solicitado esta exclusão, entre em contato com nosso suporte imediatamente.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f0f2f8; text-align:center; padding:20px; font-size:12px; color:#777;">
                <p style="margin:5px 0;">Este aviso é de caráter informativo e não requer resposta.</p>
                <hr style="margin:20px 0; border:none; border-top:1px solid #ddd;">
                <p style="margin:0; font-size:11px; color:#555;">
                  <strong>© 2025 NuvemHost</strong>. Todos os direitos reservados.<br>
                  Proibida a reprodução sem autorização expressa.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${this.nomeRemetente}" <${this.remetente}>`,
        to: destinatario,
        subject: assunto,
        html: corpo,
      });
      return [true];
    } catch (e) {
      return [false, e];
    }
  }

  async avisoLogin(destinatario: string, nomeUsuario: string, ip: string): Promise<[boolean, any?]> {
    const assunto = "Novo login detectado - Produtos CLI";
    const corpo = `
      <html>
        <body style="font-family: Arial, Helvetica, sans-serif; background:#f4f6f9; padding:30px;">
          <table align="center" width="650" cellpadding="0" cellspacing="0" 
                style="background:#ffffff; border-radius:10px; box-shadow:0 6px 18px rgba(0,0,0,0.1); overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td style="background:#1e3a8a; padding:25px; text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size:22px;">Novo Login Detectado</h1>
              </td>
            </tr>

            <!-- Corpo -->
            <tr>
              <td style="padding:30px; color:#333; font-size:15px; line-height:1.8;">
                <p>Olá, ${nomeUsuario}.</p>
                <p>
                  Identificamos um novo login em sua conta <strong>Produtos CLI</strong>.
                </p>
                <div style="background:#f9fafc; padding:15px; border:1px solid #e5e7eb; border-radius:6px; margin:20px 0;">
                  <p style="margin:6px 0;"><strong>Endereço IP:</strong> ${ip}</p>
                  <p style="margin:6px 0;"><strong>Data/Hora:</strong> ${new Date().toLocaleString("pt-BR")}</p>
                </div>
                <p style="color:#555;">
                  Se não foi você quem realizou este acesso, altere sua senha imediatamente e entre em contato com nosso suporte.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f0f2f8; text-align:center; padding:20px; font-size:12px; color:#777;">
                <p style="margin:5px 0;">A segurança da sua conta é prioridade para nós.</p>
                <hr style="margin:20px 0; border:none; border-top:1px solid #ddd;">
                <p style="margin:0; font-size:11px; color:#555;">
                  <strong>© 2025 NuvemHost</strong>. Todos os direitos reservados.<br>
                  Este conteúdo é protegido por direitos autorais e confidencialidade.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${this.nomeRemetente}" <${this.remetente}>`,
        to: destinatario,
        subject: assunto,
        html: corpo,
      });
      return [true];
    } catch (e) {
      return [false, e];
    }
  }
}

// Funções equivalentes
export async function BoasVindas(nome: string, email: string) {
  if(SMTP_ACTIV) {
    const service = new EmailService(SMTP_USER!, "Equipe Produtos CLI por NuvemHost");
    const enviado = await service.enviarBoasVindas(email, nome);
    if (!enviado[0]) {
      LogEvent(`[${email}][MAIL][BOASVINDAS][ERROR] - Erro ao enviar o email: ${enviado[1]}}`)
    }
    LogEvent(`[${email}][MAIL][BOASVINDAS][${email}] - Email enviado`)
    return enviado[0];
  } else {
    LogEvent(`[MAIL][BOASVINDAS] - Serviço de email desativado`)
    return false
  }
}

export async function AvisoRegistro(username: string, email: string) {
  if(SMTP_ACTIV) {
    const service = new EmailService(SMTP_USER!, "Produtos CLI");
    const enviado = await service.avisoRegistroEmail(username, email);
    if (!enviado[0]) {
      LogEvent(`[${ADMIN_EMAIL}][MAIL][AVISOREGISTRO][ERROR] - Erro ao enviar o email: ${enviado[1]}}`)
    }
    LogEvent(`[${email}][MAIL][AVISOREGISTRO] - Email enviado`)
    return enviado[0];
  } else {
    LogEvent(`[MAIL][AVISOREGISTRO] - Serviço de email desativado`)
    return false
  }
}

export async function AvisoExclusaoConta(nome: string, email: string) {
  if(SMTP_ACTIV) {
    const service = new EmailService(SMTP_USER!, "Produtos CLI");
    const enviado = await service.avisoExclusaoConta(email, nome);
    if (!enviado[0]) {
      LogEvent(`[${email}][MAIL][AVISOEXCLUSAOCONTA][ERROR] - Erro ao enviar o email: ${enviado[1]}}`)
    }
    LogEvent(`[${email}][MAIL][AVISOEXCLUSAOCONTA][${email}] - Email enviado`)
    return enviado[0];
  } else {
    LogEvent(`[MAIL][AVISOEXCLUSAOCONTA] - Serviço de email desativado`)
    return false
  }
}

export async function AvisoLogin(nome: string, email: string, ip: string) {
  if(SMTP_ACTIV) {
    const service = new EmailService(SMTP_USER!, "Produtos CLI");
    const enviado = await service.avisoLogin(email, nome, ip);
    if (!enviado[0]) {
      LogEvent(`[${email}][MAIL][AVISOLOGIN][ERROR] - Erro ao enviar o email: ${enviado[1]}}`)
    }
    LogEvent(`[${email}][MAIL][AVISOLOGIN][${email}] - Email enviado`)
    return enviado[0];
  } else {
    LogEvent(`[MAIL][AVISOLOGIN] - Serviço de email desativado`)
    return false
  }
}
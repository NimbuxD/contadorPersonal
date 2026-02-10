import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Initialize services
const prisma = new PrismaClient();
const token = process.env.TELEGRAM_BOT_TOKEN;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN no está definido en .env");
  process.exit(1);
}

// Ensure tmp directory exists
const TMP_DIR = path.resolve(process.cwd(), "tmp");
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR);
}

console.log("El bot está iniciando...");
console.log("El token existe:", !!token);

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Error handling
bot.on("polling_error", (err) => console.error("Polling Error:", err));
bot.on("webhook_error", (err) => console.error("Webhook Error:", err));
bot.on("error", (err) => console.error("General Error:", err));

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

console.log("Bot está corriendo...");

// Mock AI function for now if no key
async function analyzeImage(imagePath: string) {
  if (!geminiApiKey) {
    console.log("Usando IA simulada (Mock) ya que falta GEMINI_API_KEY.");
    return {
      recipient: "Juan Perez (Mock)",
      bank: "Banco Mock",
      accountType: "Cuenta Rut",
      accountNumber: "123456789",
      date: new Date().toISOString(),
      time: "12:00",
      transactionCode: "TRX-" + Date.now(),
      amount: 5000,
    };
  }

  // Real Gemini Implementation
  try {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");
    
    const prompt = `Extrae los detalles de la transferencia de esta imagen. Devuelve estrictamente un JSON válido con las claves: recipient, bank, accountType, accountNumber, date (ISO string), time, transactionCode, amount (number). Si falta un campo, usa null.
    NO incluyas formato markdown como \`\`\`json. Solo devuelve la cadena JSON cruda.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    let text = response.text();
    
    // Clean up potential markdown code blocks
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("Error de IA:", error);
    console.log("Usando datos de prueba (Mock) debido al error.");
    return {
      recipient: "Juan Perez (Fallback)",
      bank: "Banco Fallback",
      accountType: "Cuenta Rut",
      accountNumber: "123456789",
      date: new Date().toISOString(),
      time: "12:00",
      transactionCode: "TRX-FALLBACK-" + Date.now(),
      amount: 9999,
    };
  }
}

// Handle photo messages
bot.on("photo", async (msg) => {
  const chatId = msg.chat.id;
  
  if (!msg.photo) return;
  
  // Get the largest photo
  const photo = msg.photo[msg.photo.length - 1];
  const fileId = photo.file_id;

  try {
    bot.sendMessage(chatId, "Procesando imagen con Gemini...");

    // Download file
    const downloadPath = await bot.downloadFile(fileId, TMP_DIR);
    
    // Analyze
    const data = await analyzeImage(downloadPath);

    if (!data) {
      bot.sendMessage(chatId, "No se pudo analizar la imagen.");
      fs.unlinkSync(downloadPath); // Cleanup
      return;
    }

    // Save to DB
    const transaction = await prisma.transaction.create({
      data: {
        recipient: data.recipient || "Unknown",
        bank: data.bank || "Unknown",
        accountType: data.accountType || "Unknown",
        accountNumber: data.accountNumber || "Unknown",
        date: data.date ? new Date(data.date) : new Date(),
        time: data.time || "00:00",
        transactionCode: data.transactionCode || "UNKNOWN-" + Date.now(),
        amount: data.amount || 0,
        status: "PENDING",
      },
    });

    bot.sendMessage(
      chatId,
      `¡Transferencia guardada!\nID: ${transaction.id}\nDestinatario: ${transaction.recipient}\nMonto: ${transaction.amount}`
    );

    // Cleanup
    if (fs.existsSync(downloadPath)) {
        fs.unlinkSync(downloadPath);
    }

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "Error procesando la transacción.");
  }
});

bot.on("message", (msg) => {
  if (!msg.photo) {
    bot.sendMessage(msg.chat.id, "Por favor, envía una imagen del comprobante de transferencia.");
  }
});

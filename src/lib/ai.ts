import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = process.env.GEMINI_API_KEY;

export async function parseTransactionImage(base64Image: string) {
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

  try {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

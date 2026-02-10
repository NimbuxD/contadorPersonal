import { prisma } from "@/lib/db";
import { parseTransactionImage } from "@/lib/ai";
import { NextResponse } from "next/server";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Helper to send message via Telegram API
async function sendMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

// Helper to get file link and download as buffer
async function downloadFileAsBase64(fileId: string): Promise<string | null> {
  try {
    // 1. Get File Path
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${fileId}`
    );
    const data = await res.json();
    if (!data.ok) return null;

    const filePath = data.result.file_path;

    // 2. Download File
    const fileRes = await fetch(
      `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`
    );
    const arrayBuffer = await fileRes.arrayBuffer();
    return Buffer.from(arrayBuffer).toString("base64");
  } catch (e) {
    console.error("Error downloading file:", e);
    return null;
  }
}

export async function POST(req: Request) {
  if (!TELEGRAM_TOKEN) {
    return NextResponse.json({ error: "Token not configured" }, { status: 200 }); // Return 200 to stop retries
  }

  try {
    const update = await req.json();
    
    // Check if message exists
    if (!update.message) return NextResponse.json({ ok: true });

    const chatId = update.message.chat.id;

    // Handle Photos
    if (update.message.photo) {
      // 1. Acknowledge receipt
      await sendMessage(chatId, "📸 Imagen recibida. Descargando...");

      // Get largest photo
      const photo = update.message.photo[update.message.photo.length - 1];
      const base64Image = await downloadFileAsBase64(photo.file_id);

      if (!base64Image) {
        await sendMessage(chatId, "❌ Error: No se pudo descargar la imagen.");
        return NextResponse.json({ ok: true });
      }

      // 2. Notify AI processing
      await sendMessage(chatId, "🤖 Analizando con IA (esto puede tardar unos segundos)...");

      // Analyze
      const data = await parseTransactionImage(base64Image);

      if (!data) {
        await sendMessage(chatId, "⚠️ La IA no pudo entender la imagen. Intenta con una más clara.");
        return NextResponse.json({ ok: true });
      }

      // 3. Notify Saving
      await sendMessage(chatId, "💾 Datos extraídos. Guardando en base de datos...");

      // Save to DB
      const transaction = await prisma.transaction.create({
        data: {
          recipient: data.recipient || "Desconocido",
          bank: data.bank || "Desconocido",
          accountType: data.accountType || "Desconocido",
          accountNumber: data.accountNumber || "Desconocido",
          date: data.date ? new Date(data.date) : new Date(),
          time: data.time || "00:00",
          transactionCode: data.transactionCode || "UNKNOWN-" + Date.now(),
          amount: data.amount || 0,
          status: "PENDING",
        },
      });

      await sendMessage(
        chatId,
        `✅ ¡Listo!\n\n💰 Monto: $${transaction.amount.toLocaleString()}\n👤 Destino: ${transaction.recipient}\n🏦 Banco: ${transaction.bank}\n📅 Fecha: ${transaction.date.toLocaleDateString()}`
      );
    } else {
      await sendMessage(chatId, "Envíame una foto de una transferencia para registrarla.");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    // Important: Return 200 to stop Telegram from retrying endlessly
    // But try to notify user if possible (we might not have chatId if parsing failed)
    return NextResponse.json({ ok: true });
  }
}

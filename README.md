# 💰 Control de Gastos con IA y Telegram

Este proyecto es una aplicación web moderna diseñada para automatizar el registro de tus gastos personales y llevar el control de deudas de manera inteligente.

Utiliza un **Bot de Telegram** que recibe fotos de tus comprobantes de transferencia, las procesa con **Inteligencia Artificial (Google Gemini)** para extraer los datos, y los guarda automáticamente en tu base de datos.

## 🚀 Características Principales

*   **🤖 Automatización con IA**: Envía una foto a tu bot y olvídate. La IA detecta el monto, destinatario, banco y fecha.
*   **👥 Gestión de Deudas**: Crea perfiles para personas que te deben dinero (ej: Rodrigo, Mónica). El sistema asigna los pagos automáticamente basándose en palabras clave.
*   **📊 Dashboard Financiero**: Visualiza tu deuda total, cuánto has recuperado y cuánto falta por cobrar.
*   **🌓 Modo Oscuro Automático**: Interfaz limpia y moderna que se adapta a tu sistema.
*   **📱 Diseño Responsivo**: Funciona perfecto en tu celular y computadora.

## 🛠️ Tecnologías

*   **Frontend**: Next.js 14, Tailwind CSS, Shadcn UI.
*   **Backend**: Server Actions, API Routes.
*   **Base de Datos**: PostgreSQL (vía Prisma ORM).
*   **IA**: Google Gemini 1.5 Flash.
*   **Integraciones**: Telegram Bot API.

---

## 💻 Ejecución Local (Desarrollo)

Sigue estos pasos para correr el proyecto en tu computadora:

### 1. Clonar y Preparar
```bash
git clone https://github.com/NimbuxD/contadorPersonal.git
cd contadorPersonal
npm install
```

### 2. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz con las siguientes claves:

```env
# Base de Datos (PostgreSQL)
DATABASE_URL="postgresql://usuario:password@localhost:5432/mibasededatos"

# Token de tu Bot de Telegram (Obtenido de @BotFather)
TELEGRAM_BOT_TOKEN="tu_token_aqui"

# Clave de API de Google Gemini (Obtenida de Google AI Studio)
GOOGLE_GENERATIVE_AI_API_KEY="tu_api_key_aqui"

# URL de tu proyecto (para webhooks locales usa Ngrok)
verceL_URL="https://tu-url.com" 
```

### 3. Base de Datos
Sincroniza el esquema de Prisma con tu base de datos:
```bash
npx prisma db push
```

### 4. Iniciar Servidor
```bash
npm run dev
```
La web estará disponible en `http://localhost:3000`.

### 5. (Opcional) Activar el Bot Localmente
Para que el bot funcione en local, necesitas exponer tu puerto 3000 a internet (usando Ngrok o similar) y configurar el Webhook de Telegram hacia esa URL.

---

## ☁️ Despliegue en Vercel (Producción)

Este proyecto está optimizado para desplegarse en **Vercel**.

1.  Sube tu código a **GitHub**.
2.  Crea un nuevo proyecto en **Vercel** e importa tu repositorio.
3.  En la configuración de Vercel (Environment Variables), agrega las mismas variables del `.env`.
4.  **Base de Datos**: Vercel ofrece almacenamiento PostgreSQL (Vercel Postgres) o puedes usar Supabase/Neon. Asegúrate de actualizar `DATABASE_URL`.
5.  ¡Despliega!

### Configurar el Webhook del Bot (Post-Despliegue)
Una vez que tu sitio esté en línea (ej: `https://contador-personal.vercel.app`), debes decirle a Telegram que envíe los mensajes ahí.

Ejecuta este comando en tu navegador o terminal:
```
https://api.telegram.org/bot<TU_TOKEN>/setWebhook?url=https://contador-personal.vercel.app/api/telegram-webhook
```
*(Reemplaza `<TU_TOKEN>` por tu token real)*

¡Listo! Tu bot ahora procesará las imágenes en la nube.

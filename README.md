# 💰 Control de Gastos con IA y Telegram

Este proyecto es una aplicación web moderna diseñada para automatizar el registro de tus gastos personales y llevar el control de deudas de manera inteligente.

Utiliza un **Bot de Telegram** que recibe fotos de tus comprobantes de transferencia, las procesa con **Inteligencia Artificial (Google Gemini)** para extraer los datos, y los guarda automáticamente en tu base de datos. También acepta comandos de texto para registros manuales.

## 🚀 Características Principales

*   **🤖 Automatización con IA**: Envía una foto a tu bot y la IA detecta el monto, destinatario, banco y fecha.
*   **🗣️ Comandos de Voz/Texto**: Registra pagos o deudas escribiendo (ej: `/pago 5000 Juan`).
*   **👥 Gestión de Deudas**: Asigna pagos automáticamente basándose en palabras clave.
*   **🔐 Seguridad Total**: Acceso protegido con **Google Authentication** (solo tu email puede entrar).
*   **📊 Dashboard Financiero**: Visualiza deuda total, pagado y pendiente.
*   **🌓 Modo Oscuro/Claro**: Adaptable a tu sistema.

## 🛠️ Tecnologías

*   **Frontend**: Next.js 14, Tailwind CSS, Shadcn UI.
*   **Backend**: Server Actions, API Routes, NextAuth.js v5.
*   **Base de Datos**: PostgreSQL (vía Prisma ORM).
*   **IA**: Google Gemini 1.5 Flash.
*   **Integraciones**: Telegram Bot API.

---

## 💻 Configuración Local

### 1. Clonar y Preparar
```bash
git clone https://github.com/NimbuxD/contadorPersonal.git
cd contadorPersonal
npm install
```

### 2. Variables de Entorno (.env)
Crea un archivo `.env` en la raíz con las siguientes claves:

```env
# Base de Datos (PostgreSQL)
DATABASE_URL="postgresql://usuario:password@localhost:5432/mibasededatos"

# Telegram Bot (De @BotFather)
TELEGRAM_BOT_TOKEN="tu_token_telegram"

# IA (De Google AI Studio)
GOOGLE_GENERATIVE_AI_API_KEY="tu_api_key_gemini"

# Autenticación (Google OAuth)
# Generar secreto: openssl rand -base64 32
AUTH_SECRET="tu_secreto_random"
AUTH_GOOGLE_ID="tu_cliente_id_google"
AUTH_GOOGLE_SECRET="tu_cliente_secreto_google"

# Seguridad (¡Importante!)
ALLOWED_EMAIL="tu_email_real@gmail.com"
```

### 3. Base de Datos
```bash
npx prisma db push
```

### 4. Iniciar
```bash
npm run dev
```
Visita `http://localhost:3000`. Te pedirá iniciar sesión con Google.

---

## ☁️ Despliegue en Vercel

1.  Sube tu código a **GitHub**.
2.  Importa el repo en **Vercel**.
3.  Configura las **Variables de Entorno** (las mismas del `.env`).
4.  **Configura Google OAuth**:
    *   En Google Cloud Console, crea credenciales OAuth.
    *   **Orígenes JS**: `https://tu-proyecto.vercel.app`
    *   **Redirección**: `https://tu-proyecto.vercel.app/api/auth/callback/google`
5.  ¡Despliega!

### Configurar Webhook de Telegram
Para que el bot funcione, ejecuta esto en tu navegador:
```
https://api.telegram.org/bot<TU_TOKEN>/setWebhook?url=https://<TU_DOMINIO_VERCEL>/api/telegram-webhook
```

---

## 🤖 Uso del Bot

### Enviar Imagen
Simplemente envía una foto de un comprobante. El bot te responderá paso a paso.

### Comandos de Texto
*   `/pago [monto] [nombre]`: Registra un pago manual.
    *   Ej: `/pago 10000 Rodrigo`
*   `/deuda [monto] [nombre]`: Crea una nueva deuda.
    *   Ej: `/deuda 50000 Monica`
*   `/help`: Muestra la ayuda.

import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

interface ChatMessageInput {
  role: "user" | "model";
  text: string;
}

const TAB_CONTEXT_LABELS: Record<string, string> = {
  comparativa: "Comparativa general y Asistente de Decisión (Lineal vs Logística)",
  lineal: "Laboratorio Interactivo de Regresión Lineal (y = m*x + b, residuos, MSE, R², modo manual vs automático, incluye precios reales por m² en Montería, Córdoba en millones de COP)",
  logistica: "Laboratorio Interactivo de Regresión Logística (curva sigmoide en S, probabilidades 0%-100%, umbral de decisión y matriz de confusión)",
  casos: "Casos de Aplicación en el Mundo Real (publicidad vs ventas, depreciación de coche, fraude bancario, churn de clientes)",
  quiz: "Glosario Conceptual Ilustrado y Quiz de Comprobación de 5 preguntas",
};

function buildSystemInstruction(activeTab?: string): string {
  const tabLabel = activeTab && TAB_CONTEXT_LABELS[activeTab]
    ? TAB_CONTEXT_LABELS[activeTab]
    : "Guía interactiva de Regresión Lineal y Logística";

  return `Eres "Profe RegresionLab", un tutor amigable, claro y muy didáctico especializado en explicar Regresión Lineal y Regresión Logística a usuarios finales y estudiantes sin formación matemática avanzada.

Contexto actual del usuario dentro de la aplicación:
El usuario está viendo la pestaña: "${tabLabel}".

Reglas de estilo y pedagogía:
1. Responde SIEMPRE en español natural, cercano y alentador.
2. Evita la jerga matemática densa o críptica; cuando menciones fórmulas (como y = m·x + b, MSE, R² o la función sigmoide), explícalas inmediatamente con una analogía cotidiana sencilla.
3. Sé conciso y bien estructurado: usa párrafos cortos, viñetas claras y negritas (**concepto**) para resaltar ideas clave. Apunta a respuestas de entre 80 y 180 palabras salvo que el usuario pida profundizar más.
4. Conecta tus explicaciones con las herramientas interactivas de la aplicación cuando sea útil (por ejemplo, sugerir mover el slider de umbral en la pestaña Logística, probar el modo Manual vs Automático en Lineal, o revisar los residuos punteados en el gráfico).
5. Si el usuario hace una pregunta fuera del tema de Machine Learning / estadística / análisis de datos, redirígelo amablemente hacia el tema de la guía.`;
}

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("MISSING_API_KEY");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function formatGeminiError(err: unknown): { status: number; message: string } {
  const anyErr = err as { status?: number; message?: string; code?: number };
  const statusCode = typeof anyErr?.status === "number" ? anyErr.status : 500;
  const raw = err instanceof Error ? err.message : String(err);

  if (raw.includes("MISSING_API_KEY")) {
    return {
      status: 500,
      message: "Falta configurar la clave de API de Gemini en el panel Settings > Secrets.",
    };
  }
  if (
    statusCode === 403 ||
    raw.includes("API_KEY_INVALID") ||
    raw.includes("PERMISSION_DENIED") ||
    raw.includes("API key not valid")
  ) {
    return {
      status: 403,
      message: "La clave de API de Gemini no es válida o no tiene permisos. Verifica Settings > Secrets.",
    };
  }
  if (statusCode === 429 || raw.includes("RESOURCE_EXHAUSTED")) {
    return {
      status: 429,
      message: "Se ha alcanzado el límite temporal de consultas. Intenta nuevamente en unos segundos.",
    };
  }
  if (statusCode === 404 || raw.includes("NOT_FOUND")) {
    return {
      status: 404,
      message: `El modelo de IA no se encontró disponible (${raw.slice(0, 160)}).`,
    };
  }
  if (statusCode === 400 || raw.includes("INVALID_ARGUMENT")) {
    return {
      status: 400,
      message: `Solicitud inválida al modelo de IA: ${raw.slice(0, 200)}`,
    };
  }
  return {
    status: statusCode >= 400 && statusCode < 600 ? statusCode : 500,
    message: `No se pudo obtener respuesta del tutor (${statusCode}): ${raw.slice(0, 180)}`,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/chat", async (req, res) => {
    const body = req.body as {
      messages?: ChatMessageInput[];
      activeTab?: string;
    };

    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const validMessages = messages.filter(
      (m) =>
        (m.role === "user" || m.role === "model") &&
        typeof m.text === "string" &&
        m.text.trim().length > 0
    );

    if (validMessages.length === 0) {
      res.status(400).json({ error: "Debes enviar al menos un mensaje para el tutor." });
      return;
    }

    const lastMessage = validMessages[validMessages.length - 1];
    if (lastMessage.role !== "user") {
      res.status(400).json({ error: "El último mensaje debe ser del usuario." });
      return;
    }

    try {
      const ai = getAiClient();

      const contents = validMessages.slice(-14).map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders?.();

      const stream = await ai.models.generateContentStream({
        model: "gemini-3.1-flash-lite",
        contents,
        config: {
          systemInstruction: buildSystemInstruction(body?.activeTab),
          abortSignal: AbortSignal.timeout(25000),
        },
      });

      for await (const chunk of stream) {
        const textChunk = chunk.text;
        if (textChunk) {
          res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err) {
      const formatted = formatGeminiError(err);
      console.error("Error en /api/chat:", err);
      if (!res.headersSent) {
        res.status(formatted.status).json({ error: formatted.message });
      } else {
        res.write(`data: ${JSON.stringify({ error: formatted.message })}\n\n`);
        res.end();
      }
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RegresionLab ML server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "dist");

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "8080");

  app.use(express.json({ limit: "10mb" }));

  // ✅ 修正 MIME：明確設定靜態資源 MIME type
  app.use(
    express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".js")) {
          res.setHeader("Content-Type", "application/javascript; charset=utf-8");
        } else if (filePath.endsWith(".css")) {
          res.setHeader("Content-Type", "text/css; charset=utf-8");
        }
      },
    })
  );

  // ✅ 安全：課程 Proxy（原有）
  app.get("/api/courses-proxy", async (_req: Request, res: Response) => {
    const targetUrl = "https://gogocare.com.tw/tw/course/list.html";
    try {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
          "Accept-Language": "zh-TW,zh;q=0.9",
        },
      });
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const html = await response.text();
      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch (error) {
      console.error("[Server] Course proxy error:", error);
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });

  // ✅ 安全：Gemini API 由後端呼叫，Key 不暴露給前端
  app.post("/api/gemini", async (req: Request, res: Response) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Gemini API Key 未設定" });
      return;
    }
    try {
      const { prompt, model = "gemini-2.0-flash" } = req.body;
      const { GoogleGenAI } = await import("@google/genai");
      const genAI = new GoogleGenAI({ apiKey });
      const result = await genAI.models.generateContent({
        model,
        contents: prompt,
      });
      res.json({ text: result.text });
    } catch (error) {
      console.error("[Server] Gemini error:", error);
      res.status(500).json({ error: "Gemini API 呼叫失敗" });
    }
  });

  // ✅ 安全：Gemini PDF 分析路由，API Key 只存在伺服器端
app.post("/api/gemini/parse-pdf", async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "undefined") {
    res.status(500).json({ error: "Gemini API Key 未設定，請聯絡管理員" });
    return;
  }

  const { images } = req.body as { images: string[] };
  if (!images || !Array.isArray(images) || images.length === 0) {
    res.status(400).json({ error: "未收到有效的圖片資料" });
    return;
  }

  const { GoogleGenAI, Type } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey });

  const coursePointsSchema = {
    type: Type.OBJECT,
    properties: {
      physical: { type: Type.NUMBER },
      online: { type: Type.NUMBER },
    },
  };

  const pointsSchema = {
    type: Type.OBJECT,
    properties: {
      professional: { ...coursePointsSchema },
      quality: { ...coursePointsSchema },
      ethics: { ...coursePointsSchema },
      regulations: { ...coursePointsSchema },
      fireSafety: { type: Type.NUMBER },
      emergencyResponse: { type: Type.NUMBER },
      infectionControl: { type: Type.NUMBER },
      genderSensitivity: { type: Type.NUMBER },
      culturalOld: { type: Type.NUMBER },
      culturalNew: {
        type: Type.OBJECT,
        properties: {
          indigenous: { type: Type.NUMBER },
          multicultural: { type: Type.NUMBER },
        },
      },
    },
  };

  const imageParts = images.map((imgBase64: string) => ({
    inlineData: { mimeType: "image/jpeg", data: imgBase64 },
  }));

  const textPart = {
    text: `請分析以下圖片中的長照繼續教育積分，依 JSON 格式精確提取各項積分數值。
    包含：專業課程、專業品質、專業倫理、專業法規、消防安全、緊急應變、感染管制、性別敏感度、
    原住民族與多元文化(舊制 2024/6/3 前)、原住民族文化敏感度及能力與多元族群文化敏感度及能力(新制 2024/6/3 後)。
    有實體/網路之分的請分別提取。未提及或為 0 的項目請設為 0。`,
  };

  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  let lastError: unknown = null;

  for (const model of models) {
    try {
      console.log(`[Gemini] Trying model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: { parts: [textPart, ...imageParts] },
        config: {
          systemInstruction: "您是專門協助台灣長照專業人員的助理，請從繼續教育積分證明文件圖片中精確提取積分資料，以 JSON 格式回傳。",
          responseMimeType: "application/json",
          responseSchema: pointsSchema,
        },
      });

      const jsonString = response.text?.trim();
      if (!jsonString) throw new Error("AI 未回傳有效資料");

      const parsedData = JSON.parse(jsonString);
      res.json({ data: parsedData });
      return;

    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      console.warn(`[Gemini] Model ${model} failed:`, err.message);
      lastError = error;

      const isRetryable =
        err.status === 429 || err.status === 503 ||
        err.message?.includes("429") || err.message?.includes("503") ||
        err.message?.includes("RESOURCE_EXHAUSTED");

      if (!isRetryable) break;
    }
  }

  const errMsg = lastError instanceof Error ? lastError.message : "未知錯誤";
  res.status(500).json({ error: `Gemini 分析失敗：${errMsg}` });
});


  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // ✅ Express 5 SPA fallback
    app.get("/{*splat}", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "8080");

  // API Route for courses - Server-side scraping to bypass CORS
  app.get("/api/courses-proxy", async (req, res) => {
    const targetUrl = 'https://gogocare.com.tw/tw/course/list.html';
    try {
      console.log('[Server] Proxying course fetch for:', targetUrl);
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        }
      });
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const html = await response.text();
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error('[Server] Course proxy error:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    // ✅ 動態 import，只在開發環境才載入 vite
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // 生產環境：服務 dist/ 靜態檔案
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("/{*splat}", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

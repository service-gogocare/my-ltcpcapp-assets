import { Type } from "@google/genai";
import { Points } from "../types";

// PDF 轉 Base64 圖片（保留在前端，需要瀏覽器 Canvas API）
const convertPdfToImagesBase64 = async (file: File): Promise<string[]> => {
  // @ts-ignore
  const pdfjsLib = window.pdfjsLib;
  if (!pdfjsLib) throw new Error("pdf.js is not loaded.");

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const imageBase64Strings: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) continue;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport: viewport }).promise;
    imageBase64Strings.push(canvas.toDataURL("image/jpeg").split(",")[1]);
  }
  return imageBase64Strings;
};

/**
 * 分析 PDF：前端負責轉圖，後端負責呼叫 Gemini API
 */
export const parsePdfForPoints = async (file: File): Promise<Partial<Points>> => {
  try {
    // 1. 前端轉換 PDF → Base64 圖片陣列
    const imageBase64Strings = await convertPdfToImagesBase64(file);

    // 2. 呼叫後端 API（API Key 安全存在伺服器端）
    const response = await fetch("/api/gemini/parse-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: imageBase64Strings }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "伺服器分析失敗");
    }

    const result = await response.json();
    return result.data as Partial<Points>;

  } catch (error) {
    console.error("呼叫後端 Gemini API 時發生錯誤:", error);

    let userMessage = "無法分析PDF文件。請檢查文件內容或稍後再試。";
    if (error instanceof Error) {
      const msg = error.message;
      if (msg.includes("429") || msg.includes("Rate exceeded") || msg.includes("RESOURCE_EXHAUSTED")) {
        userMessage = "目前使用人數過多，請等待約 1 分鐘後再試。";
      } else if (msg.includes("503") || msg.includes("Overloaded")) {
        userMessage = "AI 伺服器繁忙中，請稍後再試。";
      } else {
        userMessage = `分析錯誤：${msg}`;
      }
    }
    throw new Error(userMessage);
  }
};

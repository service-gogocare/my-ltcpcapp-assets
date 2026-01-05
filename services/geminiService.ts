import { GoogleGenAI, Type } from "@google/genai";
import { Points } from "../types";

// This function converts a PDF file into an array of Base64 encoded image strings.
// It remains unchanged as it's a necessary utility.
const convertPdfToImagesBase64 = async (file: File): Promise<string[]> => {
  // @ts-ignore
  const pdfjsLib = window.pdfjsLib;
  if (!pdfjsLib) {
      throw new Error("pdf.js is not loaded.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const imageBase64Strings: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if(!context) continue;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport: viewport }).promise;
    // Get base64 string and remove the data URL prefix (e.g., "data:image/jpeg;base64,")
    imageBase64Strings.push(canvas.toDataURL('image/jpeg').split(',')[1]);
  }
  return imageBase64Strings;
};

// Define the response schema for Gemini to ensure structured JSON output.
const coursePointsSchema = {
    type: Type.OBJECT,
    properties: {
        physical: { type: Type.NUMBER, description: '實體課程積分。如果沒有或為0，請設為 0。' },
        online: { type: Type.NUMBER, description: '線上(網路)課程積分。如果沒有或為0，請設為 0。' }
    },
};

const pointsSchema = {
    type: Type.OBJECT,
    properties: {
        professional: { ...coursePointsSchema, description: '專業課程積分' },
        quality: { ...coursePointsSchema, description: '專業品質積分' },
        ethics: { ...coursePointsSchema, description: '專業倫理積分' },
        regulations: { ...coursePointsSchema, description: '專業法規積分' },
        fireSafety: { type: Type.NUMBER, description: '消防安全積分。如果沒有或為0，請設為 0。' },
        emergencyResponse: { type: Type.NUMBER, description: '緊急應變積分。如果沒有或為0，請設為 0。' },
        infectionControl: { type: Type.NUMBER, description: '感染管制積分。如果沒有或為0，請設為 0。' },
        genderSensitivity: { type: Type.NUMBER, description: '性別敏感度積分。如果沒有或為0，請設為 0。' },
        culturalOld: { type: Type.NUMBER, description: '文化敏感度(舊制 2024/6/3 前)積分。如果沒有或為0，請設為 0。' },
        culturalNew: {
            type: Type.OBJECT,
            description: '文化敏感度(新制 2024/6/3 後)積分',
            properties: {
                indigenous: { type: Type.NUMBER, description: '原住民族文化能力積分。如果沒有或為0，請設為 0。' },
                multicultural: { type: Type.NUMBER, description: '多元族群文化能力積分。如果沒有或為0，請設為 0。' }
            },
        }
    },
};

/**
 * Calls Gemini API with fallback models.
 * If the primary model fails with 429/503, it tries the secondary model.
 */
async function generateContentWithFallback(aiClient: any, params: any) {
    // List of models to try in order.
    // 1. gemini-2.5-flash: Best balance of speed and intelligence.
    // 2. gemini-flash-lite-latest: Faster, lighter, often has separate quota bucket.
    const models = ['gemini-2.5-flash', 'gemini-flash-lite-latest'];
    
    let lastError: any = null;

    for (const model of models) {
        try {
            console.log(`Trying model: ${model}`);
            // Clone params and set the current model
            const currentParams = { ...params, model };
            
            // Internal Retry Loop for the *same* model (quick glitches)
            // We try 2 times per model with a short delay
            let internalRetries = 0;
            const maxInternalRetries = 2;
            
            while (true) {
                try {
                    return await aiClient.models.generateContent(currentParams);
                } catch (err: any) {
                    const errorCode = err.status || err.code;
                    const errorMsg = err.message || '';
                    const isBusy = errorCode === 429 || errorCode === 503 || errorMsg.includes('429') || errorMsg.includes('Rate exceeded') || errorMsg.includes('Overloaded');

                    if (isBusy && internalRetries < maxInternalRetries) {
                        internalRetries++;
                        const delay = 2000 * internalRetries; // Wait 2s, then 4s
                        console.warn(`Model ${model} busy (${errorCode}). Retrying in ${delay}ms...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                    throw err; // Throw to outer loop to trigger model switch
                }
            }

        } catch (error: any) {
            console.warn(`Model ${model} failed:`, error.message);
            lastError = error;
            
            // Check if we should try the next model
            const errorCode = error.status || error.code;
            const errorMsg = error.message || '';
            const isRateLimit = errorCode === 429 || errorMsg.includes('429') || errorMsg.includes('Rate exceeded') || errorMsg.includes('RESOURCE_EXHAUSTED');
            const isServerOverload = errorCode === 503 || errorMsg.includes('503');

            // Only switch models if it's a rate limit or server issue. 
            // If it's a validation error (400), don't switch.
            if (isRateLimit || isServerOverload) {
                console.log('Switching to fallback model...');
                continue; // Try next model in the list
            } else {
                throw error; // Fatal error, stop trying
            }
        }
    }

    // If we exhausted all models
    throw lastError;
}

/**
 * Analyzes a PDF file using the Gemini API directly on the client-side to extract points.
 * @param file - The PDF file uploaded by the user.
 * @returns - An object containing the points extracted from the PDF.
 */
export const parsePdfForPoints = async (file: File): Promise<Partial<Points>> => {
  try {
    // 1. Initialize the Gemini API client
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 2. Convert PDF to an array of Base64 image strings
    const imageBase64Strings = await convertPdfToImagesBase64(file);
    const imageParts = imageBase64Strings.map(imgBase64 => ({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imgBase64,
      },
    }));

    // 3. Prepare the prompt for the Gemini model
    const textPart = {
      text: `請分析以下圖片中的長照繼續教育積分。這些圖片來自一份PDF證明文件。
      請依據指定的JSON格式，精確提取各項課程的積分數值。
      - 「專業課程」
      - 「專業品質」
      - 「專業倫理」
      - 「專業法規」
      - 「消防安全」
      - 「緊急應變」
      - 「感染管制」
      - 「性別敏感度」
      - 「原住民族與多元文化(舊制)」: 這是指 2024/6/3 前的課程。
      - 「原住民族文化敏感度及能力」與「多元族群文化敏感度及能力(新制)」: 這是指 2024/6/3 後的課程。
      
      針對有「實體」和「網路」之分的項目，請分別提取。如果文件中沒有提到某個項目，或積分為0，請將其數值設為 0。
      請務必回傳一個符合下面 schema 的 JSON 物件。`,
    };

    // 4. Call the Gemini API with Fallback Logic
    const response = await generateContentWithFallback(ai, {
        contents: { parts: [textPart, ...imageParts] },
        config: {
          systemInstruction: "您是一位專門協助台灣長照專業人員的智慧助理。您的任務是從繼續教育積分證明文件的圖片中，精確地提取積分資料。請仔細分析圖片中的表格和文字，並依照要求的 JSON 格式回傳結構化數據。請確保所有數值都是數字格式。",
          responseMimeType: "application/json",
          responseSchema: pointsSchema,
        },
    });

    // 5. Parse the response
    const jsonString = response.text.trim();
    if (!jsonString) {
      throw new Error("AI未能回傳有效的資料。");
    }

    const parsedData: Partial<Points> = JSON.parse(jsonString);

    // 6. Clean and return the data, ensuring we don't pass undefined/null values
    // This prevents overwriting user-inputted values with empty ones from the AI
    const finalData: Partial<Points> = {};
    Object.keys(parsedData).forEach(keyStr => {
        const key = keyStr as keyof Points;
        const value = parsedData[key];

        if (value !== undefined && value !== null) {
            // @ts-ignore
            finalData[key] = value;
        }
    });

    return finalData;

  } catch (error) {
    console.error("呼叫 Gemini API 或處理 PDF 時發生錯誤:", error);
    
    // Provide user-friendly error messages based on the error type
    let userMessage = "無法分析PDF文件。請檢查文件內容或稍後再試。";
    
    if (error instanceof Error) {
        const errorMsg = error.message;
        if (errorMsg.includes('429') || errorMsg.includes('Rate exceeded') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
            userMessage = "目前使用人數過多 (流量限制)，系統已嘗試切換備用線路但仍繁忙。請等待約 1 分鐘後再試。";
        } else if (errorMsg.includes('503') || errorMsg.includes('Overloaded')) {
            userMessage = "AI 伺服器繁忙中，請稍後再試。";
        } else {
            userMessage = `分析錯誤：${errorMsg}`;
        }
        throw new Error(userMessage);
    }
    
    throw new Error(userMessage);
  }
};
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File;

    if (!file) {
      return NextResponse.json({ error: '未提供檔案' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: '僅接受 PDF 檔案' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: '檔案大小超過 10MB 限制' }, { status: 413 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY 未設定');
      return NextResponse.json({ error: '伺服器設定錯誤' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const prompt = `請解析此 PDF 中的長照積分資料,以純 JSON 格式回傳:
{
  "professional": { "physical": 0, "online": 0 },
  "quality": { "physical": 0, "online": 0 },
  "ethics": { "physical": 0, "online": 0 },
  "regulations": { "physical": 0, "online": 0 },
  "fireSafety": 0,
  "emergencyResponse": 0,
  "infectionControl": 0,
  "genderSensitivity": 0,
  "culturalOld": 0,
  "culturalNew": { "indigenous": 0, "multicultural": 0 }
}
只回傳 JSON,不要任何額外文字或標記。`;

    const result = await model.generateContent([
      { inlineData: { data: base64Data, mimeType: 'application/pdf' } },
      { text: prompt }
    ]);

    let text = result.response.text();
    console.log('AI 回應長度:', text.length);
    
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    
    if (start === -1 || end === -1 || end <= start) {
      throw new Error('回應中找不到有效的 JSON 物件');
    }
    
    text = text.substring(start, end + 1);
    console.log('提取的 JSON 長度:', text.length);
    
    const extractedPoints = JSON.parse(text);
    console.log('解析成功');
    
    return NextResponse.json(extractedPoints);

  } catch (error) {
    console.error('錯誤:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '解析失敗' },
      { status: 500 }
    );
  }
}

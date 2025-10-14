import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, imageData, points, results } = body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: '無效的 email 格式' }, { status: 400 });
    }

    if (!imageData || !points || !results) {
      return NextResponse.json({ error: '缺少必要資料' }, { status: 400 });
    }

    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    if (!scriptUrl) {
      console.error('GOOGLE_APPS_SCRIPT_URL 未設定');
      return NextResponse.json({ error: '伺服器設定錯誤' }, { status: 500 });
    }

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, imageData, points, results })
    });

    if (!response.ok) {
      throw new Error(`傳送失敗: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json({ success: true, ...result });

  } catch (error) {
    console.error('傳送結果錯誤:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '傳送失敗' },
      { status: 500 }
    );
  }
}

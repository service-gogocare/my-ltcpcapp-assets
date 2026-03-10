// 全功能整合版 GAS - 包含自動更新課程功能 (修正版)
const SPREADSHEET_ID = '1wirzbRmZd8KR9MTSLZ9dmymtFXYeRSYXT4Ml-I1KFrc';

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return createJsonResponse({ error: "Invalid JSON payload" });
  }
  
  const action = data.action;
  const id = (data.id || data.userId || "").toString().toUpperCase().trim();
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  try {
    // --- 新增：抓取最新課程功能 ---
    if (action === 'getCourses') {
      return createJsonResponse({ courses: getLatestCourses(ss) });
    }
    
    // --- 新增：網頁代理抓取 (備用) ---
    if (action === 'proxyFetch') {
      const response = UrlFetchApp.fetch(data.url);
      return createJsonResponse({ html: response.getContentText() });
    }

    // --- 原有：身分驗證邏輯 ---
    if (action === 'checkUser' || action === 'verifyRegistration') {
      const sheetNames = ["學員資料", "新註冊會員"];
      for (let name of sheetNames) {
        const sheet = ss.getSheetByName(name);
        if (sheet) {
          const sheetData = sheet.getDataRange().getValues();
          for (let i = 0; i < sheetData.length; i++) {
            // 檢查第一欄 (A) 或第二欄 (B) 是否匹配 ID
            const colA = sheetData[i][0] ? sheetData[i][0].toString().toUpperCase().trim() : "";
            const colB = sheetData[i][1] ? sheetData[i][1].toString().toUpperCase().trim() : "";
            
            if (colA === id || colB === id) {
              if (name === "新註冊會員" && action === 'verifyRegistration') {
                sheet.getRange(i + 1, 2).setValue("已驗證");
                return createJsonResponse({ exists: true, status: "已驗證" });
              }
              // 回傳狀態，若無則預設已驗證
              const status = (name === "學員資料") ? "已驗證" : (sheetData[i][1] || "已驗證");
              return createJsonResponse({ exists: true, status: status });
            }
          }
        }
      }
      return createJsonResponse({ exists: false });
    }

    // --- 原有：註冊新會員 ---
    if (action === 'register') {
      const sheet = ss.getSheetByName("新註冊會員") || ss.insertSheet("新註冊會員");
      if (sheet.getLastRow() === 0) sheet.appendRow(["身分證字號", "狀態", "註冊時間"]);
      
      // 檢查是否已存在
      const existingData = sheet.getRange("A:A").getValues();
      let exists = false;
      for (let i = 0; i < existingData.length; i++) {
        if (existingData[i][0].toString().toUpperCase().trim() === id) {
          exists = true;
          break;
        }
      }
      
      if (!exists) {
        sheet.appendRow([id, "未驗證", new Date()]);
      }
      return createJsonResponse({ success: true });
    }

    // --- 原有：儲存結果與寄信 ---
    if (action === 'saveData') {
      const sheet = ss.getSheetByName("計算結果") || ss.insertSheet("計算結果");
      if (sheet.getLastRow() === 0) {
        const headers = [
          "驗證時間戳記", "EMAIL", "專業課程_實體", "專業課程_網路", 
          "專業品質_實體", "專業品質_網路", "專業倫理_實體", "專業倫理_網路", 
          "專業法規_實體", "專業法規_網路", "消防安全", "緊急應變", 
          "感染管制", "性別敏感度", "舊制(2024/6/3前取得)累積積分", 
          "原住民族文化敏感度及能力", "多元族群文化敏感度及能力", "總積分", "身分證"
        ];
        sheet.appendRow(headers);
      }
      
      const sData = data.sheetData || {};
      const res = data.results || {};
      
      const row = [
        new Date(),
        sData["EMAIL"] || data.email || "",
        sData["專業課程_實體"] || 0,
        sData["專業課程_網路"] || 0,
        sData["專業品質_實體"] || 0,
        sData["專業品質_網路"] || 0,
        sData["專業倫理_實體"] || 0,
        sData["專業倫理_網路"] || 0,
        sData["專業法規_實體"] || 0,
        sData["專業法規_網路"] || 0,
        sData["消防安全"] || 0,
        sData["緊急應變"] || 0,
        sData["感染管制"] || 0,
        sData["性別敏感度"] || 0,
        sData["舊制(2024/6/3前取得)累積積分"] || 0,
        sData["原住民族文化敏感度及能力"] || 0,
        sData["多元族群文化敏感度及能力"] || 0,
        sData["總積分"] || res.totalPoints || 0,
        sData["身分證"] || id || "guest"
      ];
      
      sheet.appendRow(row);

      if (data.email) {
        // 傳遞統一物件，確保 sendResultEmail 不會遇到 undefined
        const emailData = {
          total: sData["總積分"] || res.totalPoints || 0,
          professional: sData.professional || res.professionalSum || 0,
          qer: sData.qer || res.qualityEthicsRegulationsSum || 0,
          core: sData.core || res.coreCoursesSum || 0,
          cultural: sData.cultural || ((res.culturalOldCapped || 0) + (res.culturalNewTotal || 0)) || 0
        };
        sendResultEmail(data.email, data.imageData, emailData);
      }
      return createJsonResponse({ success: true });
    }

  } catch (f) {
    return createJsonResponse({ error: f.toString() });
  }
}

/**
 * 抓取 GOGO CARE 最新課程並快取在試算表中 (每 12 小時更新一次)
 */
function getLatestCourses(ss) {
  let cacheSheet = ss.getSheetByName("最新課程快取");
  if (!cacheSheet) {
    cacheSheet = ss.insertSheet("最新課程快取");
    cacheSheet.appendRow(["ID", "名稱", "網址", "類別", "更新時間"]);
    cacheSheet.hideSheet();
  }
  
  const now = new Date();
  const lastUpdate = cacheSheet.getRange(2, 5).getValue();
  
  // 檢查快取是否在 12 小時內
  if (lastUpdate && (now.getTime() - new Date(lastUpdate).getTime() < 12 * 60 * 60 * 1000)) {
    const data = cacheSheet.getDataRange().getValues();
    if (data.length > 1) {
      return data.slice(1).map(row => ({ id: row[0], name: row[1], url: row[2], category: row[3] }));
    }
  }
  
  // 抓取官網資料
  const url = 'https://gogocare.com.tw/tw/course/list.html';
  try {
    const response = UrlFetchApp.fetch(url);
    const html = response.getContentText();
    const courses = [];
    const regex = /<a[^>]+href="([^"]*\/course\/detail\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      let href = match[1];
      let title = match[2].replace(/<[^>]*>/g, '').trim();
      if (title.length < 4 || ['詳情', '更多', '報名', '詳細'].includes(title)) continue;
      
      let fullUrl = href.startsWith('http') ? href : 'https://gogocare.com.tw' + (href.startsWith('/') ? '' : '/') + href;
      let category = 'PROFESSIONAL';
      if (/原住民|多元文化|文化敏感|族群/.test(title)) category = 'CULTURAL_NEW';
      else if (/消防|火災|緊急|應變|感染|性別|急救|CPR|AED|感控/.test(title)) category = 'CORE';
      else if (/倫理|法規|法律|品質|權益|隱私|保護|壓力|溝通/.test(title)) category = 'QER';
      
      courses.push(['gas_' + courses.length, title, fullUrl, category, now]);
    }
    
    if (courses.length > 0) {
      cacheSheet.clearContents();
      cacheSheet.appendRow(["ID", "名稱", "網址", "類別", "更新時間"]);
      cacheSheet.getRange(2, 1, courses.length, 5).setValues(courses);
      return courses.map(row => ({ id: row[0], name: row[1], url: row[2], category: row[3] }));
    }
  } catch (e) { console.error(e); }
  return [];
}

function sendResultEmail(email, imageData, sheetData) {
  const blob = Utilities.newBlob(Utilities.base64Decode(imageData.split(",")[1]), "image/jpeg", "積分審核結果.jpg");
  
  // 確保數值格式化
  const total = (Number(sheetData.total) || 0).toFixed(2);
  
  const htmlBody = `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #0a9396;">您的長照積分審核結果</h2>
      <p>您好，這是您剛才在 <b>GOGO CARE 長照積分計算工具</b> 產生的審核報告。</p>
      <div style="background: #f9f9f9; padding: 15px; border-left: 5px solid #0a9396; margin: 20px 0;">
        <p style="margin: 5px 0;"><b>總積分：</b> ${total} 點</p>
      </div>
      <p>詳細的各項積分分佈請參閱郵件附件圖片。</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 14px; color: #666;">若您尚缺積分，歡迎前往 GOGO CARE 選購最新課程：</p>
      <a href="https://gogocare.com.tw/tw/course/list.html" style="display: inline-block; background: #ee9b00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">查看最新課程</a>
    </div>
  `;
  
  MailApp.sendEmail({
    to: email,
    subject: "【GOGO CARE】您的長照積分審核結果報告",
    htmlBody: htmlBody,
    inlineImages: { resultImage: blob },
    name: "GOGO CARE 客服團隊",
    replyTo: "service@gogocare.com.tw"
  });
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// =========================================================================================
// GOGO CARE 長照積分計算機 - 後端處理腳本 (整合 Gmail 草稿範本)
//
// 功能：
// 1. 接收前端 App 傳來的資料 (doPost)。
// 2. 將積分資料寫入指定的 Google Sheet。
// 3. 尋找指定主旨的 Gmail 草稿作為 Email 範本。
// 4. 將前端傳來的資料填入範本的 {{變數}} 中。
// 5. 將前端生成的結果圖片附加到 Email 中。
// 6. 將客製化後的 Email 寄送給使用者。
// 7. 處理 CORS 跨域請求。
//
// 使用說明：
// 1. 複製此檔案的全部內容。
// 2. 前往 https://script.google.com/home 建立一個新專案。
// 3. 將複製的內容貼到 Code.gs 檔案中，覆蓋原有內容。
// 4. 在 Gmail 中建立一封郵件草稿，設定好您要的主旨和內容範本。
// 5. 修改下方的「設定區」，填入您的 Sheet ID 和 Gmail 草稿主旨。
// 6. 點擊「部署」>「新增部署作業」，類型選擇「網頁應用程式」，授權並設定「誰可以存取」為「任何人」。
// 7. 將部署後產生的網址，貼回到前端 App.tsx 的 GOOGLE_APPS_SCRIPT_URL 變數中。
// =========================================================================================


// --- ✨ 請在這裡設定您的資訊 ✨ ---

// 1. 您的 Google Sheet ID
// (從 Google Sheet 網址中取得, 例如: https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit)
const SHEET_ID = '1wirzbRmZd8KR9MTSLZ9dmymtFXYeRSYXT4Ml-I1KFrc'; 

// 2. 您要寫入資料的工作表名稱 (通常是 '工作表1' 或 'Sheet1')
const SHEET_NAME = '工作表1';

// 3. ‼️ 重要：請將此處的主旨，改成您在 Gmail 中儲存的草稿信件主旨
const DRAFT_SUBJECT = '您的長照積分計算結果 | GOGO CARE'; 

// --- ✨ 設定結束 ✨ ---

/**
 * 處理瀏覽器因 CORS 政策發送的 preflight "OPTIONS" 請求
 */
function doOptions(e) {
  return ContentService.createTextOutput()
    .addHeader('Access-Control-Allow-Origin', '*')
    .addHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    .addHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * 處理來自前端 Web App 的 POST 請求
 */
function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    
    const email = requestData.email;
    const points = requestData.points; // 使用者輸入的原始積分
    const results = requestData.results; // 計算後的結果
    const imageDataUrl = requestData.imageData;

    // --- 步驟 1: 寫入資料到 Google Sheet ---
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const newRow = [
      new Date(), // 時間戳
      email,
      points.professional.physical,
      points.professional.online,
      points.quality.physical,
      points.quality.online,
      points.ethics.physical,
      points.ethics.online,
      points.regulations.physical,
      points.regulations.online,
      points.fireSafety,
      points.emergencyResponse,
      points.infectionControl,
      points.genderSensitivity,
      points.culturalOld,
      points.culturalNew.indigenous,
      points.culturalNew.multicultural,
      results.totalPoints // 也把計算後的總分記錄下來
    ];
    sheet.appendRow(newRow);

    // --- 步驟 2: 準備並寄送 Email ---

    // 2a. 取得 Gmail 草稿範本
    const draftTemplate = getDraftBySubject_(DRAFT_SUBJECT);

    // 2b. 準備一個用來替換範本中 {{變數}} 的資料物件
    // 您可以從 results 或 points 物件中，加入任何想在信件中使用的變數
    const dataForTemplate = {
      email: email,
      totalPoints: results.totalPoints.toFixed(2),
      qerPoints: results.qualityEthicsRegulationsSum.toFixed(2),
      corePoints: results.coreCoursesSum.toFixed(2),
      isTotalPointsMet: results.isTotalPointsMet ? '是' : '否',
      isQerMet: results.isQualityEthicsRegulationsSumMet ? '是' : '否',
      isCoreMet: results.isCoreCoursesSumMet ? '是' : '否'
    };

    // 2c. 替換範本中的變數
    const mailBody = replaceVariables_(draftTemplate.htmlBody, dataForTemplate);
    const mailSubject = replaceVariables_(draftTemplate.subject, dataForTemplate);

    // 2d. 準備附件 (包含草稿中原有的附件 + 我們新的結果圖)
    const resultImageBlob = Utilities.newBlob(
      Utilities.base64Decode(imageDataUrl.split(',')[1]), 
      'image/jpeg', 
      '長照積分計算結果.jpeg'
    );
    const attachments = draftTemplate.attachments.concat(resultImageBlob);
    
    // 2e. 寄出 Email
    GmailApp.sendEmail(email, mailSubject, '', {
      htmlBody: mailBody,
      attachments: attachments,
      name: 'GOGO CARE' // 寄件人名稱
    });

    // --- 步驟 3: 回傳成功訊息給前端 ---
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: '資料已記錄，郵件已寄出' }))
      .setMimeType(ContentService.MimeType.JSON)
      .addHeader('Access-Control-Allow-Origin', '*');

  } catch (error) {
    // 發生錯誤時，記錄日誌並回傳錯誤訊息
    Logger.log(error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .addHeader('Access-Control-Allow-Origin', '*');
  }
}


// =================================================================
// HELPER FUNCTIONS (輔助函式)
// =================================================================

/** 
 * 依主旨取得 Gmail 草稿內容
 * @param {string} subjectToFind - 要尋找的草稿主旨.
 * @return {{subject: string, htmlBody: string, attachments: GoogleAppsScript.Gmail.GmailAttachment[]}}
 */
function getDraftBySubject_(subjectToFind) {
  if (!subjectToFind) throw new Error('未在腳本中設定 DRAFT_SUBJECT 變數。');

  const drafts = GmailApp.getDraftMessages();
  const msg = drafts.find(m => m.getSubject() === subjectToFind);
  if (!msg) throw new Error(`在您的 Gmail 中找不到主旨為「${subjectToFind}」的草稿。請檢查主旨是否完全相符。`);

  return {
    subject: msg.getSubject(),
    htmlBody: msg.getBody(),
    attachments: (typeof msg.getAttachments === 'function') ? msg.getAttachments() : []
  };
}

/** 
 * 將範本字串中的 {{變數}} 以 data 物件中的對應值取代
 * @param {string} template - 包含 {{變數}} 的字串.
 * @param {Object} data - 一個 key-value 物件.
 * @return {string}
 */
function replaceVariables_(template, data) {
  // 此正則表達式會尋找 {{ variable }} 這樣的模式，並容許大括號與變數名稱間有空白
  return String(template || '').replace(/{{\s*([^{}\s]+)\s*}}/g, (match, name) => {
    // 如果 data 物件中有這個 key，就回傳它的值，否則回傳空字串以避免顯示 'undefined'
    return data.hasOwnProperty(name) ? data[name] : '';
  });
}
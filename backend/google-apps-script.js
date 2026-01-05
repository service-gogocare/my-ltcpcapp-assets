
// =========================================================================================
// GOGO CARE 長照積分計算機 - 整合型後端腳本 (GMT+8 時區優化版)
// =========================================================================================

const ID_DB_SHEET_ID = '1b-DTUucLj8GGsgee1p1nSfLVc4ZpBJh8TwVdwaa86nE'; 
const ID_DB_SHEET_NAME = '學員資料'; 
const NEW_MEMBER_SHEET_NAME = '新註冊會員'; 

const LOG_SHEET_ID = '1wirzbRmZd8KR9MTSLZ9dmymtFXYeRSYXT4Ml-I1KFrc';
const LOG_SHEET_NAME = '工作表1';

const DRAFT_SUBJECT = '您的長照積分計算結果 | GOGO CARE'; 

/**
 * 取得 GMT+8 的格式化時間字串
 */
function getGmt8Time_() {
  return Utilities.formatDate(new Date(), "GMT+8", "yyyy/MM/dd HH:mm:ss");
}

/**
 * 取得指定工作表，若不存在則建立 (針對新註冊會員表)
 */
function getOrCreateSheet_(ssId, name) {
  const ss = SpreadsheetApp.openById(ssId);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // 建立標題列
    sheet.appendRow(['新註冊會員身分證字號', '驗證狀態', '最後更新時間']);
    sheet.getRange("1:1").setFontWeight("bold").setBackground("#d9ead3");
  }
  return sheet;
}

function getSheet_(ssId, name) {
  const ss = SpreadsheetApp.openById(ssId);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }
  return sheet;
}

/**
 * 處理 GET：驗證身分與註冊流程
 */
function doGet(e) {
  const action = e.parameter.action;
  const id = e.parameter.id ? e.parameter.id.toUpperCase().trim() : null;
  let result = { exists: false, status: null, error: null };

  try {
    if (!id) throw new Error("缺少身分證字號參數");

    if (action === 'checkUser') {
      // 1. 先查「學員資料」表 (原始資料庫)
      const idSheet = getSheet_(ID_DB_SHEET_ID, ID_DB_SHEET_NAME);
      const idData = idSheet.getRange("B:B").getValues();
      for (let i = 0; i < idData.length; i++) {
        if (String(idData[i][0]).toUpperCase().trim() === id) {
          result.exists = true;
          return sendResponse_(result);
        }
      }

      // 2. 若沒找到，查「新註冊會員」表 (需為已驗證)
      const newMemberSheet = getOrCreateSheet_(ID_DB_SHEET_ID, NEW_MEMBER_SHEET_NAME);
      const newMemberData = newMemberSheet.getDataRange().getValues();
      for (let i = 1; i < newMemberData.length; i++) {
        if (String(newMemberData[i][0]).toUpperCase().trim() === id) {
          if (newMemberData[i][1] === '已驗證') {
            result.exists = true;
          } else {
            result.status = '未驗證';
          }
          break;
        }
      }
    } 
    
    else if (action === 'registerPending') {
      const sheet = getOrCreateSheet_(ID_DB_SHEET_ID, NEW_MEMBER_SHEET_NAME);
      const data = sheet.getRange("A:A").getValues();
      let foundIndex = -1;
      const now = getGmt8Time_();

      for (let i = 0; i < data.length; i++) {
        if (String(data[i][0]).toUpperCase().trim() === id) {
          foundIndex = i + 1;
          break;
        }
      }
      
      if (foundIndex === -1) {
        // A欄:身分證, B欄:狀態, C欄:時間
        sheet.appendRow([id, '未驗證', now]);
      } else {
        const currentStatus = sheet.getRange(foundIndex, 2).getValue();
        if (currentStatus !== '已驗證') {
           sheet.getRange(foundIndex, 3).setValue(now);
        }
      }
      result.success = true;
    }

    else if (action === 'verifyRegistration') {
      const sheet = getOrCreateSheet_(ID_DB_SHEET_ID, NEW_MEMBER_SHEET_NAME);
      const data = sheet.getRange("A:A").getValues();
      let foundIndex = -1;
      const now = getGmt8Time_();

      for (let i = 0; i < data.length; i++) {
        if (String(data[i][0]).toUpperCase().trim() === id) {
          foundIndex = i + 1;
          break;
        }
      }

      if (foundIndex !== -1) {
        sheet.getRange(foundIndex, 2).setValue('已驗證');
        sheet.getRange(foundIndex, 3).setValue(now);
        result.exists = true; 
      } else {
        result.error = "找不到該註冊資料，請重新點擊註冊按鈕。";
      }
    }

  } catch (err) {
    result.error = err.toString();
  }

  return sendResponse_(result);
}

function sendResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 處理 POST：儲存並寄信
 */
function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const userId = requestData.userId.toUpperCase().trim();
    const now = getGmt8Time_();
    let email = null;

    const idSheet = getSheet_(ID_DB_SHEET_ID, ID_DB_SHEET_NAME);
    const idData = idSheet.getDataRange().getValues();
    for (let i = 0; i < idData.length; i++) {
      if (idData[i][1] && String(idData[i][1]).toUpperCase().trim() === userId) {
        email = String(idData[i][2]).trim();
        break;
      }
    }

    if (!email || email === "") {
        throw new Error("此學員尚未在資料庫中設定 Email，請聯絡管理員手動補入。");
    }

    const points = requestData.points;
    const results = requestData.results;
    const imageDataUrl = requestData.imageData;

    const logSheet = getSheet_(LOG_SHEET_ID, LOG_SHEET_NAME);
    logSheet.appendRow([
      now, userId, email,
      points.professional.physical, points.professional.online,
      points.quality.physical, points.quality.online,
      points.ethics.physical, points.ethics.online,
      points.regulations.physical, points.regulations.online,
      points.fireSafety, points.emergencyResponse, points.infectionControl,
      points.genderSensitivity, points.culturalOld,
      points.culturalNew.indigenous, points.culturalNew.multicultural,
      results.totalPoints
    ]);

    const drafts = GmailApp.getDraftMessages();
    const msg = drafts.find(m => m.getSubject() === DRAFT_SUBJECT);
    if (!msg) throw new Error("找不到 Gmail 草稿: " + DRAFT_SUBJECT);

    const dataForTemplate = {
      email: email, userId: userId,
      totalPoints: Number(results.totalPoints).toFixed(2),
      qerPoints: Number(results.qualityEthicsRegulationsSum).toFixed(2),
      corePoints: Number(results.coreCoursesSum).toFixed(2),
      isTotalPointsMet: results.isTotalPointsMet ? '是' : '否'
    };

    const replaceVars = (str, data) => str.replace(/{{\s*([^{}\s]+)\s*}}/g, (m, n) => data[n] || m);
    const mailBody = replaceVars(msg.getBody(), dataForTemplate);
    const mailSubject = replaceVars(msg.getSubject(), dataForTemplate);
    const blob = Utilities.newBlob(Utilities.base64Decode(imageDataUrl.split(',')[1]), 'image/jpeg', '長照積分結果.jpeg');
    
    GmailApp.sendEmail(email, mailSubject, '', {
      htmlBody: mailBody,
      attachments: (msg.getAttachments() || []).concat(blob),
      name: 'GOGO CARE'
    });

    return sendResponse_({ status: 'success' });

  } catch (error) {
    return sendResponse_({ status: 'error', message: error.toString() });
  }
}

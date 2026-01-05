import { RecommendedCourse } from '../types';

// =================================================================
// ✨ GOGO CARE 課程推薦列表 ✨ (根據 2024/09/10 網站線上課程資料更新)
// category:
// 'PROFESSIONAL' -> 專業課程
// 'QER'      -> 專業品質/倫理/法規
// 'CORE'     -> 課程類別 (消防/應變/感控/性別)
// 'CULTURAL_NEW' -> 新制文化敏感度課程
// =================================================================

const BASE_URL = 'https://gogocare.com.tw';

export const recommendedCourses: RecommendedCourse[] = [
  // --- PROFESSIONAL (專業課程) Courses ---
  { id: 1, name: "網路課程－認識樂齡聽力損失", url: `${BASE_URL}/tw/course/detail/C20250609171344001`, category: 'PROFESSIONAL' },
  { id: 2, name: "網路課程－六大類食物份量代換", url: `${BASE_URL}/tw/course/detail/C20250602113508001`, category: 'PROFESSIONAL' },
  { id: 3, name: "網路課程－急救與急症處置(下)", url: `${BASE_URL}/tw/course/detail/C20250602115747001`, category: 'PROFESSIONAL' },
  { id: 4, name: "網路課程－急救與急症處置(上)", url: `${BASE_URL}/tw/course/detail/C20250602115636001`, category: 'PROFESSIONAL' },
  { id: 5, name: "網路課程－擬定使用者有感的短期照顧計畫－自立支援實戰篇", url: `${BASE_URL}/tw/course/detail/C20250602114037001`, category: 'PROFESSIONAL' },
  { id: 6, name: "網路課程－實現自主生活的照顧－自立支援觀念篇", url: `${BASE_URL}/tw/course/detail/C20250602113903001`, category: 'PROFESSIONAL' },
  { id: 7, name: "網路課程－自立支援四大基本照顧實作(一)－喝水、飲食", url: `${BASE_URL}/tw/course/detail/C20250602113634001`, category: 'PROFESSIONAL' },
  { id: 8, name: "網路課程－六大類營養與銀髮族均衡飲食", url: `${BASE_URL}/tw/course/detail/C20250602113348001`, category: 'PROFESSIONAL' },
  { id: 9, name: "網路課程－生命徵象與身心狀況評估", url: `${BASE_URL}/tw/course/detail/C20250602113229001`, category: 'PROFESSIONAL' },
  { id: 10, name: "網路課程－皮膚系統評估與照護", url: `${BASE_URL}/tw/course/detail/C20250602113101001`, category: 'PROFESSIONAL' },
  { id: 11, name: "網路課程－原來失智的世界是這樣-從神經學變化看失智症照顧及溝通", url: `${BASE_URL}/tw/course/detail/C20250602112338001`, category: 'PROFESSIONAL' },
  { id: 12, name: "網路課程－照顧服務概論", url: `${BASE_URL}/tw/course/detail/C20250602112002001`, category: 'PROFESSIONAL' },
  { id: 13, name: "網路課程－失智症的溝通 - 與失智症者交談、相處之道~談溝通", url: `${BASE_URL}/tw/course/detail/C20250602111300001`, category: 'PROFESSIONAL' },
  { id: 14, name: "網路課程－居家用藥安全：用藥照護技巧", url: `${BASE_URL}/tw/course/detail/C20250602105714001`, category: 'PROFESSIONAL' },
  { id: 15, name: "網路課程－居家用藥安全：認識你我常用藥物", url: `${BASE_URL}/tw/course/detail/C20250529164151001`, category: 'PROFESSIONAL' },
  { id: 16, name: "直播課程－失智症照顧與對應技巧", url: `${BASE_URL}/tw/course/detail/C20250623164028001`, category: 'PROFESSIONAL' },
  { id: 17, name: "實體課程－CPR暨AED訓練", url: `${BASE_URL}/tw/course/detail/C20250910151011001`, category: 'PROFESSIONAL' },
  { id: 18, name: "實體課程－失智症照顧與對應技巧", url: `${BASE_URL}/tw/course/detail/C20250623165348001`, category: 'PROFESSIONAL' },

  // --- QER (專業品質/倫理/法規) Courses ---
  { id: 19, name: "網路課程－照顧中的自我保護與痠痛舒緩", url: `${BASE_URL}/tw/course/detail/C20250624160613001`, category: 'QER' },
  { id: 20, name: "網路課程－居家用藥安全：個案用藥注意事項", url: `${BASE_URL}/tw/course/detail/C20250609171750001`, category: 'QER' },
  { id: 21, name: "網路課程－到底是誰的問題？職場情緒暴力", url: `${BASE_URL}/tw/course/detail/C20250602112626001`, category: 'QER' },
  { id: 22, name: "網路課程－情緒OK繃，壓力調適與情緒急救", url: `${BASE_URL}/tw/course/detail/C20250602112802001`, category: 'QER' },
  { id: 23, name: "網路課程－職業安全-不法侵害與過負荷預防與紓解", url: `${BASE_URL}/tw/course/detail/C20250602112926001`, category: 'QER' },
  { id: 24, name: "網路課程－自立支援四大基本照顧實作(二)－排泄、運動", url: `${BASE_URL}/tw/course/detail/C20250602113753001`, category: 'QER' },
  { id: 25, name: "網路課程－職業安全-多做一步、保護多一步", url: `${BASE_URL}/tw/course/detail/C20250602115506001`, category: 'QER' },
  { id: 26, name: "網路課程－長期照顧社會資源運用", url: `${BASE_URL}/tw/course/detail/C20250602120000001`, category: 'QER' },
  { id: 27, name: "直播視訊課程－老人保護與服務", url: `${BASE_URL}/tw/course/detail/C20250829153637001`, category: 'QER' },
  { id: 28, name: "實體課程－老人保護與服務", url: `${BASE_URL}/tw/course/detail/C20250829161022001`, category: 'QER' },
  { id: 29, name: "網路課程－失智症照顧倫理（初級）", url: `${BASE_URL}/tw/course/detail/C20250602115219001`, category: 'QER' },
  { id: 30, name: "網路課程－讓愛無礙-認識愛滋與社會議題", url: `${BASE_URL}/tw/course/detail/C20250602115854001`, category: 'QER' },
  { id: 31, name: "網路課程－長照服務人員法律風險須知", url: `${BASE_URL}/tw/course/detail/C20250602111812001`, category: 'QER' },

  // --- CORE (消防/應變/感控/性別) Courses ---
  { id: 32, name: "網路課程－緊急應變-一氧化碳中毒及天然災害處置", url: `${BASE_URL}/tw/course/detail/C20250602112506001`, category: 'CORE' },
  { id: 33, name: "網路課程－消防－火災意外事件處置與應變", url: `${BASE_URL}/tw/course/detail/C20250602115100001`, category: 'CORE' },
  { id: 34, name: "網路課程－居家感染控制概論", url: `${BASE_URL}/tw/course/detail/C20250602111622001`, category: 'CORE' },
  { id: 35, name: "網路課程－消防－居家火災風險評估及預防", url: `${BASE_URL}/tw/course/detail/C20250602110901001`, category: 'CORE' },
  { id: 36, name: "網路課程－常見緊急事故處置", url: `${BASE_URL}/tw/course/detail/C20250602110417001`, category: 'CORE' },
  { id: 37, name: "網路課程－當我的個案是愛滋_照護愛滋患者的關鍵要點", url: `${BASE_URL}/tw/course/detail/C20250325103443001`, category: 'CORE' },
  { id: 38, name: "直播課程－感染防治", url: `${BASE_URL}/tw/course/detail/C20250729175052001`, category: 'CORE' },
  { id: 39, name: "網路課程－性別主流化及工作中的性別意識", url: `${BASE_URL}/tw/course/detail/C20250602115344001`, category: 'CORE' },
  
  // --- CULTURAL_NEW (新制文化敏感度課程) Courses ---
  { id: 40, name: "直播課程－原住民族權益、台灣多元文化共融", url: `${BASE_URL}/tw/course/detail/C20250729174459001`, category: 'CULTURAL_NEW' },
  { id: 41, name: "網路課程－文化安全與原住民族長期照顧", url: `${BASE_URL}/tw/course/detail/C20250602112141001`, category: 'CULTURAL_NEW' },
  { id: 42, name: "網路課程－文化敏感度照顧議題", url: `${BASE_URL}/tw/course/detail/C20250602120107001`, category: 'CULTURAL_NEW' },
];

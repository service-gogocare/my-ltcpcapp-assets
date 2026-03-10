import { RecommendedCourse } from '../types';

// =================================================================
// ✨ GOGO CARE 課程推薦列表 ✨
// 當動態抓取失敗時，將顯示此保底連結引導使用者前往官網
// =================================================================

const BASE_URL = 'https://gogocare.com.tw';

export const recommendedCourses: RecommendedCourse[] = [
  { id: 'fallback_prof', name: "前往 GOGO CARE 查看最新專業課程", url: `${BASE_URL}/tw/course/list.html`, category: 'PROFESSIONAL' },
  { id: 'fallback_qer', name: "前往 GOGO CARE 查看最新品質/倫理/法規課程", url: `${BASE_URL}/tw/course/list.html`, category: 'QER' },
  { id: 'fallback_core', name: "前往 GOGO CARE 查看最新消防/應變/感控/性別課程", url: `${BASE_URL}/tw/course/list.html`, category: 'CORE' },
  { id: 'fallback_cult', name: "前往 GOGO CARE 查看最新文化敏感度課程", url: `${BASE_URL}/tw/course/list.html`, category: 'CULTURAL_NEW' },
];

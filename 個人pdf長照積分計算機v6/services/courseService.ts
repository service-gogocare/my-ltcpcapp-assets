import { RecommendedCourse } from '../types';
import { recommendedCourses as fallbackCourses } from '../data/courses';

const TARGET_URL = 'https://gogocare.com.tw/tw/course/list.html';
const BASE_URL = 'https://gogocare.com.tw';

const KEYWORDS = {
  CULTURAL_NEW: ['原住民', '多元文化', '文化敏感', '族群', '文化能力', '布農', '泰雅', '阿美'],
  CORE: ['消防', '火災', '緊急', '應變', '感染', '性別', '急救', 'CPR', 'AED', '傳染病', '感控', '人身安全', '災害'],
  QER: ['倫理', '法規', '法律', '品質', '權益', '隱私', '保護', '自我保護', '舒緩', '心理', '壓力', '溝通', '糾紛', '職場', '申訴'],
};

/**
 * Helper to fetch HTML content using multiple proxy strategies to ensure reliability.
 */
async function fetchHTMLWithFallback(targetUrl: string): Promise<string> {
    // Append timestamp to the *target* URL to ensure we don't get a cached version from the target server
    const targetWithCacheBust = `${targetUrl}?t=${Date.now()}`;
    const encodedTarget = encodeURIComponent(targetWithCacheBust);

    // Strategy 1: AllOrigins JSON Endpoint (Most reliable for CORS)
    // We use /get instead of /raw because /get returns JSON with Access-Control-Allow-Origin: *
    // and wraps the content, avoiding header conflicts from the source site.
    try {
        console.log('[CourseService] Strategy 1: Trying AllOrigins (JSON mode)...');
        const res = await fetch(`https://api.allorigins.win/get?url=${encodedTarget}`);
        if (res.ok) {
            const data = await res.json();
            if (data.contents) {
                return data.contents;
            }
        }
        console.warn('[CourseService] AllOrigins returned empty content.');
    } catch (e) {
        console.warn('[CourseService] AllOrigins failed:', e);
    }

    // Strategy 2: CorsProxy.io (Direct HTML)
    // Faster, but sometimes blocked or stricter. Good backup.
    try {
        console.log('[CourseService] Strategy 2: Trying CorsProxy.io...');
        const res = await fetch(`https://corsproxy.io/?${encodedTarget}`);
        if (res.ok) {
            return await res.text();
        }
        console.warn('[CourseService] CorsProxy.io returned status:', res.status);
    } catch (e) {
        console.warn('[CourseService] CorsProxy.io failed:', e);
    }

    throw new Error('All proxy strategies failed to fetch course data.');
}

export const fetchRecommendedCourses = async (): Promise<RecommendedCourse[]> => {
  try {
    const htmlString = await fetchHTMLWithFallback(TARGET_URL);
    console.log(`[CourseService] Fetch success. Content length: ${htmlString.length}`);

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    // Select all links (<a> tags)
    const allLinks = Array.from(doc.querySelectorAll('a'));
    
    const coursesMap = new Map<string, RecommendedCourse>();
    
    allLinks.forEach((link, index) => {
        const href = link.getAttribute('href');
        
        // Filter: Must contain 'course' and 'detail' to identify course pages
        // Example: /tw/course/detail/C2025...
        if (!href || !href.includes('course') || !href.includes('detail')) return;
        
        // Normalize URL to absolute path
        let fullUrl = href;
        if (href.startsWith('/')) {
            fullUrl = `${BASE_URL}${href}`;
        } else if (!href.startsWith('http')) {
            fullUrl = `${BASE_URL}/${href}`;
        }

        // --- Title Extraction Strategies ---
        let title = '';

        // 1. Look for headers inside the link (common in card layouts)
        const headerInside = link.querySelector('h3, h4, h5, .title, .course-title, .name');
        if (headerInside && headerInside.textContent) {
            title = headerInside.textContent.trim();
        }

        // 2. Look for image alt text inside the link
        if (!title) {
            const img = link.querySelector('img');
            if (img && img.getAttribute('alt')) {
                title = img.getAttribute('alt')?.trim() || '';
            }
        }

        // 3. Fallback: Direct text content of the link
        if (!title) {
             title = (link.textContent || '').replace(/[\n\r\t]+/g, ' ').replace(/\s+/g, ' ').trim();
        }

        // --- Validation & Filtering ---
        if (!title || title.length < 4) return;
        
        // Exclude generic UI buttons
        const ignoreList = ['詳情', '更多', '報名', 'Read More', 'View', '詳細', '立即報名', '課程介紹'];
        if (ignoreList.some(s => title === s)) return;

        // Categorize based on keywords
        let category: RecommendedCourse['category'] = 'PROFESSIONAL';
        
        if (KEYWORDS.CULTURAL_NEW.some(k => title.includes(k))) {
            category = 'CULTURAL_NEW';
        } else if (KEYWORDS.CORE.some(k => title.includes(k))) {
            category = 'CORE';
        } else if (KEYWORDS.QER.some(k => title.includes(k))) {
            category = 'QER';
        }

        // Avoid duplicates using URL as key
        if (!coursesMap.has(fullUrl)) {
            coursesMap.set(fullUrl, {
                id: 3000 + index, // Dynamic ID range to avoid conflict with static IDs
                name: title,
                url: fullUrl,
                category
            });
        }
    });
    
    const fetchedCourses = Array.from(coursesMap.values());
    console.log(`[CourseService] Parsed ${fetchedCourses.length} valid courses.`);
    
    if (fetchedCourses.length === 0) {
        console.warn('[CourseService] No courses parsed. Falling back to static data.');
        return fallbackCourses;
    }
    
    return fetchedCourses;

  } catch (error) {
    console.error('[CourseService] Error during course fetch:', error);
    // Return fallback so the UI remains functional
    return fallbackCourses;
  }
};
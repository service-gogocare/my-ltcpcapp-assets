import React from 'react';

export const GuideImage04: React.FC = () => (
    <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" fontFamily="'PingFang TC', 'Helvetica Neue', 'Microsoft JhengHei', sans-serif">
        {/* Background */}
        <rect width="800" height="600" fill="#f9fafb" />
        
        {/* Title */}
        <text x="400" y="50" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#005f73">
            完成！查看您的積分結果
        </text>

        {/* Main Content Area - Simplified Result Card */}
        <g transform="translate(100, 100)">
            <rect width="600" height="420" rx="15" fill="white" stroke="#e5e7eb" />
            
            {/* Header inside the card */}
            <text x="30" y="40" fontSize="20" fontWeight="bold" fill="#005f73">積分審核結果</text>
            <rect x="480" y="20" width="100" height="30" rx="5" fill="#005f73" />
            <text x="530" y="40" textAnchor="middle" fill="white" fontSize="12">↓ 下載結果</text>
            
            {/* Progress Bar - Adjusted to 72% */}
            <rect x="30" y="80" width="540" height="15" rx="7.5" fill="#e5e7eb" />
            <rect x="30" y="80" width="389" height="15" rx="7.5" fill="#0a9396" />
            <text x="570" y="92" textAnchor="end" fontSize="12" fill="#005f73" fontWeight="bold">72%</text>

            {/* Donut Charts Area - Adjusted y-spacing */}
            <rect x="30" y="115" width="260" height="120" rx="8" fill="#f3f4f6" />
            <circle cx="90" cy="175" r="30" fill="none" stroke="#d1d5db" strokeWidth="8" />
            <circle cx="90" cy="175" r="30" fill="none" stroke="#0a9396" strokeWidth="8" strokeDasharray="170 188.4" transform="rotate(-90 90 175)" />
            <text x="160" y="180" fontSize="14" fontWeight="600">專業課程</text>

            <rect x="310" y="115" width="260" height="120" rx="8" fill="#f3f4f6" />
            <circle cx="370" cy="175" r="30" fill="none" stroke="#d1d5db" strokeWidth="8" />
            <circle cx="370" cy="175" r="30" fill="none" stroke="#2a9d8f" strokeWidth="8" strokeDasharray="188.4 188.4" transform="rotate(-90 370 175)" />
            <text x="440" y="165" fontSize="14" fontWeight="600">專業品質/</text>
            <text x="440" y="185" fontSize="14" fontWeight="600">倫理/法規</text>

            {/* Other sections - Adjusted y-spacing */}
            <rect x="30" y="250" width="540" height="60" rx="8" fill="#f3f4f6" />
            <text x="50" y="285" fontSize="14" fill="#374151">消防、應變、感控、性別積分</text>
            <text x="500" y="285" fontSize="14" fill="#e76f51" fontWeight="bold">❌ 未達標</text>

            <rect x="30" y="325" width="540" height="60" rx="8" fill="#f3f4f6" />
            <text x="50" y="360" fontSize="14" fill="#374151">文化敏感度課程</text>
            <rect x="470" y="343" width="80" height="25" rx="12" stroke="#0a9396" fill="none" />
            <text x="510" y="360" textAnchor="middle" fontSize="10" fill="#0a9396">推薦課程</text>
        </g>
        
        {/* Explanations with arrows */}
        {/* Arrow 1: Auto-calculate */}
        <g>
            <path d="M130 120 L80 100" stroke="#e76f51" fill="none" strokeWidth="3" strokeDasharray="8 4" />
            <path d="M75 95 L85 98 L80 105" stroke="#e76f51" fill="none" strokeWidth="3" strokeLinecap="round" />
            <g transform="translate(20, 70)">
                <circle cx="0" cy="9" r="5" fill="#f59e0b" />
                <text x="15" y="14" fontSize="16" fontWeight="600" fill="#111827">自動計算積分結果</text>
            </g>
        </g>

        {/* Arrow 2: Recommendations - Redrawn path */}
        <g>
            <path d="M560 450 Q 530 500 580 505" stroke="#e76f51" fill="none" strokeWidth="3" strokeDasharray="8 4" />
            <path d="M575 512 L580 500 L590 505" stroke="#e76f51" fill="none" strokeWidth="3" strokeLinecap="round" />
            <g transform="translate(600, 500)">
                <circle cx="0" cy="9" r="5" fill="#f59e0b" />
                <text x="15" y="14" fontSize="16" fontWeight="600" fill="#111827">可參考推薦課程</text>
            </g>
        </g>
    </svg>
);
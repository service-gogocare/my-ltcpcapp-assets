import React from 'react';

export const GuideImage03: React.FC = () => (
    <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" fontFamily="'PingFang TC', 'Helvetica Neue', 'Microsoft JhengHei', sans-serif">
        {/* Background */}
        <rect width="800" height="600" fill="#f9fafb" />
        
        {/* Title */}
        <text x="400" y="50" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#005f73">
            上傳您的積分 PDF 文件
        </text>

        {/* Part 1: App UI - Moved further left for spacing */}
        <g transform="translate(20, 100)">
            <rect width="320" height="200" rx="10" fill="white" stroke="#e5e7eb" />
            <text x="160" y="50" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#005f73">開始您的積分計算</text>
            <text x="160" y="80" textAnchor="middle" fontSize="12" fill="#6b7280">上傳您的積分PDF文件，或選擇手動輸入。</text>
            
            {/* Upload Button */}
            <rect x="40" y="110" width="240" height="40" rx="5" fill="#0a9396" />
            <text x="160" y="135" textAnchor="middle" fill="white" fontWeight="600">↑ 上傳PDF</text>
            
            {/* Arrow pointing to button */}
            <path d="M160 170 Q160 210 130 220" stroke="#e76f51" fill="none" strokeWidth="3" strokeDasharray="8 4" />
            <path d="M125 225 L130 215 L140 222" stroke="#e76f51" fill="none" strokeWidth="3" strokeLinecap="round" />
            <text x="120" y="250" textAnchor="middle" fontSize="18" fontWeight="600" fill="#111827">1. 點擊「上傳PDF」</text>
        </g>

        {/* Connecting Arrow - Widened for new spacing */}
        <path d="M350 200 C 380 200, 450 200, 470 200" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />

        {/* Part 2: File Explorer - Moved further right for spacing */}
        <g transform="translate(480, 120)">
            <rect width="300" height="250" rx="8" fill="white" stroke="#e5e7eb" />
            {/* Top bar */}
            <rect width="300" height="30" fill="#e5e7eb" rx="8" ry="8" />
            <circle cx="20" cy="15" r="5" fill="#fca5a5" />
            <circle cx="35" cy="15" r="5" fill="#fcd34d" />
            <circle cx="50" cy="15" r="5" fill="#86efac" />
            {/* File list */}
            <rect x="20" y="50" width="260" height="30" rx="3" fill="#f3f4f6" />
            <text x="30" y="70" fontSize="12">📄 我的文件</text>

            <rect x="20" y="90" width="260" height="30" rx="3" fill="#dbeafe" stroke="#93c5fd" />
            <text x="30" y="110" fontSize="12" fontWeight="600">📄 長照積分證明.pdf</text>

            <rect x="20" y="130" width="260" height="30" rx="3" fill="#f3f4f6" />
            <text x="30" y="150" fontSize="12">📁 旅遊照片</text>
            
            {/* Open Button */}
            <rect x="200" y="200" width="80" height="30" rx="5" fill="#005f73" />
            <text x="240" y="220" textAnchor="middle" fill="white" fontSize="12">開啟</text>

            <text x="150" y="300" textAnchor="middle" fontSize="18" fontWeight="600" fill="#111827">2. 選擇下載好的PDF檔案</text>
        </g>
        
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#d1d5db" />
            </marker>
        </defs>
    </svg>
);
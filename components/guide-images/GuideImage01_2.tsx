import React from 'react';

export const GuideImage01_2: React.FC = () => (
    <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" fontFamily="'PingFang TC', 'Helvetica Neue', 'Microsoft JhengHei', sans-serif">
        {/* Background */}
        <rect width="800" height="600" fill="#f9fafb" />
        
        {/* Title */}
        <text x="400" y="50" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#005f73">
            如何下載積分證明 PDF
        </text>

        {/* Step 1: Click Menu */}
        <g transform="translate(50, 100)">
            <rect width="300" height="150" rx="8" fill="white" stroke="#e5e7eb" />
            <rect width="300" height="30" fill="#e5e7eb" rx="8" ry="8" />
            <circle cx="20" cy="15" r="5" fill="#fca5a5" />
            <circle cx="35" cy="15" r="5" fill="#fcd34d" />
            <circle cx="50" cy="15" r="5" fill="#86efac" />
            
            <text x="150" y="90" textAnchor="middle" fontSize="14" fill="#6b7280">...網頁內容...</text>

            {/* Three dots icon */}
            <circle cx="280" cy="50" r="2.5" fill="#374151" />
            <circle cx="280" cy="60" r="2.5" fill="#374151" />
            <circle cx="280" cy="70" r="2.5" fill="#374151" />
            
            <text x="150" y="180" textAnchor="middle" fontSize="18" fontWeight="600" fill="#111827">1. 按右上角冒號 (選單)</text>
        </g>

        {/* Connecting Arrow 1 */}
        <path d="M360 175 L440 175" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />
        
        {/* Step 2: Click Print */}
        <g transform="translate(450, 100)">
            <rect width="200" height="150" rx="8" fill="white" stroke="#e5e7eb" />
            <text x="20" y="40" fontSize="14" fill="#374151">新增分頁</text>
            <rect x="10" y="60" width="180" height="30" fill="#dbeafe" />
            <text x="20" y="80" fontWeight="600" fontSize="14" fill="#1e3a8a">列印...</text>
            <text x="20" y="120" fontSize="14" fill="#374151">尋找...</text>
            <text x="100" y="180" textAnchor="middle" fontSize="18" fontWeight="600" fill="#111827">2. 選擇「列印」</text>
        </g>
        
        {/* Connecting Arrow 2 */}
        <path d="M400 260 L400 310" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />

        {/* Step 3 & 4: Print Dialog */}
        <g transform="translate(150, 320)">
            <rect width="500" height="200" rx="8" fill="white" stroke="#e5e7eb" />
            <text x="20" y="35" fontSize="18" fontWeight="600">列印</text>
            <line x1="10" y1="50" x2="490" y2="50" stroke="#e5e7eb" />
            
            <text x="40" y="95" fontSize="16">目的地</text>
            <rect x="120" y="75" width="250" height="40" rx="5" fill="#dbeafe" stroke="#93c5fd" />
            <text x="130" y="100" fontSize="16" fontWeight="600" fill="#1e3a8a">另存為 PDF</text>
            
            {/* Save Button */}
            <rect x="390" y="150" width="90" height="35" rx="5" fill="#005f73" />
            <text x="435" y="172" textAnchor="middle" fill="white">儲存</text>

            <text x="250" y="230" textAnchor="middle" fontSize="18" fontWeight="600" fill="#111827">3. 目的地選「另存為PDF」並儲存</text>
        </g>
        
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#d1d5db" />
            </marker>
        </defs>
    </svg>
);
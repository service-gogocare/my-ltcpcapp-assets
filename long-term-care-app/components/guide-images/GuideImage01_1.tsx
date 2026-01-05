// FIX: Replaced placeholder content with a valid React component.
// This component renders an SVG illustration for the usage guide.
import React from 'react';

export const GuideImage01_1: React.FC = () => (
  <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" fontFamily="'PingFang TC', 'Helvetica Neue', 'Microsoft JhengHei', sans-serif">
    <rect width="800" height="600" fill="#f3f4f6" />
    
    {/* Browser top bar */}
    <rect width="800" height="40" fill="#e5e7eb" />
    <circle cx="20" cy="20" r="6" fill="#fca5a5" />
    <circle cx="40" cy="20" r="6" fill="#fcd34d" />
    <circle cx="60" cy="20" r="6" fill="#86efac" />
    
    {/* URL bar */}
    <rect x="80" y="10" width="600" height="20" rx="10" fill="white" />
    <text x="90" y="25" fill="#6b7280" fontSize="12">https://ltcpap.mohw.gov.tw/molc/eg999/index</text>

    {/* Page Content */}
    <rect x="50" y="70" width="700" height="480" rx="10" fill="white" />
    
    {/* Header */}
    <text x="400" y="120" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#005f73">
      衛生福利部長照繼續教育積分管理系統
    </text>

    {/* Login Form */}
    <g transform="translate(250, 180)">
      <rect width="300" height="250" rx="10" fill="#f9fafb" stroke="#e5e7eb" />
      
      <text x="150" y="40" textAnchor="middle" fontSize="20" fontWeight="600" fill="#111827">長照人員登入</text>
      
      {/* Username */}
      <text x="30" y="80" fill="#374151" fontSize="14">身分證字號 / 居留證號</text>
      <rect x="30" y="90" width="240" height="30" rx="5" fill="white" stroke="#d1d5db" />
      
      {/* Password */}
      <text x="30" y="140" fill="#374151" fontSize="14">密碼</text>
      <rect x="30" y="150" width="240" height="30" rx="5" fill="white" stroke="#d1d5db" />
      
      {/* Login Button */}
      <rect x="30" y="200" width="240" height="35" rx="5" fill="#005f73" />
      <text x="150" y="222" textAnchor="middle" fill="white" fontWeight="600">登入</text>
    </g>

    {/* Info Text */}
    <text x="400" y="480" textAnchor="middle" fontSize="16" fill="#4b5563">
      1. 請先前往衛福部網站
    </text>
    <text x="400" y="510" textAnchor="middle" fontSize="16" fill="#4b5563">
      2. 輸入您的帳號密碼進行登入
    </text>
  </svg>
);

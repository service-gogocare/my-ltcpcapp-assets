import React from 'react';

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  isMet?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ value, max, size = 120, strokeWidth = 10, isMet = true }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (max != null && max > 0) ? value / max : 1; 
  const cappedProgress = Math.min(progress, 1); 
  const offset = circumference - cappedProgress * circumference;

  const colorClass = isMet ? 'text-brand-secondary' : 'text-status-warning';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`進度 ${value.toFixed(2)} ${max != null ? `/ ${max}` : ''}`}>
        <circle
          className="text-gray-200 dark:text-gray-700"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={colorClass}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.5s ease-out',
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${colorClass}`}>
          {value.toFixed(2)}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {max != null ? `/ ${max} 點` : '點'}
        </span>
      </div>
    </div>
  );
};
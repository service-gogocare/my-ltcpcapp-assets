import React from 'react';

interface FooterIllustrationProps {
  className?: string;
}

export const FooterIllustration: React.FC<FooterIllustrationProps> = ({ className }) => {
  return (
    <div className={`hidden lg:block absolute right-[-150px] z-0 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg opacity-80 dark:opacity-50 pointer-events-none ${className || ''}`} aria-hidden="true">
        <img 
            src="https://raw.githubusercontent.com/service-gogocare/my-ltcpcapp-assets/main/ltcpcUI/banner-1.png" 
            alt="裝飾性插圖"
            className="w-full h-auto"
        />
    </div>
  );
};
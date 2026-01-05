import React from 'react';

export const UsageGuideTitle: React.FC<{ alt: string }> = ({ alt }) => (
    <img
        id="tutorial-header"
        src="https://raw.githubusercontent.com/service-gogocare/my-ltcpcapp-assets/main/ltcpcUI/banner-teach.png"
        alt={alt}
        width="218"
        height="30"
        className="mx-auto my-7 animate-fade-in-up"
        style={{ animationDelay: '0.1s' }}
    />
);
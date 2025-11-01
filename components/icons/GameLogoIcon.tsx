import React from 'react';

export const GameLogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className || "h-20 w-20 text-white"} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#FFFFFF' }} stopOpacity="0.8" />
                <stop offset="100%" style={{ stopColor: '#E0E0E0' }} stopOpacity="0.5" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <g filter="url(#glow)">
            {/* Outer ring */}
            <circle cx="50" cy="50" r="45" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeOpacity="0.5"/>
            
            {/* The three interlocking rings */}
            <circle cx="50" cy="50" r="30" stroke="white" strokeWidth="3" strokeDasharray="5 5" transform="rotate(0 50 50)">
                 <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="20s" repeatCount="indefinite" />
            </circle>
             <circle cx="50" cy="50" r="20" stroke="white" strokeWidth="2.5" strokeOpacity="0.9" transform="rotate(120 50 50)">
                 <animateTransform attributeName="transform" type="rotate" from="120 50 50" to="480 50 50" dur="15s" repeatCount="indefinite" />
            </circle>
             <circle cx="50" cy="50" r="10" fill="white" stroke="white" strokeWidth="2" transform="rotate(240 50 50)">
                 <animateTransform attributeName="transform" type="rotate" from="240 50 50" to="600 50 50" dur="10s" repeatCount="indefinite" />
            </circle>
        </g>
    </svg>
);
import React from 'react';

export const GameLogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className || "h-20 w-20 text-white"} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#a855f7' }} />
                <stop offset="50%" style={{ stopColor: '#ec4899' }} />
                <stop offset="100%" style={{ stopColor: '#ef4444' }} />
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <g filter="url(#glow)">
            <circle cx="50" cy="50" r="45" stroke="url(#logo-gradient)" strokeWidth="4"/>
            <path d="M50 15 V85 M15 50 H85" stroke="url(#logo-gradient)" strokeWidth="2" strokeLinecap="round" transform="rotate(45 50 50)"/>
            <path d="M30 30 Q50 10, 70 30 T30 70 Q10 50, 30 30 Z" stroke="white" strokeWidth="1.5" strokeOpacity="0.8"/>
            <circle cx="50" cy="50" r="10" stroke="white" strokeWidth="1.5" strokeOpacity="0.9"/>
        </g>
    </svg>
);

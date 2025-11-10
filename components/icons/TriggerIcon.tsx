import React from 'react';

export const TriggerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.162 4.838a2.25 2.25 0 013 3L12 21l-3.5-3.5L14.662.838a2.25 2.25 0 014.5 0z" opacity="0.6"/>
    </svg>
);
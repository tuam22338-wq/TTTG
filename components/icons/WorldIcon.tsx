import React from 'react';

export const WorldIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.25 9.75h17.5M9.75 3.25c.496-2.062 3.016-2.062 3.512 0L15 9.75M9 20.75c-.496 2.062-3.016 2.062-3.512 0L3.75 14.25" />
    </svg>
);

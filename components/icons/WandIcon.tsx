import React from 'react';

export const WandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
        <path d="M12.94 4.146a1 1 0 011.415 0l.218.218a1 1 0 010 1.415l-6.25 6.25a1 1 0 01-1.414 0l-.218-.218a1 1 0 010-1.415l6.25-6.25z" />
        <path d="M7.693 5.75l-4.787 4.787a1 1 0 000 1.414l.218.218a1 1 0 001.414 0l4.787-4.787a1 1 0 000-1.414l-.218-.218a1 1 0 00-1.414 0z" />
        <path fillRule="evenodd" d="M3.197 3.328a.75.75 0 011.06 0l.218.218a.75.75 0 010 1.06l-.97.97a.75.75 0 01-1.06 0l-.218-.218a.75.75 0 010-1.06l.97-.97zM14.803 13.672a.75.75 0 011.06 0l.97.97a.75.75 0 010 1.06l-.218.218a.75.75 0 01-1.06 0l-.97-.97a.75.75 0 010-1.06l.218-.218z" clipRule="evenodd" />
    </svg>
);
import React from 'react';

export const CultivationIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C10.1696 4 8.43576 4.69748 7.12332 5.86883C5.81089 7.04018 5.01167 8.63212 5.01167 10.3C5.01167 11.9679 5.81089 13.5598 7.12332 14.7312C8.43576 15.9025 10.1696 16.6 12 16.6V4ZM12 20V7.4C10.1696 7.4 8.43576 6.70252 7.12332 5.53117C5.81089 4.35982 5.01167 2.76788 5.01167 1.1C5.01167 1 5 1 5 1C6.702 4.453 9.808 6.6 12 7.4V20Z" transform="rotate(45 12 12)" />
        <path d="M12,2A10,10,0,0,0,12,22V12A10,10,0,0,0,12,2Z" opacity="1">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="10s" repeatCount="indefinite"/>
        </path>
        <circle cx="12" cy="7" r="1.5" fill="white">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="10s" repeatCount="indefinite"/>
        </circle>
        <circle cx="12" cy="17" r="1.5" fill="black">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="10s" repeatCount="indefinite"/>
        </circle>
    </svg>
);

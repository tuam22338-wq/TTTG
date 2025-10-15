import React from 'react';

interface TokenCounterProps {
    lastTurn: number;
    total: number;
}

const TokenCounter: React.FC<TokenCounterProps> = ({ lastTurn, total }) => {
    if (total === 0) {
        return null; // Don't show until first API call is done
    }

    return (
        <div className="text-sm text-neutral-400 bg-black/20 rounded-lg px-3 py-1.5 border border-solid border-white/10 whitespace-nowrap">
            <span>Tokens: </span>
            <span className="font-semibold text-white">{lastTurn}</span>
            <span className="text-neutral-400"> / </span>
            <span className="font-semibold text-white">{total}</span>
        </div>
    );
};

export default TokenCounter;
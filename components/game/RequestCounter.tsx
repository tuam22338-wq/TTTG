import React from 'react';

interface RequestCounterProps {
    count: number;
}

const RequestCounter: React.FC<RequestCounterProps> = ({ count }) => {
    if (count === 0) {
        return null; // Don't show until first API call is done
    }

    return (
        <div className="text-sm text-neutral-400 bg-black/20 rounded-lg px-3 py-1.5 border border-solid border-white/10 whitespace-nowrap">
            <span>Requests: </span>
            <span className="font-semibold text-white">{count}</span>
        </div>
    );
};

export default RequestCounter;
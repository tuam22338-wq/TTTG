import React from 'react';

interface RequestCounterProps {
    count: number;
}

const RequestCounter: React.FC<RequestCounterProps> = ({ count }) => {
    if (count === 0) {
        return null; // Don't show until first API call is done
    }

    return (
        <div className="text-sm text-neutral-300 rounded-lg px-3 py-1.5 whitespace-nowrap neumorphic-inset">
            <span>Requests: </span>
            <span className="font-semibold text-white">{count}</span>
        </div>
    );
};

export default RequestCounter;
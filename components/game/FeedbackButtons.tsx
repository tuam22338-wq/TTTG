import React from 'react';

const ThumbsUpIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333V17a1 1 0 001 1h6.364a1 1 0 00.943-.673l1.786-5.357A1 1 0 0015.364 11H12V7.5a1.5 1.5 0 00-3 0V11H7a1 1 0 00-1 1.333z" />
    </svg>
);

const ThumbsDownIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 9.5a1.5 1.5 0 013 0v-6A1.5 1.5 0 012 3.5v6zM6 9.667V3a1 1 0 011-1h6.364a1 1 0 01.943.673l1.786 5.357A1 1 0 0115.364 9H12v3.5a1.5 1.5 0 01-3 0V9H7a1 1 0 01-1-1.333z" />
    </svg>
);

const WandIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M12.94 4.146a1 1 0 011.415 0l.218.218a1 1 0 010 1.415l-6.25 6.25a1 1 0 01-1.414 0l-.218-.218a1 1 0 010-1.415l6.25-6.25z" />
        <path d="M7.693 5.75l-4.787 4.787a1 1 0 000 1.414l.218.218a1 1 0 001.414 0l4.787-4.787a1 1 0 000-1.414l-.218-.218a1 1 0 00-1.414 0z" />
    </svg>
);

const BrainIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.3 2.25a.75.75 0 01.75.75v.586c.29.059.57.144.838.262l.48-.277a.75.75 0 01.994.433l.445 1.22a.75.75 0 01-.595.918l-.503.178c.045.22.08.444.105.672l.53.075a.75.75 0 01.68.83l-.066 1.428a.75.75 0 01-.822.68l-.53-.075a5.48 5.48 0 01-.105.672l.503.178a.75.75 0 01.595.918l-.445 1.22a.75.75 0 01-.994.434l-.48-.277a5.02 5.02 0 01-.838.262v.586a.75.75 0 01-1.5 0v-.586a5.02 5.02 0 01-.838-.262l-.48.277a.75.75 0 01-.994-.434l-.445-1.22a.75.75 0 01.595-.918l.503-.178a5.48 5.48 0 01.105-.672l-.53-.075a.75.75 0 01-.68-.83l.066-1.428a.75.75 0 01.822-.68l.53.075c.025-.228.06-.452.105-.672l-.503-.178a.75.75 0 01-.595-.918l.445-1.22a.75.75 0 01.994-.433l.48.277c.268-.118.548-.203.838-.262V3a.75.75 0 01.75-.75zM10 7.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" clipRule="evenodd" />
    </svg>
);


interface FeedbackButtonsProps {
    onFeedback: (feedbackType: string) => void;
}

const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({ onFeedback }) => {
    
    const buttons = [
        { type: 'good', label: 'Hay', icon: <ThumbsUpIcon /> },
        { type: 'bad', label: 'Dở', icon: <ThumbsDownIcon /> },
        { type: 'off_topic', label: 'Lạc đề', icon: <WandIcon /> },
        { type: 'forgot_details', label: 'Quên chi tiết', icon: <BrainIcon /> },
    ];

    return (
        <div className="flex items-center justify-end gap-2 mt-4 animate-fade-in-fast">
            <span className="text-xs text-neutral-500">Đánh giá phản hồi:</span>
            {buttons.map(btn => (
                <button
                    key={btn.type}
                    onClick={() => onFeedback(btn.type)}
                    title={btn.label}
                    className="flex items-center justify-center gap-1.5 px-2 py-1 bg-neutral-800/50 text-neutral-400 rounded-md border border-neutral-700 hover:bg-neutral-700/80 hover:text-white transition-colors text-xs"
                >
                    {btn.icon}
                </button>
            ))}
             <style>{`
                @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in-fast { animation: fade-in-fast 0.5s 1s ease-out forwards; opacity: 0; }
            `}</style>
        </div>
    );
};

export default FeedbackButtons;
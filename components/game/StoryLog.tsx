import React, { useRef, useEffect } from 'react';
import { GameTurn } from '../../types';

interface StoryLogProps {
    turn?: GameTurn;
}

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.03 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);

const StatusNarrationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 inline-block mr-3" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 3.5a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0v-2.5a.75.75 0 01.75-.75zM10 8a.75.75 0 01.75.75v6.5a.75.75 0 01-1.5 0v-6.5a.75.75 0 01.75-.75zM3.5 10a.75.75 0 000 1.5h13a.75.75 0 000-1.5h-13z" />
    </svg>
);


const StoryLog: React.FC<StoryLogProps> = ({ turn }) => {
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [turn]);

    const renderTextWithHighlighting = (text: string) => {
        const parts = text.split(/(\[HN\].*?\[\/HN\])/g);
        return parts.map((part, index) => {
            if (part.startsWith('[HN]')) {
                const content = part.substring(4, part.length - 5);
                return <strong key={index} className="text-yellow-300 font-bold">{content}</strong>;
            }
            return part;
        });
    };

    if (!turn) {
        return (
            <div className="prose prose-invert prose-lg max-w-none">
                <p>Bắt đầu cuộc hành trình của bạn...</p>
                <div ref={logEndRef} />
            </div>
        );
    }
    
    const { playerAction, storyText, statusNarration, omniscientInterlude } = turn;

    return (
        <div className="space-y-6">
            {playerAction && (
                <div className="bg-black/20 p-4 rounded-xl border border-white/10 italic animate-fade-in-fast">
                    <p className="text-lg text-neutral-300 font-semibold">{'> '}{renderTextWithHighlighting(playerAction)}</p>
                </div>
            )}
            
            <div className="prose prose-invert prose-lg max-w-none leading-relaxed text-neutral-300 animate-fade-in-fast" style={{animationDelay: '100ms'}}>
                 {storyText.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
                    <p key={index}>{renderTextWithHighlighting(paragraph)}</p>
                ))}
            </div>

            {statusNarration && (
                <div className="bg-neutral-800/50 border-l-4 border-cyan-400 p-4 rounded-r-lg animate-fade-in-fast" style={{animationDelay: '150ms'}}>
                    <p className="flex items-center text-lg italic text-cyan-200">
                        <StatusNarrationIcon />
                        <span>{renderTextWithHighlighting(statusNarration)}</span>
                    </p>
                </div>
            )}

            {omniscientInterlude && (
                <div className="bg-black/30 border-2 border-purple-500/50 p-4 rounded-xl shadow-lg shadow-purple-900/20 animate-fade-in-fast" style={{animationDelay: '200ms'}}>
                    <h3 className="flex items-center text-xl font-bold text-purple-300 mb-2">
                        <EyeIcon />
                        {omniscientInterlude.title}
                    </h3>
                    <div className="prose prose-invert prose-base max-w-none text-purple-200/90 italic">
                        {omniscientInterlude.text.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
                            <p key={index}>{renderTextWithHighlighting(paragraph)}</p>
                        ))}
                    </div>
                </div>
            )}
            <div ref={logEndRef} />
            <style>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-fast {
                    animation: fade-in-fast 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default StoryLog;

import React from 'react';
import { ChronicleEntry } from '../../types';
import { ChronicleIcon } from '../icons/ChronicleIcon';

interface ChroniclePanelProps {
    history: ChronicleEntry[];
}

const ChroniclePanel: React.FC<ChroniclePanelProps> = ({ history }) => {
    const reversedHistory = [...history].reverse();

    const formatTimestamp = (entry: ChronicleEntry): { date: string; time: string } => {
        if (entry.isoTimestamp) {
            const dateObj = new Date(entry.isoTimestamp);
            const date = dateObj.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
            const time = dateObj.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
            return { date, time };
        }
        // Fallback for old saves that only have `timestamp`
        return { date: '', time: entry.timestamp };
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow min-h-0 p-2 overflow-y-auto custom-scrollbar">
                {reversedHistory.length > 0 ? (
                    <div className="space-y-3">
                        {reversedHistory.map((entry) => {
                            const { date, time } = formatTimestamp(entry);
                            return (
                                <div key={entry.turnNumber} className="bg-black/20 p-3 rounded-lg border border-transparent hover:border-white/10 transition-colors">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="font-bold text-base text-white">Lượt {entry.turnNumber}</span>
                                        <div className="flex flex-col items-end">
                                            {date && <span className="text-xs font-mono text-neutral-400">{date}</span>}
                                            <span className="text-xs font-mono text-neutral-400">{time}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-300 italic">{entry.summary}</p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center text-sm text-neutral-400 p-4">Chưa có sự kiện nào được ghi lại.</p>
                )}
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #444; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #666; }
            `}</style>
        </div>
    );
};

export default ChroniclePanel;

import React, { useState } from 'react';
import { NPC } from '../../types';
import ChevronIcon from '../icons/ChevronIcon';

interface NpcCodexProps {
    npcs: NPC[];
    onNpcClick: (npc: NPC) => void;
}

const NpcEntry: React.FC<{ npc: NPC; onNpcClick: (npc: NPC) => void }> = ({ npc, onNpcClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-black/20 rounded-lg border border-white/10 overflow-hidden">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex justify-between items-center p-3 text-left hover:bg-white/10 transition-colors duration-200"
            >
                <div className="flex-grow flex items-center gap-3 min-w-0">
                    <span className="font-bold text-lg text-white truncate">{npc.name}</span>
                    <span className="text-sm text-neutral-400 truncate hidden sm:block">{npc.status}</span>
                </div>
                 <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${npc.relationship === 'Thù địch' ? 'bg-red-500/50 text-red-200' : 'bg-green-500/50 text-green-200'}`}>{npc.relationship}</span>
                    <ChevronIcon isExpanded={isExpanded} />
                 </div>
            </button>
            {isExpanded && (
                <div className="px-3 pb-3 border-t border-white/10 animate-fade-in-fast space-y-2">
                    <p className="text-sm text-neutral-300 italic my-2">{npc.appearance}</p>
                    <div className="text-xs text-neutral-400">
                        <p><strong className="text-neutral-300">Tính cách:</strong> {npc.personality}</p>
                        <p><strong className="text-neutral-300">Tiểu sử:</strong> {npc.backstory}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const NpcCodex: React.FC<NpcCodexProps> = ({ npcs, onNpcClick }) => {
    return (
        <div className="h-full flex flex-col">
            <div className="p-2 flex-grow min-h-0 overflow-y-auto custom-scrollbar">
                 {(!npcs || npcs.length === 0) ? (
                    <p className="text-center text-sm text-neutral-400 p-4">Chưa gặp gỡ nhân vật nào.</p>
                ) : (
                    <div className="space-y-2">
                        {npcs.map((npc) => (
                            <NpcEntry 
                                key={npc.id} 
                                npc={npc} 
                                onNpcClick={onNpcClick}
                            />
                        ))}
                    </div>
                )}
            </div>
             <style>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-fast {
                    animation: fade-in-fast 0.3s ease-out forwards;
                }
                 .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #444; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #666; }
             `}</style>
        </div>
    );
};

export default NpcCodex;

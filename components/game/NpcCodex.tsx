import React, { useState, useMemo } from 'react';
import { NPC, StatType, CharacterStat } from '../../types';
import InputField from '../ui/InputField';
import { SearchIcon } from '../icons/SearchIcon';
import { UserIcon } from '../icons/UserIcon';

interface NpcCodexProps {
  npcs: NPC[];
  onStatClick: (stat: CharacterStat & { name: string }, ownerName: string, ownerType: 'npc', ownerId?: string) => void;
}

const getStatTheme = (type: StatType) => {
    switch (type) {
        case StatType.GOOD: return { border: 'border-l-green-400', bg: 'bg-green-900/20 hover:bg-green-900/40' };
        case StatType.BAD: return { border: 'border-l-red-400', bg: 'bg-red-900/20 hover:bg-red-900/40' };
        case StatType.INJURY: return { border: 'border-l-orange-400', bg: 'bg-orange-900/20 hover:bg-orange-900/40' };
        case StatType.NSFW: return { border: 'border-l-pink-400', bg: 'bg-pink-900/20 hover:bg-pink-900/40' };
        case StatType.KNOWLEDGE: return { border: 'border-l-blue-400', bg: 'bg-blue-900/20 hover:bg-blue-900/40' };
        default: return { border: 'border-l-gray-500', bg: 'bg-gray-900/20 hover:bg-gray-900/40' };
    }
};

const NpcCodex: React.FC<NpcCodexProps> = ({ npcs, onStatClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedNpc, setSelectedNpc] = useState<NPC | null>(npcs.length > 0 ? npcs[0] : null);

    const filteredNpcs = useMemo(() =>
        npcs.filter(npc =>
            npc.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => a.name.localeCompare(b.name)),
        [npcs, searchTerm]
    );
    
    const handleSelectNpc = (npc: NPC) => {
        setSelectedNpc(npc);
    };

    return (
        <div className="h-full flex text-white overflow-hidden">
            {/* List View */}
            <aside className="w-80 flex-shrink-0 border-r border-white/10 flex flex-col bg-black/10">
                <div className="p-3 border-b border-neutral-700/50">
                    <div className="relative">
                        <InputField id="npc-search" placeholder="Tìm NPC..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="!pl-9 !py-2 !rounded-md"/>
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500">
                            <SearchIcon />
                        </div>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-2 custom-scrollbar">
                    <div className="space-y-1">
                        {filteredNpcs.map(npc => (
                            <button
                                key={npc.id}
                                onClick={() => handleSelectNpc(npc)}
                                className={`w-full text-left p-3 rounded-lg flex items-center gap-4 transition-colors duration-200 relative overflow-hidden ${selectedNpc?.id === npc.id ? 'bg-pink-900/40' : 'hover:bg-neutral-800/60'}`}
                            >
                                {selectedNpc?.id === npc.id && <div className="absolute left-0 top-0 h-full w-1 bg-pink-400 animate-fade-in-fast"></div>}
                                <img src={'https://via.placeholder.com/40'} alt={npc.name} className="w-10 h-10 rounded-full flex-shrink-0 object-cover" />
                                <div className="flex-grow min-w-0">
                                    <p className={`font-bold truncate ${selectedNpc?.id === npc.id ? 'text-pink-300' : 'text-neutral-200'}`}>{npc.name}</p>
                                    <p className="text-xs text-neutral-400 truncate mt-1">{npc.status}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Detail View */}
            <main className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                {selectedNpc ? (
                    <div className="space-y-6 animate-fade-in-fast">
                         <div className="flex items-start gap-6">
                            <img src={'https://via.placeholder.com/120'} alt={selectedNpc.name} className="w-32 h-32 rounded-full flex-shrink-0 object-cover border-4 border-neutral-700" />
                            <div className="flex-grow">
                                <h2 className="text-4xl font-bold font-rajdhani text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{selectedNpc.name}</h2>
                                <p className="text-lg text-neutral-300 mt-1">{selectedNpc.personality}</p>
                                <div className="mt-2 space-y-1 text-md">
                                    <p><span className="font-semibold text-cyan-400">Quan hệ:</span> {selectedNpc.relationship}</p>
                                    {selectedNpc.goal && <p><span className="font-semibold text-yellow-400">Mục tiêu:</span> {selectedNpc.goal}</p>}
                                    <p><span className="font-semibold text-neutral-400">Vị trí:</span> {selectedNpc.currentLocation}</p>
                                    <p><span className="font-semibold text-neutral-400">Trạng thái:</span> {selectedNpc.status}</p>
                                    <p><span className="font-semibold text-neutral-400">Cấp độ:</span> {selectedNpc.level}</p>
                                    <p className="font-semibold" style={{ color: selectedNpc.affinity > 70 ? '#4ade80' : selectedNpc.affinity < 30 ? '#f87171' : '#60a5fa' }}>
                                        Thiện cảm: {selectedNpc.affinity}
                                    </p>
                                </div>
                            </div>
                         </div>
                        <div className="prose prose-invert max-w-none text-neutral-300 leading-relaxed text-base space-y-4">
                            <div>
                                <h3 className="font-semibold text-neutral-400 uppercase text-sm tracking-wider">Ngoại hình</h3>
                                <p>{selectedNpc.appearance}</p>
                            </div>
                             <div>
                                <h3 className="font-semibold text-neutral-400 uppercase text-sm tracking-wider">Tiểu sử</h3>
                                <p>{selectedNpc.backstory}</p>
                            </div>
                            {selectedNpc.lastInteractionSummary && (
                                 <div>
                                    <h3 className="font-semibold text-neutral-400 uppercase text-sm tracking-wider">Tóm Tắt Tương Tác Gần Nhất</h3>
                                    <p className="italic">"{selectedNpc.lastInteractionSummary}"</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="font-semibold text-neutral-400 uppercase text-sm tracking-wider mb-2">Trạng Thái</h3>
                            <div className="space-y-2">
                                {Object.entries(selectedNpc.stats).length > 0 ? Object.entries(selectedNpc.stats).map(([statName, stat]) => {
                                    const typedStat = stat as CharacterStat;
                                    const theme = getStatTheme(typedStat.type);
                                    return (
                                        <button key={statName} onClick={() => onStatClick({ ...typedStat, name: statName }, selectedNpc.name, 'npc', selectedNpc.id)} className={`w-full text-left p-2 rounded-md border-l-4 transition-colors ${theme.border} ${theme.bg}`}>
                                            <p className="font-bold text-white text-sm">{statName}</p>
                                            <p className="text-xs text-neutral-400 truncate">{typedStat.description}</p>
                                        </button>
                                    );
                                }) : <p className="text-neutral-500 italic text-sm">Không có trạng thái đặc biệt nào.</p>}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-600">
                        <UserIcon className="h-24 w-24" />
                        <p className="mt-4 text-lg font-semibold">Chọn một nhân vật để xem chi tiết</p>
                    </div>
                )}
            </main>
             <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #555; border-radius: 10px; }
                 @keyframes fade-in-fast {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-fast {
                    animation: fade-in-fast 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default NpcCodex;
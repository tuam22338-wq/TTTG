

import React, { useMemo } from 'react';
import { GameState, CharacterStat, StatType, AttributeType } from '../../types';
import { GetIconComponent } from '../icons/AttributeIcons';
import { getRealmString } from '../../services/CultivationService';

interface CharacterSheetProps {
    gameState: GameState;
    onStatClick: (stat: CharacterStat & { name: string }, ownerName: string, ownerType: 'player' | 'npc', ownerId?: string) => void;
    recentlyUpdatedStats: Set<string>;
}

const getStatColorClasses = (type: StatType): string => {
    switch (type) {
        case StatType.GOOD: return 'border-green-500 bg-green-900/30 hover:bg-green-800/40 text-green-200';
        case StatType.BAD: return 'border-red-500 bg-red-900/30 hover:bg-red-800/40 text-red-300';
        case StatType.INJURY: return 'border-orange-500 bg-orange-900/30 hover:bg-orange-800/40 text-orange-300';
        case StatType.NSFW: return 'border-pink-500 bg-pink-900/30 hover:bg-pink-800/40 text-pink-300';
        case StatType.KNOWLEDGE: return 'border-blue-500 bg-blue-900/30 hover:bg-blue-800/40 text-blue-300';
        default: return 'border-gray-600 bg-gray-800/30 hover:bg-gray-700/40 text-gray-300';
    }
};

const StatBar: React.FC<{
    current: number;
    max: number;
    label: string;
    barColor: string;
    borderColor: string;
    showValue?: boolean;
}> = ({ current, max, label, barColor, borderColor, showValue = true }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between items-baseline text-xs mb-1">
                <span className="font-semibold text-neutral-400">{label}</span>
                {showValue && <span className="font-bold text-white font-mono">{`${Math.floor(current)} / ${max}`}</span>}
            </div>
            <div className={`h-2.5 w-full bg-black/30 rounded-full overflow-hidden border ${borderColor}`}>
                <div className={`${barColor} h-full rounded-full transition-all duration-300`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const CombatStat: React.FC<{ icon: React.ReactNode; label: string; value: string | number; }> = ({ icon, label, value }) => (
    <div className="flex items-center gap-2 p-1.5 bg-black/20 rounded">
        <div className="w-5 h-5 text-neutral-400">{icon}</div>
        <span className="text-sm font-semibold text-neutral-300">{label}:</span>
        <span className="text-sm font-bold font-mono text-white ml-auto">{value}</span>
    </div>
);

const CharacterSheet: React.FC<CharacterSheetProps> = ({ gameState, onStatClick, recentlyUpdatedStats }) => {
    const realmString = getRealmString(gameState.cultivation.level, gameState.worldContext);
    const { finalCoreStats, finalCustomStats } = gameState.coreStats; // Simplified for this component

    const orderedStats = useMemo(() => {
        const stats: { name: string, stat: CharacterStat }[] = [];
        for (const statName of gameState.playerStatOrder) {
            const stat = gameState.playerStats[statName];
            if (stat && typeof stat === 'object' && 'description' in stat && 'type' in stat) {
                stats.push({ name: statName, stat });
            }
        }
        return stats;
    }, [gameState.playerStats, gameState.playerStatOrder]);


    const informationalAttributes = useMemo(() => {
        return gameState.worldContext.customAttributes.filter(attr => attr.type === AttributeType.INFORMATIONAL);
    }, [gameState.worldContext.customAttributes]);

    return (
        <div className="h-full flex flex-col p-4">
            <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <StatBar current={gameState.coreStats.sinhLuc} max={gameState.coreStats.sinhLucToiDa} label="Sinh Lực" barColor="bg-red-500" borderColor="border-red-500/50"/>
                    <StatBar current={gameState.coreStats.linhLuc} max={gameState.coreStats.linhLucToiDa} label="Linh Lực" barColor="bg-blue-500" borderColor="border-blue-500/50"/>
                    <StatBar current={gameState.coreStats.theLuc} max={gameState.coreStats.theLucToiDa} label="Thể Lực" barColor="bg-yellow-500" borderColor="border-yellow-500/50"/>
                </div>
                <div className="space-y-1">
                    {informationalAttributes.map(attr => {
                        const Icon = GetIconComponent({ name: attr.icon, className: "h-4 w-4 text-neutral-400"});
                        const value = finalCustomStats?.[attr.id as keyof typeof finalCustomStats] ?? attr.baseValue;
                        return (
                             <div key={attr.id} className="flex justify-between items-center text-sm px-2 py-1 bg-black/20 rounded">
                                <div className="flex items-center gap-2">
                                    {Icon}
                                    <span className="font-semibold text-neutral-300">{attr.name}</span>
                                </div>
                                <span className="font-bold text-white font-mono">{value}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
            
            <div className="flex-shrink-0 mt-4">
                 <h3 className="text-xl font-bold text-white mb-2 text-center" style={{textShadow: '0 0 5px rgba(255,255,255,0.4)'}}>Trạng Thái Hiện Tại</h3>
                 <div className="h-48 overflow-y-auto custom-scrollbar bg-black/20 p-2 rounded-lg border border-neutral-700">
                    {orderedStats.length === 0 ? (
                        <p className="text-center text-sm text-neutral-500 pt-16">Nhân vật không có trạng thái đặc biệt nào.</p>
                    ) : (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {orderedStats.map(({ name, stat }) => (
                                <button
                                    key={name}
                                    onClick={() => onStatClick({ ...stat, name }, gameState.worldContext.character.name, 'player')}
                                    className={`p-2 rounded-md border text-left transition-all duration-200 ${getStatColorClasses(stat.type)} ${recentlyUpdatedStats.has(name) ? 'animate-pulse-fast' : ''}`}
                                >
                                    <p className="font-bold text-sm truncate">{name}</p>
                                    <p className="text-xs opacity-80 truncate">{stat.description}</p>
                                </button>
                            ))}
                        </div>
                    )}
                 </div>
            </div>
            <style>{`
                @keyframes pulse-fast {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0.2); }
                    50% { transform: scale(1.02); box-shadow: 0 0 0 4px rgba(255,255,255,0); }
                }
                .animate-pulse-fast { animation: pulse-fast 1.5s ease-out; }
            `}</style>
        </div>
    );
};

export default CharacterSheet;

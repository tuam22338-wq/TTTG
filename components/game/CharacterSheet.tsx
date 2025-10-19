

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
            <div className={`h-2.5 w-full bg-black/50 rounded-full overflow-hidden border ${borderColor}`}>
                <div className={`h-full ${barColor} rounded-full transition-all duration-500 ease-linear`} style={{ width: `${percentage}%` }} title={`${label}: ${Math.floor(current)} / ${max}`}></div>
            </div>
        </div>
    );
};

const StatGridItem: React.FC<{ label: string; value: string; icon: React.ReactNode; title: string; }> = ({ label, value, icon, title }) => (
    <div className="bg-black/20 p-2 rounded-md flex items-center gap-2" title={title}>
        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-neutral-400">{icon}</div>
        <div className="flex-grow flex justify-between items-baseline min-w-0">
            <span className="text-sm font-semibold text-neutral-300 truncate">{label}</span>
            <span className="font-bold text-white font-mono text-sm">{value}</span>
        </div>
    </div>
);

const StatusItem: React.FC<{
    statName: string;
    stat: CharacterStat;
    isHighlighted: boolean;
    onClick: () => void;
}> = ({ statName, stat, isHighlighted, onClick }) => {
    const colorClasses = getStatColorClasses(stat.type);
    const highlightClass = isHighlighted ? 'animate-flash' : '';
    const cleanName = statName.replace(/\[HN\]/g, '').replace(/\[\/HN\]/g, '');

    return (
        <button 
            onClick={onClick}
            className={`w-full text-left p-2 rounded-md border transition-all duration-200 ${colorClasses} ${highlightClass}`}
        >
            <p className="font-semibold text-sm truncate">{cleanName}</p>
            <p className="text-xs text-gray-400 truncate">{stat.description}</p>
        </button>
    );
};


const CharacterSheet: React.FC<CharacterSheetProps> = ({ gameState, onStatClick, recentlyUpdatedStats }) => {
    
    const { primaryAttributes, informationalAttributes, dynamicStatuses } = useMemo(() => {
        const customAttrMap = new Map(gameState.worldContext.customAttributes.map(attr => [attr.id, attr]));

        const primaryAttributes = gameState.worldContext.customAttributes.filter(attr => attr.type === AttributeType.PRIMARY);
        const informationalAttributes = gameState.worldContext.customAttributes.filter(attr => attr.type === AttributeType.INFORMATIONAL);

        const dynamicStatuses: (CharacterStat & { name: string })[] = [];
        const allStatKeys = gameState.playerStatOrder || Object.keys(gameState.playerStats);

        // FIX: Adds a robust type guard to ensure `stat` is a valid object before processing.
        // This resolves errors that occur when `playerStats` contains non-object values, by checking type and existence of required properties.
        for (const key of allStatKeys) {
            const stat = gameState.playerStats[key];
            const definition = customAttrMap.get(key);
            
            // Check if stat is a valid stat object before processing
            if (stat && typeof stat === 'object' && stat !== null && 'type' in stat && 'description' in stat) {
                 if (!definition || definition.type !== AttributeType.INFORMATIONAL) {
                    dynamicStatuses.push({ name: key, ...(stat as CharacterStat) });
                }
            }
        }
        return { primaryAttributes, informationalAttributes, dynamicStatuses };
    }, [gameState.worldContext.customAttributes, gameState.playerStats, gameState.playerStatOrder]);

    const formatValue = (key: string, isPercent?: boolean) => {
        const value = gameState.coreStats[key as keyof typeof gameState.coreStats];
        if (typeof value !== 'number') return 'N/A';
        if (isPercent) {
             return `${(value * 100).toFixed(1)}%`;
        }
        return String(Math.floor(value));
    };

    const character = gameState.worldContext.character;
    const age = (gameState.playerStats['Tuổi'] as CharacterStat)?.description || 'Chưa rõ';
    const bioSnippet = character.biography.split('.').slice(0, 2).join('.') + (character.biography.includes('.') ? '.' : '');
    const gender = character.gender === 'Tự định nghĩa' ? character.customGender : character.gender;
    const realmString = getRealmString(gameState.cultivation.level, gameState.worldContext);


    return (
        <div className="p-4 h-full flex flex-col min-h-0">
            {/* 1. Header with character info */}
            <div className="flex-shrink-0 pb-4 mb-4 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white font-rajdhani">{character.name}</h2>
                <div className="flex flex-wrap text-sm text-neutral-400 gap-x-4 gap-y-1 mt-1">
                    <span><strong>Tuổi:</strong> <span className="text-neutral-200">{age}</span></span>
                    <span><strong>Giới tính:</strong> <span className="text-neutral-200">{gender}</span></span>
                    <span><strong>Tính cách:</strong> <span className="text-neutral-200">{character.personality}</span></span>
                </div>
                <p className="text-xs text-neutral-500 italic mt-2">{bioSnippet}</p>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-4">
                {/* 2. Vital Bars - Conditionally rendered */}
                <section className="space-y-1.5">
                    {gameState.coreStats.sinhLucToiDa > 0 && <StatBar current={gameState.coreStats.sinhLuc} max={gameState.coreStats.sinhLucToiDa} label="Sinh Lực" barColor="bg-red-500" borderColor="border-neutral-700" />}
                    {gameState.coreStats.linhLucToiDa > 0 && <StatBar current={gameState.coreStats.linhLuc} max={gameState.coreStats.linhLucToiDa} label="Linh Lực" barColor="bg-blue-500" borderColor="border-neutral-700" />}
                    {gameState.coreStats.theLucToiDa > 0 && <StatBar current={gameState.coreStats.theLuc} max={gameState.coreStats.theLucToiDa} label="Thể Lực" barColor="bg-green-500" borderColor="border-neutral-700" />}
                    {gameState.coreStats.doNoToiDa > 0 && <StatBar current={gameState.coreStats.doNo} max={gameState.coreStats.doNoToiDa} label="Độ No" barColor="bg-orange-500" borderColor="border-neutral-700" />}
                    {gameState.coreStats.doNuocToiDa > 0 && <StatBar current={gameState.coreStats.doNuoc} max={gameState.coreStats.doNuocToiDa} label="Độ Nước" barColor="bg-sky-500" borderColor="border-neutral-700" />}
                </section>
                
                {/* 2.5. Cultivation Section */}
                {gameState.worldContext.isCultivationEnabled && (
                    <section>
                        <h3 className="text-sm font-semibold uppercase text-neutral-500 tracking-wider mb-2">Cảnh Giới Tu Luyện</h3>
                        <div className="bg-black/20 p-3 rounded-md space-y-2">
                             <p className="text-center font-bold text-lg text-purple-300">{realmString}</p>
                             <StatBar 
                                current={gameState.cultivation.exp} 
                                max={gameState.cultivation.expToNextLevel} 
                                label="Kinh nghiệm" 
                                barColor="bg-purple-500" 
                                borderColor="border-neutral-700" 
                             />
                        </div>
                    </section>
                )}
                
                {/* 3. Attribute Sections - Driven by world context */}
                 {primaryAttributes.length > 0 && (
                    <section>
                        <h3 className="text-sm font-semibold uppercase text-neutral-500 tracking-wider mb-2">Chỉ số Chính</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                            {primaryAttributes.map(attr => (
                                <StatGridItem
                                    key={attr.id}
                                    label={attr.name}
                                    value={formatValue(attr.id, ['chiMang', 'satThuongChiMang', 'giamHoiChieu'].includes(attr.id))}
                                    icon={<GetIconComponent name={attr.icon} className="w-5 h-5" />}
                                    title={attr.description}
                                />
                            ))}
                        </div>
                    </section>
                )}
                
                {informationalAttributes.length > 0 && (
                    <section>
                        <h3 className="text-sm font-semibold uppercase text-neutral-500 tracking-wider mb-2">Chỉ số Thông tin</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                            {informationalAttributes.map(attr => (
                                 <StatGridItem
                                    key={attr.id}
                                    label={attr.name}
                                    value={(gameState.playerStats[attr.id] as CharacterStat)?.description || String(attr.baseValue)}
                                    icon={<GetIconComponent name={attr.icon} className="w-5 h-5" />}
                                    title={attr.description}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* 4. Dynamic Statuses Section */}
                {dynamicStatuses.length > 0 && (
                    <section>
                        <h3 className="text-sm font-semibold uppercase text-neutral-500 tracking-wider mb-2">Trạng Thái & Hiệu Ứng</h3>
                        <div className="space-y-2">
                             {dynamicStatuses.map(stat => (
                                <StatusItem
                                    key={stat.name}
                                    statName={stat.name}
                                    stat={stat}
                                    isHighlighted={recentlyUpdatedStats.has(stat.name)}
                                    onClick={() => onStatClick(stat, character.name, 'player')}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
             <style>{`
                @keyframes flash { 
                    0%, 100% { box-shadow: 0 0 2px rgba(255, 255, 255, 0.4); } 
                    50% { box-shadow: 0 0 10px 3px rgba(255, 255, 255, 0.8); }
                }
                .animate-flash { animation: flash 1.5s ease-in-out infinite; }
             `}</style>
        </div>
    );
};

export default CharacterSheet;
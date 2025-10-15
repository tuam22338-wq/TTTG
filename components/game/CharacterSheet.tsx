import React, { useMemo } from 'react';
import { CharacterStats, CharacterStat, StatType, CustomAttributeDefinition, AttributeType } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';

interface CharacterSheetProps {
    stats: CharacterStats;
    statOrder: string[];
    onStatClick: (stat: CharacterStat & { name: string }, ownerName: string, ownerType: 'player' | 'npc', ownerId?: string) => void;
    recentlyUpdatedStats: Set<string>;
    onOpenCreateStatModal: () => void;
    ownerName: string;
    customAttributes: CustomAttributeDefinition[];
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

const InfoStatItem: React.FC<{
    name: string;
    value: string;
    icon?: string;
    isHighlighted: boolean;
}> = ({ name, value, icon, isHighlighted }) => {
    const highlightClass = isHighlighted ? 'animate-flash-info' : '';
    const cleanName = name.replace(/\[HN\]/g, '').replace(/\[\/HN\]/g, '');
    return (
        <div className={`flex justify-between items-center py-1.5 px-2 rounded bg-black/20 ${highlightClass}`}>
            <span className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
                {icon && <span className="text-lg">{icon}</span>}
                {cleanName}
            </span>
            <span className="text-sm font-bold text-white font-mono">{value}</span>
        </div>
    );
};


const CharacterSheet: React.FC<CharacterSheetProps> = ({ stats, statOrder, onStatClick, recentlyUpdatedStats, onOpenCreateStatModal, ownerName, customAttributes }) => {
    
    const attributeMap = useMemo(() => 
        new Map(customAttributes.map(attr => [attr.id, attr])), 
        [customAttributes]
    );

    const categorizedStats = useMemo(() => {
        const informational: (CharacterStat & { name: string })[] = [];
        const statuses: (CharacterStat & { name: string })[] = [];
        const knowledge: (CharacterStat & { name: string })[] = [];

        const allStatKeys = statOrder || Object.keys(stats);

        for (const key of allStatKeys) {
            const stat = stats[key];
            if (!stat || !stat.type) continue;

            const definition = attributeMap.get(key);
            const entry = { name: key, ...stat };

            if (definition && definition.type === AttributeType.INFORMATIONAL) {
                informational.push(entry);
            } else if (definition && (definition.type === AttributeType.VITAL || definition.type === AttributeType.PRIMARY)) {
                // Ignore, as these are displayed in the Combat Stats panel
            } else if (definition && definition.type === AttributeType.HIDDEN) {
                // Do not display hidden attributes
            }
            else if (stat.type === StatType.KNOWLEDGE) {
                knowledge.push(entry);
            } else {
                statuses.push(entry);
            }
        }
        
        return { informational, statuses, knowledge };
    }, [stats, statOrder, attributeMap]);


    return (
        <div className="p-4 flex-grow flex flex-col min-h-0">
            <header className="flex justify-between items-center pb-2 mb-3 border-b border-white/10 flex-shrink-0">
                <h2 className="text-xl font-bold text-center text-white" style={{ textShadow: '0 0 5px rgba(255,255,255,0.4)' }}>
                    Thuộc tính & Trạng thái
                </h2>
                <button
                    onClick={onOpenCreateStatModal}
                    className="flex items-center gap-1 text-sm text-yellow-300 hover:text-yellow-200 transition-colors"
                    title="Tạo thuộc tính mới cho nhân vật"
                >
                    <PlusIcon />
                    Tạo Mới
                </button>
            </header>
            
            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
                {categorizedStats.informational.length === 0 && categorizedStats.statuses.length === 0 && categorizedStats.knowledge.length === 0 ? (
                    <p className="text-center text-sm text-neutral-400 py-4">Nhân vật không có trạng thái nào.</p>
                ) : (
                    <div className="space-y-4">
                        {categorizedStats.informational.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold uppercase text-neutral-500 tracking-wider mb-2">Thông tin</h3>
                                <div className="space-y-1">
                                    {categorizedStats.informational.map(stat => (
                                        <InfoStatItem
                                            key={stat.name}
                                            name={attributeMap.get(stat.name)?.name || stat.name}
                                            value={stat.description}
                                            icon={attributeMap.get(stat.name)?.icon}
                                            isHighlighted={recentlyUpdatedStats.has(stat.name)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        {categorizedStats.statuses.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold uppercase text-neutral-500 tracking-wider mb-2">Trạng Thái & Hiệu Ứng</h3>
                                <div className="space-y-2">
                                    {categorizedStats.statuses.map(stat => (
                                        <StatusItem
                                            key={stat.name}
                                            statName={stat.name}
                                            stat={stat}
                                            isHighlighted={recentlyUpdatedStats.has(stat.name)}
                                            onClick={() => onStatClick(stat, ownerName, 'player')}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        {categorizedStats.knowledge.length > 0 && (
                             <div>
                                <h3 className="text-sm font-semibold uppercase text-neutral-500 tracking-wider mb-2">Tri Thức & Nhận Thức</h3>
                                <div className="space-y-2">
                                     {categorizedStats.knowledge.map(stat => (
                                        <StatusItem
                                            key={stat.name}
                                            statName={stat.name}
                                            stat={stat}
                                            isHighlighted={recentlyUpdatedStats.has(stat.name)}
                                            onClick={() => onStatClick(stat, ownerName, 'player')}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
             <style>{`
                @keyframes flash { 
                    0%, 100% { box-shadow: 0 0 2px rgba(255, 255, 255, 0.4); } 
                    50% { box-shadow: 0 0 10px 3px rgba(255, 255, 255, 0.8); }
                }
                .animate-flash { animation: flash 1.5s ease-in-out infinite; }
                @keyframes flash-info { 
                    0%, 100% { background-color: rgba(0,0,0,0.2); } 
                    50% { background-color: rgba(255, 255, 255, 0.15); }
                }
                .animate-flash-info { animation: flash-info 1.5s ease-in-out infinite; }
             `}</style>
        </div>
    );
};

export default CharacterSheet;
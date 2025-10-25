import React, { useMemo } from 'react';
import { GameState, CharacterStat, StatType, AttributeType } from '../../types';
import { GetIconComponent } from '../icons/AttributeIcons';
import { getRealmString } from '../../services/CultivationService';

interface CharacterSheetProps {
    gameState: GameState;
    onStatClick: (stat: CharacterStat & { name: string }, ownerName: string, ownerType: 'player' | 'npc', ownerId?: string) => void;
}

const StatBar: React.FC<{ current: number; max: number; barColor: string; label: string }> = ({ current, max, barColor, label }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-neutral-300">{label}</span>
                <span className="font-mono">{`${Math.floor(current)}/${max}`}</span>
            </div>
            <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-black/50">
                <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const StatGridItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number; title: string }> = ({ icon, label, value, title }) => (
    <div className="flex items-center gap-3 bg-black/30 p-2 rounded-lg border border-transparent hover:border-neutral-600 transition-colors" title={title}>
        <div className="w-7 h-7 flex-shrink-0 text-neutral-300 bg-black/30 rounded p-1">{icon}</div>
        <div className="flex-grow min-w-0">
            <p className="text-sm font-semibold text-white truncate">{label}</p>
            <p className="text-base font-bold text-cyan-300 font-mono">{value}</p>
        </div>
    </div>
);

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

const getRelationshipTheme = (relationship: string) => {
    const lowerCaseRelationship = relationship.toLowerCase();
    if (['bạn', 'đồng minh', 'yêu', 'thích', 'huynh đệ', 'tỷ muội', 'thân thiện'].some(term => lowerCaseRelationship.includes(term))) {
        return 'bg-green-500/20 text-green-300 border-green-500/30';
    }
    if (['thù', 'địch', 'ghét', 'căm hận', 'cảnh giác'].some(term => lowerCaseRelationship.includes(term))) {
        return 'bg-red-500/20 text-red-300 border-red-500/30';
    }
    return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
};

const SectionCard: React.FC<{ title: string, children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <section className={`bg-black/20 p-4 rounded-xl border border-white/10 ${className}`}>
        <h3 className="text-lg font-bold text-white mb-3 font-rajdhani uppercase tracking-wider">{title}</h3>
        {children}
    </section>
);


const CharacterSheet: React.FC<CharacterSheetProps> = ({ gameState, onStatClick }) => {
    const { playerStats, playerStatOrder, coreStats, worldContext, npcs, cultivation } = gameState;
    const { customAttributes, character } = worldContext;
    const realmString = getRealmString(cultivation.level, worldContext);

    const { vitalAttributes, primaryAttributes, informationalAttributes } = useMemo(() => {
        return {
            vitalAttributes: customAttributes.filter(attr => attr.type === AttributeType.VITAL),
            primaryAttributes: customAttributes.filter(attr => attr.type === AttributeType.PRIMARY),
            informationalAttributes: customAttributes.filter(attr => attr.type === AttributeType.INFORMATIONAL),
        };
    }, [customAttributes]);

    const formatStatValue = (value: number, attributeId: string): string => {
        if (['chiMang', 'satThuongChiMang', 'giamHoiChieu'].includes(attributeId)) {
            return `${(value * 100).toFixed(0)}%`;
        }
        return String(Math.floor(value));
    };

    const VITAL_BAR_COLORS: Record<string, string> = {
        sinhLucToiDa: 'bg-gradient-to-r from-red-500 to-red-600',
        linhLucToiDa: 'bg-gradient-to-r from-blue-500 to-cyan-500',
        theLucToiDa: 'bg-gradient-to-r from-yellow-500 to-amber-500',
        doNoToiDa: 'bg-gradient-to-r from-orange-500 to-amber-600',
        doNuocToiDa: 'bg-gradient-to-r from-sky-500 to-blue-600',
        default: 'bg-gradient-to-r from-gray-500 to-gray-600',
    };

    const genderString = character.gender === 'Tự định nghĩa' ? character.customGender : character.gender;

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-4 space-y-4">
            
            <section className="bg-black/20 p-4 rounded-xl border border-white/10 flex gap-4">
                <img 
                    src={character.avatarUrl || 'https://via.placeholder.com/128'} 
                    alt="Avatar" 
                    className="w-32 h-32 rounded-full border-2 border-neutral-600 object-cover flex-shrink-0"
                />
                <div className="flex-grow space-y-2">
                    <div>
                        <p className="text-xs text-neutral-400">Tuổi: {character.age} | Giới tính: {genderString}</p>
                        <p className="text-sm"><span className="font-semibold text-neutral-300">Tính cách:</span> {character.personality || 'Chưa xác định'}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-neutral-300 text-sm">Ngoại hình:</p>
                        <p className="text-sm text-neutral-400 max-h-20 overflow-y-auto custom-scrollbar pr-2">{character.appearance || 'Chưa mô tả'}</p>
                    </div>
                </div>
            </section>
            
            <SectionCard title="Tài Nguyên">
                <div className="space-y-3">
                    {vitalAttributes.map(attr => {
                        const currentStatKey = attr.id.replace('ToiDa', '');
                        // @ts-ignore
                        const currentValue = coreStats[currentStatKey] ?? 0;
                        // @ts-ignore
                        const maxValue = coreStats[attr.id] ?? 0;
                        const barColor = VITAL_BAR_COLORS[attr.id] || VITAL_BAR_COLORS.default;
                        
                        return (
                            <StatBar key={attr.id} current={currentValue} max={maxValue} barColor={barColor} label={attr.name} />
                        );
                    })}
                </div>
            </SectionCard>

            <SectionCard title="Tu Luyện">
                <p className="text-xl font-bold text-purple-300 text-center mb-2">{realmString}</p>
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-neutral-300">Kinh nghiệm</span>
                        <span className="font-mono">{`${cultivation.exp}/${cultivation.expToNextLevel}`}</span>
                    </div>
                    <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-black/50">
                        <div className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${(cultivation.exp / cultivation.expToNextLevel) * 100}%` }}></div>
                    </div>
                </div>
            </SectionCard>
            
            <SectionCard title="Mạng Lưới Quan Hệ">
                {npcs.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                        {npcs.map(npc => (
                            <div key={npc.id} className="p-2 bg-black/30 rounded-md">
                                <p className="font-bold text-white truncate text-sm">{npc.name}</p>
                                <div className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 border ${getRelationshipTheme(npc.relationship)}`}>
                                    {npc.relationship}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                     <p className="text-neutral-500 italic text-center py-2">Chưa gặp gỡ ai.</p>
                )}
            </SectionCard>

            <SectionCard title="Chỉ Số Cốt Lõi">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {primaryAttributes.map(attr => {
                        // @ts-ignore
                        const value = coreStats[attr.id] ?? attr.baseValue;
                        return (
                             <StatGridItem 
                                key={attr.id} 
                                icon={<GetIconComponent name={attr.icon} className="w-full h-full"/>}
                                label={attr.name}
                                value={formatStatValue(value, attr.id)}
                                title={attr.description}
                             />
                        );
                    })}
                     {informationalAttributes.map(attr => {
                        // @ts-ignore
                        const value = coreStats[attr.id] ?? attr.baseValue;
                         return (
                             <StatGridItem 
                                key={attr.id} 
                                icon={<GetIconComponent name={attr.icon} className="w-full h-full"/>}
                                label={attr.name}
                                value={value}
                                title={attr.description}
                             />
                         );
                    })}
                </div>
            </SectionCard>

            <SectionCard title="Trạng Thái Hiện Tại">
                {playerStatOrder.length > 0 ? (
                    <div className="space-y-2">
                        {playerStatOrder.map(statName => {
                            const stat = playerStats[statName];
                            if (!stat) return null;
                            const theme = getStatTheme(stat.type);
                            return (
                                <button key={statName} onClick={() => onStatClick({ ...stat, name: statName }, worldContext.character.name, 'player')} className={`w-full text-left p-3 rounded-md border-l-4 transition-colors ${theme.border} ${theme.bg}`}>
                                    <p className="font-bold text-white">{statName}</p>
                                    <p className="text-sm text-neutral-400 truncate">{stat.description}</p>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-neutral-500 italic text-center py-4">Không có trạng thái đặc biệt nào.</p>
                )}
            </SectionCard>
        </div>
    );
};

export default CharacterSheet;
import React, { useMemo, useState } from 'react';
import { GameState, AttributeType, StatType, CharacterStat, Skill } from '../../types';
import { getRealmString } from '../../services/CultivationService';
import { GetIconComponent } from '../icons/AttributeIcons';
import ChevronIcon from '../icons/ChevronIcon';

interface CharacterSheetProps {
  gameState: GameState;
  onStatClick: (stat: CharacterStat & { name: string }, ownerName: string, ownerType: 'player' | 'npc', ownerId?: string) => void;
}

const Section: React.FC<{ title: string, children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={`bg-black/20 p-4 rounded-xl border border-neutral-800 ${className}`}>
        <h3 className="text-lg font-bold text-white mb-3 font-rajdhani uppercase tracking-wider">{title}</h3>
        {children}
    </div>
);

const StatBar: React.FC<{ current: number; max: number; barColor: string; label: string }> = ({ current, max, barColor, label }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    return (
        <div className="flex-grow min-w-[150px] sm:min-w-[180px]">
            <div className="flex justify-between text-xs mb-1 font-semibold">
                <span className="text-neutral-300">{label}</span>
                <span className="font-mono">{`${Math.floor(current)}/${max}`}</span>
            </div>
            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-black/50">
                <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const StatGridItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number; title: string }> = ({ icon, label, value, title }) => (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-black/30" title={title}>
        <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-cyan-300 bg-cyan-900/30 rounded-lg border border-cyan-500/30">
            {icon}
        </div>
        <div className="flex-grow min-w-0">
            <p className="text-xs font-semibold text-neutral-300 truncate">{label}</p>
            <p className="text-base font-bold text-white font-mono">{value}</p>
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

const SkillEntry: React.FC<{ skill: Skill }> = ({ skill }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div className="bg-black/20 rounded-lg border border-neutral-700/50 overflow-hidden">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex justify-between items-center p-2.5 text-left hover:bg-white/10 transition-colors duration-200">
                <div className="flex-grow min-w-0">
                    <span className="font-bold text-base text-white truncate">{skill.name}</span>
                    <p className="text-xs text-neutral-400">{`Năng lượng: ${skill.cost} | Hồi chiêu: ${skill.cooldown} lượt`}</p>
                </div>
                <ChevronIcon isExpanded={isExpanded} className="h-6 w-6 text-neutral-400 flex-shrink-0 ml-2" />
            </button>
            {isExpanded && (
                <div className="px-3 pb-3 border-t border-neutral-700 animate-fade-in-fast">
                    <p className="text-sm text-neutral-300 italic my-2">{skill.description}</p>
                    <div className="space-y-2">
                    {skill.abilities.map(ability => (
                        <div key={ability.name} className="p-2 bg-black/20 rounded-md border border-transparent">
                            <h4 className="font-semibold text-sm text-neutral-200">{ability.name}</h4>
                            <p className="text-xs text-gray-400 mt-1">{ability.description}</p>
                        </div>
                    ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const CharacterSheet: React.FC<CharacterSheetProps> = ({ gameState, onStatClick }) => {
    const { worldContext, coreStats, cultivation, playerTitle, playerStatOrder, playerStats, playerSkills } = gameState;
    const { character } = worldContext;

    const realmString = getRealmString(cultivation.level, worldContext);
    const genderString = character.gender === 'Tự định nghĩa' ? character.customGender : character.gender;

    const VITAL_BAR_COLORS: Record<string, string> = {
        sinhLucToiDa: 'bg-gradient-to-r from-red-500 to-red-600',
        linhLucToiDa: 'bg-gradient-to-r from-blue-500 to-cyan-500',
        theLucToiDa: 'bg-gradient-to-r from-yellow-500 to-amber-500',
        doNoToiDa: 'bg-gradient-to-r from-orange-500 to-amber-600',
        doNuocToiDa: 'bg-gradient-to-r from-sky-500 to-blue-600',
        default: 'bg-gradient-to-r from-gray-500 to-gray-600',
    };

    const { vitalAttributes, primaryAttributes, informationalAttributes } = useMemo(() => ({
        vitalAttributes: worldContext.customAttributes.filter(attr => attr.type === AttributeType.VITAL),
        primaryAttributes: worldContext.customAttributes.filter(attr => attr.type === AttributeType.PRIMARY),
        informationalAttributes: worldContext.customAttributes.filter(attr => attr.type === AttributeType.INFORMATIONAL),
    }), [worldContext.customAttributes]);

    const formatStatValue = (value: number, attributeId: string): string => {
        if (['chiMang', 'satThuongChiMang', 'giamHoiChieu'].includes(attributeId)) {
            return `${(value * 100).toFixed(0)}%`;
        }
        return String(Math.floor(value));
    };

    return (
        <div className="p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar h-full">
            {/* --- Section 1: Character Info --- */}
            <Section title="Đặc Điểm" className="flex-shrink-0">
                <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                    <img src={character.avatarUrl || 'https://via.placeholder.com/96'} alt="Avatar" className="w-24 h-24 rounded-full border-2 border-neutral-600 object-cover flex-shrink-0" />
                    <div className="flex-grow space-y-1 text-center sm:text-left">
                        <h2 className="text-3xl font-title text-white truncate" title={character.name} style={{textShadow: '0 0 8px rgba(255,255,255,0.4)'}}>{character.name}</h2>
                        {playerTitle && <p className="text-xs text-yellow-300 font-semibold truncate" title={playerTitle}>{playerTitle}</p>}
                        <div className="flex gap-4 justify-center sm:justify-start flex-wrap text-sm text-neutral-400">
                            <span>Tuổi: <span className="text-white font-semibold">{character.age}</span></span>
                            <span>Giới tính: <span className="text-white font-semibold">{genderString}</span></span>
                        </div>
                        <p className="text-sm"><span className="font-semibold text-neutral-300">Tính cách:</span> {character.personality || 'Chưa xác định'}</p>
                    </div>
                </div>
            </Section>
            
            {/* --- Section 2: Vitals --- */}
            <Section title="Tài Nguyên Cốt Lõi">
                <div className="flex flex-wrap gap-x-6 gap-y-4">
                    {vitalAttributes.map(attr => {
                        const currentStatKey = attr.id.replace('ToiDa', '');
                        const currentValue = (coreStats as any)[currentStatKey] ?? 0;
                        const maxValue = (coreStats as any)[attr.id] ?? 0;
                        return <StatBar key={attr.id} current={currentValue} max={maxValue} barColor={VITAL_BAR_COLORS[attr.id] || VITAL_BAR_COLORS.default} label={attr.name} />;
                    })}
                </div>
            </Section>
            
            <Section title="Chỉ Số Cốt Lõi">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[...primaryAttributes, ...informationalAttributes].map(attr => {
                        const value = (coreStats as any)[attr.id] ?? attr.baseValue;
                        return <StatGridItem key={attr.id} icon={<GetIconComponent name={attr.icon} className="w-5 h-5"/>} label={attr.name} value={formatStatValue(value, attr.id)} title={attr.description}/>
                    })}
                </div>
            </Section>
            <Section title="Tu Luyện">
                <p className="text-xl font-bold text-purple-300 text-center mb-2">{realmString}</p>
                <div className="flex-grow min-w-[150px] sm:min-w-[180px]">
                    <div className="flex justify-between text-xs mb-1 font-semibold">
                        <span className="text-neutral-300">Kinh nghiệm</span>
                        <span className="font-mono">{`${Math.floor(cultivation.exp)}/${cultivation.expToNextLevel}`}</span>
                    </div>
                    <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden border border-black/50">
                        <div className={`h-full rounded-full transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500`} style={{ width: `${(cultivation.exp / cultivation.expToNextLevel) * 100}%` }}></div>
                    </div>
                </div>
            </Section>
            
            <Section title="Trạng Thái Hiện Tại" className="flex flex-col">
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                     {playerStatOrder.length > 0 ? playerStatOrder.map(statName => {
                        const stat = playerStats[statName];
                        if (!stat) return null;
                        const theme = getStatTheme(stat.type);
                        return (
                            <button key={statName} onClick={() => onStatClick({ ...stat, name: statName }, character.name, 'player')} className={`w-full text-left p-2 rounded-md border-l-4 transition-colors ${theme.border} ${theme.bg}`}>
                                <p className="font-bold text-white text-sm">{statName}</p>
                                <p className="text-xs text-neutral-400 truncate">{stat.description}</p>
                            </button>
                        );
                     }) : <p className="text-neutral-500 italic text-center text-sm py-4">Không có trạng thái đặc biệt nào.</p>}
                </div>
            </Section>

            <Section title="Sổ Tay Kỹ Năng" className="flex flex-col">
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                     {playerSkills.length > 0 ? playerSkills.map(skill => (
                        <SkillEntry key={skill.id} skill={skill} />
                     )) : <p className="text-neutral-500 italic text-center text-sm py-4">Chưa lĩnh ngộ kỹ năng nào.</p>}
                </div>
            </Section>

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

export default CharacterSheet;
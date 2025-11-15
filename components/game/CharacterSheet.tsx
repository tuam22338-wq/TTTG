import React, { useState } from 'react';
import { GameState, CharacterStat, Skill, CultivationState, WorldCreationState, AttributeType } from '../../types';
import { getRealmString } from '../../services/CultivationService';
import { GetIconComponent } from '../icons/AttributeIcons';
import { AtkIcon, DefIcon, MDefIcon, AgiIcon, CritIcon, CritDmgIcon, CdrIcon } from '../icons/CombatStatIcons';
import ChevronIcon from '../icons/ChevronIcon';
import StatTooltip from './StatTooltip';

// --- PROPS ---
interface CharacterSheetProps {
  gameState: GameState;
  onStatClick: (stat: CharacterStat & { name: string }, ownerName: string, ownerType: 'player' | 'npc', ownerId?: string) => void;
}

// --- SUB-COMPONENTS ---

const StatBar: React.FC<{ current: number; max: number; barColor: string; label: string; icon: React.ReactNode }> = ({ current, max, barColor, label, icon }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    return (
        <div className="flex-grow">
            <div className="flex justify-between items-center text-xs mb-1 font-semibold">
                <div className="flex items-center gap-1.5 text-neutral-300">
                    {icon}
                    <span>{label}</span>
                </div>
                <span className="font-mono text-white">{`${Math.floor(current)}/${max}`}</span>
            </div>
            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-black/50">
                <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const AttributeGrid: React.FC<{ gameState: GameState }> = ({ gameState }) => {
    const { coreStats, worldContext } = gameState;
    const primaryAttributes = worldContext.customAttributes.filter(attr => attr.type === AttributeType.PRIMARY);

    const formatStatValue = (value: number, attributeId: string): string => {
        if (['chiMang', 'satThuongChiMang', 'giamHoiChieu'].includes(attributeId)) {
            return `${(value * 100).toFixed(0)}%`;
        }
        return String(Math.floor(value));
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {primaryAttributes.map(attr => {
                const value = (coreStats as any)[attr.id] ?? attr.baseValue;
                return (
                    <StatTooltip key={attr.id} statId={attr.id as keyof GameState['coreStats']} gameState={gameState}>
                        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-black/30 neumorphic-inset" title={attr.description}>
                            <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-cyan-300 bg-cyan-900/30 rounded-lg border border-cyan-500/30">
                                <GetIconComponent name={attr.icon} className="w-5 h-5"/>
                            </div>
                            <div className="flex-grow min-w-0">
                                <p className="text-xs font-semibold text-neutral-300 truncate">{attr.name}</p>
                                <p className="text-base font-bold text-white font-mono">{formatStatValue(value, attr.id)}</p>
                            </div>
                        </div>
                    </StatTooltip>
                );
            })}
        </div>
    );
};

const SkillList: React.FC<{ skills: Skill[] }> = ({ skills }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    return (
        <div className="space-y-2">
            {skills.length > 0 ? skills.map(skill => (
                <div key={skill.id} className="bg-black/20 rounded-lg border border-neutral-700/50 overflow-hidden">
                    <button onClick={() => setExpandedId(expandedId === skill.id ? null : skill.id)} className="w-full flex justify-between items-center p-2.5 text-left hover:bg-white/10 transition-colors duration-200">
                        <div className="flex-grow min-w-0">
                            <span className="font-bold text-base text-white truncate">{skill.name}</span>
                            <p className="text-xs text-neutral-400">{`Năng lượng: ${skill.cost} | Hồi chiêu: ${skill.cooldown} lượt`}</p>
                        </div>
                        <ChevronIcon isExpanded={expandedId === skill.id} className="h-6 w-6 text-neutral-400 flex-shrink-0 ml-2" />
                    </button>
                    {expandedId === skill.id && (
                        <div className="px-3 pb-3 border-t border-neutral-700 animate-fade-in-fast">
                            <p className="text-sm text-neutral-300 italic my-2">{skill.description}</p>
                            <div className="space-y-2">
                            {skill.abilities.map(ability => (
                                <div key={ability.name} className="p-2 bg-black/30 rounded-md border border-transparent">
                                    <h4 className="font-semibold text-sm text-neutral-200">{ability.name}</h4>
                                    <p className="text-xs text-gray-400 mt-1">{ability.description}</p>
                                </div>
                            ))}
                            </div>
                        </div>
                    )}
                </div>
            )) : <p className="text-neutral-500 italic text-center text-sm py-4">Chưa lĩnh ngộ kỹ năng nào.</p>}
        </div>
    );
};

const CultivationPanel: React.FC<{ cultivation: CultivationState, worldContext: WorldCreationState }> = ({ cultivation, worldContext }) => {
    const realmString = getRealmString(cultivation.level, worldContext);
    const progress = (cultivation.exp / cultivation.expToNextLevel) * 100;
    return (
        <div className="p-4 bg-black/30 rounded-lg neumorphic-inset">
            <h3 className="text-xl font-bold text-purple-300 text-center mb-4">{realmString}</h3>
            <div className="flex justify-between text-xs mb-1 font-semibold">
                <span className="text-neutral-300">Kinh nghiệm</span>
                <span className="font-mono">{`${Math.floor(cultivation.exp)}/${cultivation.expToNextLevel}`}</span>
            </div>
            <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden border border-black/50">
                <div className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};


// --- MAIN SHEET ---
const CharacterSheet: React.FC<CharacterSheetProps> = ({ gameState, onStatClick }) => {
    const { worldContext, playerStats, playerStatOrder, coreStats } = gameState;
    const { character } = worldContext;

     const VITAL_BARS: { key: keyof GameState['coreStats'], maxKey: keyof GameState['coreStats'], color: string, label: string, icon: React.ReactNode }[] = [
        { key: 'sinhLuc', maxKey: 'sinhLucToiDa', color: 'bg-gradient-to-r from-red-500 to-red-600', label: 'Sinh Lực', icon: <GetIconComponent name="heart" className="w-3 h-3"/> },
        { key: 'linhLuc', maxKey: 'linhLucToiDa', color: 'bg-gradient-to-r from-blue-500 to-cyan-500', label: 'Linh Lực', icon: <GetIconComponent name="droplet" className="w-3 h-3"/> },
        { key: 'theLuc', maxKey: 'theLucToiDa', color: 'bg-gradient-to-r from-yellow-500 to-amber-500', label: 'Thể Lực', icon: <GetIconComponent name="lightning" className="w-3 h-3"/> },
    ];
    
    const orderedStats = playerStatOrder
      .map(name => ({ name, ...playerStats[name] }))
      .filter(stat => stat.name && stat.description);


    return (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Vitals & Core Info */}
            <div className="lg:col-span-1 space-y-4">
                 <div className="flex flex-col items-center text-center">
                    <img src={character.avatarUrl || 'https://via.placeholder.com/128'} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-neutral-700 object-cover" />
                    <h2 className="text-2xl font-title text-white truncate mt-2" title={character.name}>{character.name}</h2>
                    {gameState.playerTitle && <p className="text-sm text-yellow-300 font-semibold truncate" title={gameState.playerTitle}>{gameState.playerTitle}</p>}
                    <p className="text-sm text-neutral-400 mt-1">{character.personality}</p>
                </div>
                <div className="space-y-3">
                    {VITAL_BARS.map(bar => (
                        <StatBar key={bar.key} current={coreStats[bar.key]} max={coreStats[bar.maxKey]} barColor={bar.color} label={bar.label} icon={bar.icon} />
                    ))}
                </div>
                 <div className="prose prose-invert max-w-none text-neutral-300 leading-relaxed text-sm whitespace-pre-wrap">
                    <h3 className="text-lg font-bold text-white mb-3">Tiểu sử</h3>
                    <p>{character.biography}</p>
                </div>
            </div>

            {/* Center Column: Attributes & Skills */}
            <div className="lg:col-span-1 space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-white mb-3">Thuộc tính</h3>
                    <AttributeGrid gameState={gameState} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white mb-3">Kỹ năng</h3>
                    <SkillList skills={gameState.playerSkills} />
                </div>
            </div>

            {/* Right Column: Player Stats & Cultivation */}
            <div className="lg:col-span-1 space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-white mb-3">Trạng thái</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                       {orderedStats.length > 0 ? orderedStats.map((stat) => (
                           <button key={stat.name} onClick={() => onStatClick(stat, character.name, 'player')} className="w-full text-left p-2 rounded-md bg-black/20 hover:bg-black/40 transition-colors">
                                <p className="font-bold text-sm text-white">{stat.name}</p>
                                <p className="text-xs text-neutral-400 truncate">{stat.description}</p>
                           </button>
                       )) : <p className="text-sm text-neutral-500 italic">Không có trạng thái đặc biệt.</p>}
                    </div>
                </div>

                {gameState.worldContext.isCultivationEnabled && (
                    <div>
                        <h3 className="text-lg font-bold text-white mb-3">Tu Luyện</h3>
                        <CultivationPanel cultivation={gameState.cultivation} worldContext={gameState.worldContext} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default CharacterSheet;

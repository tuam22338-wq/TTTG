import React, { useState, useMemo } from 'react';
import { GameState, CharacterStat, SpecialItem, Item, Equipment, ItemType, EquipmentSlot, Skill, StatType, AttributeType, Ability } from '../../types';
import * as GameSaveService from '../../services/GameSaveService';
import { getRealmString } from '../../services/CultivationService';
import { GetIconComponent } from '../icons/AttributeIcons';
import { HeadIcon, ChestIcon, LegsIcon, HandsIcon, FeetIcon, WeaponIcon } from '../icons/EquipmentSlotIcons';
import ItemTooltip from './ItemTooltip';
import InputField from '../ui/InputField';
import { SearchIcon } from '../icons/SearchIcon';
import ChevronIcon from '../icons/ChevronIcon';
import Button from '../ui/Button';

// --- PROPS ---
interface CharacterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onStatClick: (stat: CharacterStat & { name: string }, ownerName: string, ownerType: 'player' | 'npc', ownerId?: string) => void;
  onShowAchievement: (item: SpecialItem) => void;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
}

// --- HELPER & SUB-COMPONENTS ---

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

const Section: React.FC<{ title: string, children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={`bg-black/20 p-3 rounded-xl border border-white/10 ${className}`}>
        <h3 className="text-md font-bold text-white mb-3 font-rajdhani uppercase tracking-wider">{title}</h3>
        {children}
    </div>
);

const StatBar: React.FC<{ current: number; max: number; barColor: string; label: string }> = ({ current, max, barColor, label }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    return (
        <div>
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
    <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-lg border border-transparent hover:border-neutral-600 transition-colors" title={title}>
        <div className="w-6 h-6 flex-shrink-0 text-neutral-300 bg-black/30 rounded p-1">{icon}</div>
        <div className="flex-grow min-w-0">
            <p className="text-xs font-semibold text-white truncate">{label}</p>
            <p className="text-sm font-bold text-cyan-300 font-mono">{value}</p>
        </div>
    </div>
);

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

// --- MAIN COMPONENT ---
const CharacterPanel: React.FC<CharacterPanelProps> = ({ isOpen, onClose, gameState, onStatClick, onShowAchievement, setGameState }) => {
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { worldContext, coreStats, cultivation, playerStatOrder, playerStats, npcs, playerSkills, inventory, equipment } = gameState;
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
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-30 flex justify-center items-center p-4 animate-fade-in-fast" onClick={onClose}>
        <div 
            className="relative w-full max-w-7xl h-[90vh] bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 flex animate-scale-in"
            onClick={(e) => e.stopPropagation()}
        >
            {/* --- 3-COLUMN LAYOUT --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 w-full h-full">
                
                {/* --- COLUMN 1: CHARACTER INFO & STATS --- */}
                <div className="col-span-1 border-r border-white/10 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                    <Section title="Nhân Vật">
                        <div className="flex gap-4">
                            <img src={character.avatarUrl || 'https://via.placeholder.com/80'} alt="Avatar" className="w-20 h-20 rounded-full border-2 border-neutral-600 object-cover flex-shrink-0" />
                            <div className="flex-grow space-y-1">
                                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 font-rajdhani truncate" title={character.name}>{character.name}</h2>
                                {gameState.playerTitle && <p className="text-xs text-yellow-300 font-semibold truncate" title={gameState.playerTitle}>{gameState.playerTitle}</p>}
                                <p className="text-xs text-neutral-400">Tuổi: {character.age} | {genderString}</p>
                                <p className="text-sm"><span className="font-semibold text-neutral-300">Tính cách:</span> {character.personality || 'Chưa xác định'}</p>
                            </div>
                        </div>
                    </Section>

                    <Section title="Tài Nguyên">
                        <div className="space-y-3">
                            {vitalAttributes.map(attr => {
                                const currentStatKey = attr.id.replace('ToiDa', '');
                                const currentValue = (coreStats as any)[currentStatKey] ?? 0;
                                const maxValue = (coreStats as any)[attr.id] ?? 0;
                                return <StatBar key={attr.id} current={currentValue} max={maxValue} barColor={VITAL_BAR_COLORS[attr.id] || VITAL_BAR_COLORS.default} label={attr.name} />;
                            })}
                        </div>
                    </Section>

                    <Section title="Tu Luyện">
                        <p className="text-lg font-bold text-purple-300 text-center">{realmString}</p>
                        <StatBar current={cultivation.exp} max={cultivation.expToNextLevel} barColor="bg-gradient-to-r from-purple-500 to-pink-500" label="Kinh nghiệm" />
                    </Section>

                    <Section title="Chỉ Số Cốt Lõi">
                        <div className="grid grid-cols-2 gap-2">
                            {[...primaryAttributes, ...informationalAttributes].map(attr => {
                                const value = (coreStats as any)[attr.id] ?? attr.baseValue;
                                return <StatGridItem key={attr.id} icon={<GetIconComponent name={attr.icon} className="w-full h-full"/>} label={attr.name} value={formatStatValue(value, attr.id)} title={attr.description}/>
                            })}
                        </div>
                    </Section>
                </div>

                {/* --- COLUMN 2: STATUSES & SKILLS --- */}
                <div className="col-span-1 md:col-span-1 lg:col-span-2 border-r border-white/10 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                    <Section title="Trạng Thái Hiện Tại">
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

                    <Section title="Sổ Tay Kỹ Năng" className="flex-grow flex flex-col">
                        <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2 flex-grow min-h-0">
                             {playerSkills.length > 0 ? playerSkills.map(skill => (
                                <SkillEntry key={skill.id} skill={skill} />
                             )) : <p className="text-neutral-500 italic text-center text-sm py-4">Chưa lĩnh ngộ kỹ năng nào.</p>}
                        </div>
                    </Section>
                </div>

                {/* --- COLUMN 3: EQUIPMENT & INVENTORY --- */}
                <div className="col-span-1 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                     {/* Equipment functionality will be added here in a future step */}
                     <Section title="Trang bị" className="flex-grow">
                        {/* This section will contain the paper doll and inventory */}
                     </Section>
                </div>

            </div>
            
             <button onClick={onClose} className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white transition-colors rounded-full z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <style>{`
            @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
            @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #555; border-radius: 10px; }
        `}</style>
    </div>
  );
};

export default CharacterPanel;

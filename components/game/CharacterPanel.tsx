import React, { useState } from 'react';
import { GameState, Skill, Ability, SpecialItem, CharacterStat, Equipment, EquipmentSlot, WorldCreationState } from '../../types';
import CharacterSheet from './CharacterSheet';
import SkillCodex from './SkillCodex';
import EquipmentAndInventoryPanel from './EquipmentAndInventoryPanel';
import { EquipmentIcon } from '../icons/EquipmentIcon';
import { UserIcon } from '../icons/UserIcon';
import { WandIcon } from '../icons/WandIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';

interface CharacterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  finalCoreStats: GameState['coreStats'] | null;
  onStatClick: (stat: CharacterStat & { name: string }, ownerName: string, ownerType: 'player' | 'npc', ownerId?: string) => void;
  recentlyUpdatedPlayerStats: Set<string>;
  onOpenCreateStatModal: () => void;
  onUseSkill: (skill: Skill, abilityName: string) => void;
  onRequestDeleteSkill: (skill: Skill) => void;
  onRequestEditAbility: (skillName: string, ability: Ability) => void;
  onOpenPowerCreationModal: () => void;
  isLoading: boolean;
  onEquipItem: (item: Equipment) => void;
  onUnequipItem: (slot: EquipmentSlot) => void;
  onShowAchievement: (item: SpecialItem) => void;
}

type PanelView = 'menu' | 'stats' | 'skills' | 'equipment';

function getRealmStringFromCustomSystem(level: number, worldContext: WorldCreationState): string {
    if (!worldContext.isCultivationEnabled || !worldContext.cultivationSystem?.mainTiers || worldContext.cultivationSystem.mainTiers.length === 0) {
        return `Cấp ${level}`;
    }

    let levelCounter = 1;
    for (const mainTier of worldContext.cultivationSystem.mainTiers) {
        if (mainTier.subTiers && mainTier.subTiers.length > 0) {
            for (const subTier of mainTier.subTiers) {
                if (levelCounter === level) {
                    return `${mainTier.name} - ${subTier.name}`;
                }
                levelCounter++;
            }
        } else {
            // Main tier without sub-tiers, assume it's one level
            if (levelCounter === level) {
                return mainTier.name;
            }
            levelCounter++;
        }
    }
    
    // Fallback if level is higher than defined tiers
    const lastTier = worldContext.cultivationSystem.mainTiers[worldContext.cultivationSystem.mainTiers.length - 1];
    if (lastTier) {
        const lastSubTier = lastTier.subTiers.length > 0 ? lastTier.subTiers[lastTier.subTiers.length - 1] : null;
        if (lastSubTier) {
             return `${lastTier.name} - ${lastSubTier.name} (Đại viên mãn)`;
        }
        return `${lastTier.name} (Đại viên mãn)`;
    }

    return `Cấp ${level}`;
}

const CharacterPanel: React.FC<CharacterPanelProps> = (props) => {
  const { isOpen, onClose, gameState } = props;
  const [view, setView] = useState<PanelView>('menu');

  if (!isOpen) return null;

  const menuItems: { id: PanelView; label: string; description: string; Icon: React.FC<{className?: string}> }[] = [
    { id: 'stats', label: 'Tổng Quan & Trạng Thái', description: 'Xem các chỉ số chiến đấu, cảnh giới và trạng thái hiện tại.', Icon: UserIcon },
    { id: 'skills', label: 'Kỹ Năng & Năng Lực', description: 'Quản lý và xem lại các bộ kỹ năng đã học.', Icon: WandIcon },
    { id: 'equipment', label: 'Trang Bị & Túi Đồ', description: 'Trang bị vật phẩm và quản lý các vật phẩm trong túi đồ.', Icon: EquipmentIcon },
  ];

  const currentViewItem = menuItems.find(item => item.id === view);
  const realmString = getRealmStringFromCustomSystem(gameState.cultivation.level, gameState.worldContext);

  const renderContent = () => {
    switch (view) {
      case 'stats':
        return (
           <CharacterSheet 
                gameState={gameState}
                onStatClick={props.onStatClick}
                recentlyUpdatedStats={props.recentlyUpdatedPlayerStats}
            />
        );
      case 'skills':
        return <SkillCodex {...props} viewMode={'desktop'} />;
      case 'equipment':
        return <EquipmentAndInventoryPanel {...props} />;
      case 'menu':
      default:
        return (
            <div className="p-4 sm:p-6">
                <div className="w-full space-y-3">
                    {menuItems.map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group border border-transparent hover:bg-white/5 hover:border-white/20"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-black/20 rounded-lg border border-white/10 group-hover:bg-white/10 transition-colors duration-300">
                                    <item.Icon className="h-6 w-6 text-neutral-400 group-hover:text-white transition-colors"/>
                                </div>
                                <div className="flex-grow text-left">
                                    <p className="font-bold text-lg text-neutral-100">{item.label}</p>
                                    <p className="text-sm text-neutral-400">{item.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-neutral-500 transition-transform duration-300 group-hover:text-white group-hover:translate-x-1">
                                <ChevronRightIcon className="h-6 w-6" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-30 flex justify-center items-center p-4 animate-fade-in-fast" onClick={onClose}>
        <div 
            className="relative w-full max-w-5xl h-[90vh] bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 flex flex-col animate-scale-in"
            onClick={(e) => e.stopPropagation()}
        >
            <header className="flex-shrink-0 p-4 pl-6 flex justify-between items-center border-b border-white/10">
                <div className="flex items-center gap-4">
                    {view !== 'menu' && (
                         <button onClick={() => setView('menu')} className="p-2 rounded-full text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors" aria-label="Quay lại menu nhân vật">
                            <ArrowLeftIcon className="h-6 w-6" />
                        </button>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold text-white font-rajdhani">
                           {view === 'menu' ? gameState.worldContext.character.name : currentViewItem?.label}
                        </h2>
                        {view === 'menu' && <p className="text-sm font-semibold text-purple-300">{realmString} - Cấp {gameState.cultivation.level}</p>}
                    </div>
                </div>
                <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white transition-colors rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </header>
            
            <main className="flex-grow min-h-0">
               {renderContent()}
            </main>
        </div>
        <style>{`
            @keyframes fade-in-fast {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-in-fast {
                animation: fade-in-fast 0.2s ease-out forwards;
            }
            @keyframes scale-in {
                from { transform: scale(0.95); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            .animate-scale-in {
                animation: scale-in 0.2s ease-out forwards;
            }
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #555; border-radius: 10px; }
        `}</style>
    </div>
  );
};

export default CharacterPanel;
import React, { useState } from 'react';
import { GameState, CharacterStat, SpecialItem } from '../../types';
import CharacterSheet from './CharacterSheet';
import SkillCodex from './SkillCodex';
import EquipmentAndInventoryPanel from './EquipmentAndInventoryPanel';
import { EquipmentIcon } from '../icons/EquipmentIcon';
import { UserIcon } from '../icons/UserIcon';
import { WandIcon } from '../icons/WandIcon';
import { getRealmString } from '../../services/CultivationService';
import * as GameSaveService from '../../services/GameSaveService';

interface CharacterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onStatClick: (stat: CharacterStat & { name: string }, ownerName: string, ownerType: 'player' | 'npc', ownerId?: string) => void;
  onShowAchievement: (item: SpecialItem) => void;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
}

type PanelView = 'stats' | 'skills' | 'equipment';

const NavButton: React.FC<{
    viewId: PanelView,
    label: string,
    Icon: React.FC<{className?: string}>,
    currentView: PanelView,
    setView: (view: PanelView) => void
}> = ({ viewId, label, Icon, currentView, setView }) => {
    const isActive = viewId === currentView;
    return (
        <button 
            onClick={() => setView(viewId)}
            className={`flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200 ${isActive ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'}`}
        >
            <Icon className={`h-6 w-6 mr-3 ${isActive ? 'text-pink-400' : ''}`} />
            <span className="font-semibold">{label}</span>
        </button>
    );
};

const CharacterPanel: React.FC<CharacterPanelProps> = (props) => {
  const { isOpen, onClose, gameState, onShowAchievement, setGameState } = props;
  const [view, setView] = useState<PanelView>('stats');

  if (!isOpen) return null;
  
  const handleEquipItem = (itemToEquip: any) => {
        if (!gameState) return;
        setGameState(prevState => {
            if (!prevState) return null;

            const newEquipment = { ...prevState.equipment };
            const newInventoryItems = [...prevState.inventory.items];
            
            // Unequip current item in that slot, if any
            const currentItem = newEquipment[itemToEquip.slot];
            if (currentItem) {
                newInventoryItems.push(currentItem);
            }
            
            // Equip new item and remove from inventory
            newEquipment[itemToEquip.slot] = itemToEquip;
            const itemIndexInInventory = newInventoryItems.findIndex(item => item.id === itemToEquip.id);
            if (itemIndexInInventory > -1) {
                newInventoryItems.splice(itemIndexInInventory, 1);
            }

            const newState = {
                ...prevState,
                equipment: newEquipment,
                inventory: { ...prevState.inventory, items: newInventoryItems },
            };
            
            GameSaveService.saveAutoSave(newState);
            return newState;
        });
    };

    const handleUnequipItem = (slot: any) => {
        if (!gameState) return;
        setGameState(prevState => {
            if (!prevState) return null;

            const itemToUnequip = prevState.equipment[slot];
            if (!itemToUnequip) return prevState;

            const newEquipment = { ...prevState.equipment, [slot]: null };
            const newInventoryItems = [...prevState.inventory.items, itemToUnequip];

             const newState = {
                ...prevState,
                equipment: newEquipment,
                inventory: { ...prevState.inventory, items: newInventoryItems },
            };
            GameSaveService.saveAutoSave(newState);
            return newState;
        });
    };


  const renderContent = () => {
    switch (view) {
      case 'stats':
        return <CharacterSheet gameState={gameState} onStatClick={props.onStatClick} />;
      case 'skills':
        return <SkillCodex skills={gameState.playerSkills} onUseSkill={() => {}} onRequestDelete={() => {}} onRequestEdit={() => {}} viewMode={'desktop'} />;
      case 'equipment':
        return <EquipmentAndInventoryPanel gameState={gameState} onEquipItem={handleEquipItem} onUnequipItem={handleUnequipItem} onShowAchievement={onShowAchievement} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-30 flex justify-center items-center p-4 animate-fade-in-fast" onClick={onClose}>
        <div 
            className="relative w-full max-w-7xl h-[90vh] bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 flex animate-scale-in"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Left Sidebar Navigation */}
            <nav className="w-64 flex-shrink-0 bg-black/20 border-r border-white/10 p-4 flex flex-col">
                <div className="border-b border-white/10 pb-4 mb-4">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 font-rajdhani truncate" title={gameState.worldContext.character.name}>
                        {gameState.worldContext.character.name}
                    </h2>
                    {gameState.playerTitle && <p className="text-sm text-yellow-300 font-semibold truncate" title={gameState.playerTitle}>{gameState.playerTitle}</p>}
                </div>
                <div className="space-y-2">
                    <NavButton viewId="stats" label="Tổng Quan" Icon={UserIcon} currentView={view} setView={setView} />
                    <NavButton viewId="skills" label="Kỹ Năng" Icon={WandIcon} currentView={view} setView={setView} />
                    <NavButton viewId="equipment" label="Trang Bị" Icon={EquipmentIcon} currentView={view} setView={setView} />
                </div>
                <div className="mt-auto">
                    {/* Placeholder for future elements like currency */}
                </div>
            </nav>
            
            {/* Main Content Area */}
            <main className="flex-grow min-h-0">
               {renderContent()}
            </main>
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
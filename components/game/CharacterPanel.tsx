import React, { useState } from 'react';
import { GameState, CharacterStat, SpecialItem, Item, Equipment, ItemType, EquipmentSlot } from '../../types';
import CharacterSheet from './CharacterSheet';
import EquipmentAndInventoryPanel from './EquipmentAndInventoryPanel';
import NpcCodex from './NpcCodex';
import { UserIcon } from '../icons/UserIcon';
import { InventoryIcon } from '../icons/InventoryIcon';
import { FactionIcon } from '../icons/FactionIcon';

interface CharacterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onStatClick: (stat: CharacterStat & { name: string }, ownerName: string, ownerType: 'player' | 'npc', ownerId?: string) => void;
  onShowAchievement: (item: SpecialItem) => void;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
  addNarrativeEvent: (event: string) => void;
}

type PanelTab = 'character' | 'inventory' | 'codex';

const TabButton: React.FC<{ tabId: PanelTab, activeTab: PanelTab, onSelect: () => void, icon: React.ReactNode, label: string }> = ({ tabId, activeTab, onSelect, icon, label }) => {
    const isActive = tabId === activeTab;
    return (
        <button
            onClick={onSelect}
            className={`w-full flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-300 aspect-square ${isActive ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5'}`}
            title={label}
        >
            <div className="h-8 w-8">{icon}</div>
            <span className="text-xs mt-1 font-semibold">{label}</span>
        </button>
    );
};

const CharacterPanel: React.FC<CharacterPanelProps> = ({ isOpen, onClose, gameState, onStatClick, onShowAchievement, setGameState, addNarrativeEvent }) => {
    const [activeTab, setActiveTab] = useState<PanelTab>('character');

    const handleEquipItem = (itemToEquip: Equipment) => {
        setGameState(prev => {
            if (!prev) return null;

            const currentEquippedItem = prev.equipment[itemToEquip.slot];
            const newInventoryItems = prev.inventory.items.filter(i => i.id !== itemToEquip.id);
            
            if (currentEquippedItem) {
                newInventoryItems.push(currentEquippedItem);
            }

            const newEquipment = { ...prev.equipment, [itemToEquip.slot]: itemToEquip };

            return { 
                ...prev, 
                inventory: { ...prev.inventory, items: newInventoryItems },
                equipment: newEquipment 
            };
        });
        addNarrativeEvent(`Người chơi đã trang bị ${itemToEquip.name}.`);
    };

    const handleUnequipItem = (slot: EquipmentSlot) => {
        const itemToUnequip = gameState.equipment[slot];
        if (!itemToUnequip) return;

        setGameState(prev => {
            if (!prev) return null;
            
            const itemToUnequip = prev.equipment[slot];
            if (!itemToUnequip) return prev;

            const newInventoryItems = [...prev.inventory.items, itemToUnequip];
            const newEquipment = { ...prev.equipment, [slot]: null };

            return {
                ...prev,
                inventory: { ...prev.inventory, items: newInventoryItems },
                equipment: newEquipment,
            };
        });
        addNarrativeEvent(`Người chơi đã tháo trang bị ${itemToUnequip.name}.`);
    };
  
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-30 flex justify-center items-center p-4 animate-fade-in-fast" onClick={onClose}>
            <div 
                className="relative w-full max-w-7xl h-[90vh] bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 flex animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <nav className="w-24 flex-shrink-0 bg-black/20 border-r border-white/10 p-3 flex flex-col items-center gap-3">
                    <TabButton tabId="character" activeTab={activeTab} onSelect={() => setActiveTab('character')} icon={<UserIcon className="h-full w-full"/>} label="Nhân vật"/>
                    <TabButton tabId="inventory" activeTab={activeTab} onSelect={() => setActiveTab('inventory')} icon={<InventoryIcon />} label="Trang bị"/>
                    <TabButton tabId="codex" activeTab={activeTab} onSelect={() => setActiveTab('codex')} icon={<FactionIcon />} label="Nhân Mạch"/>
                </nav>

                <main className="flex-grow w-full h-full overflow-hidden">
                    {activeTab === 'character' && (
                        <CharacterSheet
                            gameState={gameState}
                            onStatClick={onStatClick}
                        />
                    )}
                    {activeTab === 'inventory' && (
                        <EquipmentAndInventoryPanel
                            gameState={gameState}
                            onEquip={handleEquipItem}
                            onUnequip={handleUnequipItem}
                            onShowAchievement={onShowAchievement}
                        />
                    )}
                    {activeTab === 'codex' && (
                        <NpcCodex
                            npcs={gameState.npcs}
                        />
                    )}
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
            `}</style>
        </div>
    );
};

export default CharacterPanel;
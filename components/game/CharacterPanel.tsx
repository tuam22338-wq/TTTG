import React, { useState } from 'react';
import { GameState, CharacterStat, SpecialItem, Item, Equipment, ItemType, EquipmentSlot } from '../../types';
import CharacterSheet from './CharacterSheet';
import EquipmentAndInventoryPanel from './EquipmentAndInventoryPanel';
import NpcCodex from './NpcCodex';
import { UserIcon } from '../icons/UserIcon';
import { InventoryIcon } from '../icons/InventoryIcon';
import { UsersIcon } from '../icons/UsersIcon';

interface CharacterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onStatClick: (stat: CharacterStat & { name: string }, ownerName: string, ownerType: 'player' | 'npc', ownerId?: string) => void;
  onShowAchievement: (item: SpecialItem) => void;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
  addNarrativeEvent: (event: string) => void;
}

type PanelTab = 'character' | 'inventory' | 'relationships';

const TabButton: React.FC<{ tabId: PanelTab, activeTab: PanelTab, onSelect: () => void, icon: React.ReactNode, label: string }> = ({ tabId, activeTab, onSelect, icon, label }) => {
    const isActive = tabId === activeTab;
    return (
        <button
            onClick={onSelect}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5'}`}
            title={label}
        >
            <div className="h-6 w-6">{icon}</div>
            <span className="font-semibold">{label}</span>
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
        <>
            <div 
                className="fixed inset-0 bg-black/60 z-30 animate-fade-in-fast" 
                onClick={onClose}
            ></div>
            <div className="fixed top-0 left-0 right-0 z-40 p-4 pointer-events-none">
                 <div 
                    className="relative w-full max-w-7xl mx-auto h-auto max-h-[calc(100vh-2rem)] bg-[var(--bg-panel)] rounded-3xl flex flex-col animate-slide-down pointer-events-auto shadow-2xl shadow-black/50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <nav className="w-full flex-shrink-0 bg-black/20 p-2 flex items-center justify-center gap-4 border-b border-white/10 rounded-t-3xl">
                        <TabButton tabId="character" activeTab={activeTab} onSelect={() => setActiveTab('character')} icon={<UserIcon className="h-full w-full"/>} label="Nhân vật"/>
                        <TabButton tabId="inventory" activeTab={activeTab} onSelect={() => setActiveTab('inventory')} icon={<InventoryIcon />} label="Trang bị & Túi đồ"/>
                        <TabButton tabId="relationships" activeTab={activeTab} onSelect={() => setActiveTab('relationships')} icon={<UsersIcon className="h-full w-full" />} label="Quan Hệ"/>
                    </nav>

                    <main className="flex-grow w-full h-[75vh] overflow-hidden min-h-0">
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
                        {activeTab === 'relationships' && (
                             <div className="p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar h-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {gameState.npcs.length > 0 ? gameState.npcs.map(npc => (
                                    <div key={npc.id} className="p-3 bg-black/20 rounded-lg border border-neutral-800">
                                        <p className="font-bold text-white text-lg">{npc.name}</p>
                                        <p className="text-sm text-neutral-400 mt-1">Quan hệ: <span className="text-cyan-300 font-semibold">{npc.relationship}</span></p>
                                        <p className="text-sm text-neutral-400">Thiện cảm: <span className="font-mono" style={{ color: npc.affinity > 70 ? '#4ade80' : npc.affinity < 30 ? '#f87171' : '#60a5fa' }}>{npc.affinity}</span></p>
                                    </div>
                                )) : (
                                    <p className="text-center text-neutral-500 py-8 col-span-full">Chưa gặp gỡ NPC nào.</p>
                                )}
                                </div>
                            </div>
                        )}
                    </main>
                    
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white transition-colors rounded-full z-10 bg-black/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
                @keyframes slide-down {
                    from { transform: translateY(-50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-down { animation: slide-down 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #555; border-radius: 10px; }
            `}</style>
        </>
    );
};

export default CharacterPanel;
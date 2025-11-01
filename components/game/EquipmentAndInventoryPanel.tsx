import React, { useState, useMemo } from 'react';
import { GameState, Item, Equipment, ItemType, EquipmentSlot, SpecialItem } from '../../types';
import { HeadIcon, ChestIcon, LegsIcon, HandsIcon, FeetIcon, WeaponIcon } from '../icons/EquipmentSlotIcons';
import ItemTooltip from './ItemTooltip';
import InputField from '../ui/InputField';
import { SearchIcon } from '../icons/SearchIcon';
import Button from '../ui/Button';

// --- PROPS ---
interface EquipmentAndInventoryPanelProps {
    gameState: GameState;
    onEquip: (item: Equipment) => void;
    onUnequip: (slot: EquipmentSlot) => void;
    onShowAchievement: (item: SpecialItem) => void;
}

// --- SUB-COMPONENTS ---
const Slot: React.FC<{ slot: EquipmentSlot, item: Equipment | null, onUnequip: () => void, onSelect: () => void, isSelected: boolean, icon: React.ReactNode }> = 
({ slot, item, onUnequip, onSelect, isSelected, icon }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={item ? onUnequip : onSelect}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`w-full aspect-square rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                    isSelected ? 'border-pink-500 bg-pink-900/40' : 
                    item ? 'border-neutral-600 bg-black/40 hover:border-neutral-400' : 
                    'border-dashed border-neutral-700 bg-black/20 hover:border-neutral-500 hover:bg-neutral-800/50'
                }`}
            >
                {item ? (
                    <span className="text-white text-xs font-bold p-1 text-center">{item.name}</span> // Placeholder for item icon
                ) : (
                    <div className="w-8 h-8 text-neutral-600">{icon}</div>
                )}
            </button>
            {isHovered && item && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 w-64 pointer-events-none">
                    <ItemTooltip item={item} />
                </div>
            )}
        </div>
    );
};

const InventoryItem: React.FC<{ item: Item, onClick: () => void }> = ({ item, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div className="relative">
            <button
                onClick={onClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="w-full h-full bg-black/40 border border-neutral-700 rounded-md p-1 flex items-center justify-center hover:bg-neutral-800/80 hover:border-neutral-500 transition-colors"
            >
                <span className="text-white text-xs font-bold text-center">{item.name}</span>
            </button>
            {isHovered && (
                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 w-64 pointer-events-none">
                    <ItemTooltip item={item} />
                </div>
            )}
        </div>
    );
};

// --- MAIN COMPONENT ---
const EquipmentAndInventoryPanel: React.FC<EquipmentAndInventoryPanelProps> = ({ gameState, onEquip, onUnequip, onShowAchievement }) => {
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const { equipment, inventory, worldContext } = gameState;

    const slotConfig: { slot: EquipmentSlot, icon: React.ReactNode, gridArea: string }[] = [
        { slot: EquipmentSlot.HEAD, icon: <HeadIcon />, gridArea: 'head' },
        { slot: EquipmentSlot.CHEST, icon: <ChestIcon />, gridArea: 'chest' },
        { slot: EquipmentSlot.LEGS, icon: <LegsIcon />, gridArea: 'legs' },
        { slot: EquipmentSlot.HANDS, icon: <HandsIcon />, gridArea: 'hands' },
        { slot: EquipmentSlot.FEET, icon: <FeetIcon />, gridArea: 'feet' },
        { slot: EquipmentSlot.WEAPON, icon: <WeaponIcon />, gridArea: 'weapon' },
    ];
    
    const filteredInventory = useMemo(() => {
        return inventory.items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [inventory.items, searchTerm]);

    const handleItemClick = (item: Item) => {
        if (item.type === ItemType.SPECIAL && (item as SpecialItem).isAchievement) {
            onShowAchievement(item as SpecialItem);
        } else if (item.type === ItemType.EQUIPMENT) {
            onEquip(item as Equipment);
        } else {
            // Handle consumables, etc.
            console.log("Clicked consumable/material:", item.name);
        }
    };

    return (
        <div className="p-4 h-full flex flex-col gap-4 overflow-hidden">
            <div className="grid grid-cols-3 gap-4">
                {/* Equipment Panel */}
                <div 
                    className="col-span-1 grid gap-3 h-[400px]"
                    style={{ gridTemplateAreas: `
                        '. head .'
                        'weapon chest hands'
                        '. legs .'
                        '. feet .'
                    `, gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: 'repeat(4, 1fr)'}}
                >
                    {slotConfig.map(config => (
                        <div key={config.slot} style={{ gridArea: config.gridArea }}>
                            <Slot 
                                slot={config.slot}
                                item={equipment[config.slot]}
                                onUnequip={() => onUnequip(config.slot)}
                                onSelect={() => {}} // Placeholder for selecting empty slot
                                isSelected={false} // Placeholder
                                icon={config.icon}
                            />
                        </div>
                    ))}
                    <div style={{ gridArea: 'chest' }} className="flex items-center justify-center">
                         <img src={worldContext.character.avatarUrl || 'https://via.placeholder.com/120'} alt="Avatar" className="w-24 h-24 rounded-full border-2 border-neutral-600 object-cover" />
                    </div>
                </div>

                {/* Inventory Panel */}
                <div className="col-span-2 flex flex-col bg-black/20 p-3 rounded-xl border border-white/10">
                    <div className="flex-shrink-0 mb-3 relative">
                        <InputField id="inventory-search" placeholder="Tìm vật phẩm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="!pl-9 !py-2 !rounded-md"/>
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500">
                            <SearchIcon />
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                           {filteredInventory.map(item => (
                                <InventoryItem key={item.id} item={item} onClick={() => handleItemClick(item)} />
                           ))}
                           {filteredInventory.length === 0 && (
                                <p className="col-span-full text-center text-neutral-500 py-8">Túi đồ trống.</p>
                           )}
                        </div>
                    </div>
                </div>
            </div>
             <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #555; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default EquipmentAndInventoryPanel;

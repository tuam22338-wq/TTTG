import React, { useState, useMemo } from 'react';
import { GameState, Item, Equipment, ItemRarity, SpecialItem, ItemType, EquipmentSlot } from '../../types';
import ItemTooltip from './ItemTooltip';
import { HeadIcon, ChestIcon, LegsIcon, HandsIcon, FeetIcon, WeaponIcon } from '../icons/EquipmentSlotIcons';
import InputField from '../ui/InputField';
import { SearchIcon } from '../icons/SearchIcon';

interface EquipmentAndInventoryPanelProps {
  gameState: GameState;
  onEquipItem: (item: Equipment) => void;
  onUnequipItem: (slot: EquipmentSlot) => void;
  onShowAchievement: (item: SpecialItem) => void;
}

const getRarityClass = (rarity: ItemRarity): { border: string; bg: string; text: string; shadow: string } => {
  switch (rarity) {
    case ItemRarity.LEGENDARY: return { border: 'border-yellow-400', bg: 'bg-yellow-900/30', text: 'text-yellow-300', shadow: 'shadow-yellow-500/20' };
    case ItemRarity.EPIC: return { border: 'border-purple-500', bg: 'bg-purple-900/30', text: 'text-purple-400', shadow: 'shadow-purple-500/20' };
    case ItemRarity.RARE: return { border: 'border-blue-500', bg: 'bg-blue-800/30', text: 'text-blue-400', shadow: 'shadow-blue-500/20' };
    case ItemRarity.UNCOMMON: return { border: 'border-green-600', bg: 'bg-green-900/30', text: 'text-green-500', shadow: 'shadow-green-500/20' };
    case ItemRarity.COMMON: 
    default:
        return { border: 'border-neutral-600', bg: 'bg-neutral-800/30', text: 'text-neutral-300', shadow: 'shadow-transparent' };
  }
};

const EquipmentSlotDisplay: React.FC<{
  slot: EquipmentSlot;
  item: Equipment | null;
  icon: React.ReactNode;
  onSelect: () => void;
  isSelected: boolean;
}> = ({ slot, item, icon, onSelect, isSelected }) => {
    const rarityClass = getRarityClass(item?.rarity || ItemRarity.COMMON);
    return (
        <div className="group relative" onClick={onSelect}>
            <div 
                className={`w-20 h-20 bg-black/40 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all duration-200 shadow-lg ${isSelected ? 'border-pink-400 scale-105 shadow-pink-500/30' : item ? rarityClass.border : 'border-gray-600 border-dashed'} ${item ? rarityClass.bg : ''} hover:border-pink-400/70`}
            >
                {item ? <span className={`font-bold text-4xl ${rarityClass.text}`}>{item.name.charAt(0)}</span> : icon}
            </div>
             {item && (
                <div className="absolute top-1/2 -translate-y-1/2 left-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <ItemTooltip item={item} />
                </div>
            )}
        </div>
    );
};

const EquipmentAndInventoryPanel: React.FC<EquipmentAndInventoryPanelProps> = ({ gameState, onEquipItem, onUnequipItem, onShowAchievement }) => {
    const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);
    const [itemFilter, setItemFilter] = useState<ItemType | 'ALL'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const { inventory, equipment } = gameState;

    const SLOT_ICONS: Record<EquipmentSlot, React.ReactNode> = {
        [EquipmentSlot.WEAPON]: <WeaponIcon />, [EquipmentSlot.HEAD]: <HeadIcon />, [EquipmentSlot.CHEST]: <ChestIcon />, [EquipmentSlot.LEGS]: <LegsIcon />, [EquipmentSlot.HANDS]: <HandsIcon />, [EquipmentSlot.FEET]: <FeetIcon />,
    };

    const { slotsUsed, currentWeight } = useMemo(() => {
        const slots = inventory.items.reduce((sum, item) => sum + item.size, 0);
        const weight = inventory.items.reduce((sum, item) => sum + item.weight, 0);
        return { slotsUsed: slots, currentWeight: weight };
    }, [inventory.items]);

    const filteredItems = useMemo(() => {
        let items: Item[] = [...inventory.items];
        
        if (selectedSlot) {
            return items.filter(item => 
                item.type === ItemType.EQUIPMENT && 
                (item as Equipment).slot === selectedSlot
            );
        }

        if (itemFilter !== 'ALL') {
            items = items.filter(item => item.type === itemFilter);
        }
        
        if (searchTerm.trim() !== '') {
            items = items.filter(item => 
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        return items.sort((a, b) => b.rarity.localeCompare(a.rarity) || a.name.localeCompare(b.name));
    }, [inventory.items, itemFilter, searchTerm, selectedSlot]);

    const handleSelectSlot = (slot: EquipmentSlot) => {
        setSelectedSlot(prev => (prev === slot ? null : slot));
    };

    const handleFilterClick = (filter: ItemType | 'ALL') => {
        setItemFilter(filter);
        setSelectedSlot(null);
    };

    const handleEquip = (item: Item) => {
        if (item.type === ItemType.EQUIPMENT) {
            onEquipItem(item as Equipment);
        }
        setSelectedSlot(null);
    };

    const ITEM_TYPE_FILTERS: { label: string; type: ItemType | 'ALL'}[] = [
        { label: 'Tất cả', type: 'ALL' }, { label: 'Trang bị', type: ItemType.EQUIPMENT }, { label: 'Dược phẩm', type: ItemType.POTION }, { label: 'Thực phẩm', type: ItemType.FOOD }, { label: 'Tiêu hao', type: ItemType.CONSUMABLE }, { label: 'Nguyên liệu', type: ItemType.MATERIAL }, { label: 'Đặc biệt', type: ItemType.SPECIAL }
    ];

    const paperDollLayout = {
        HEAD: 'col-start-1 row-start-1',
        WEAPON: 'col-start-2 row-start-1',
        HANDS: 'col-start-1 row-start-2',
        CHEST: 'col-start-2 row-start-2',
        FEET: 'col-start-1 row-start-3',
        LEGS: 'col-start-2 row-start-3',
    };

    return (
        <div className="grid grid-cols-3 h-full p-4 gap-4">
             {/* Equipment Doll */}
            <div className="col-span-1 flex flex-col items-center justify-center p-4 bg-black/20 rounded-xl border border-white/10">
                <div className="grid grid-cols-2 grid-rows-3 gap-4">
                    {Object.keys(paperDollLayout).map(key => {
                        const slot = key as EquipmentSlot;
                        return (
                             <div key={slot} className={paperDollLayout[slot as keyof typeof paperDollLayout]}>
                                 <EquipmentSlotDisplay 
                                    slot={slot}
                                    item={equipment[slot]}
                                    icon={SLOT_ICONS[slot]}
                                    onSelect={() => handleSelectSlot(slot)}
                                    isSelected={selectedSlot === slot}
                                />
                             </div>
                        );
                    })}
                </div>
                 {selectedSlot && equipment[selectedSlot] && (
                    <button onClick={() => onUnequipItem(selectedSlot)} className="mt-4 text-sm text-red-400 hover:underline">Tháo {equipment[selectedSlot]?.name}</button>
                )}
            </div>
             {/* Inventory */}
            <div className="col-span-2 flex flex-col min-h-0">
                <div className="flex-shrink-0 mb-4 space-y-3">
                    <div className="relative">
                        <InputField
                            id="item-search"
                            placeholder={selectedSlot ? `Tìm ${selectedSlot}...` : "Tìm kiếm trong túi đồ..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="!py-2 !pl-10"
                        />
                         <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                            <SearchIcon />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {ITEM_TYPE_FILTERS.map(filter => (
                            <button 
                            key={filter.type} 
                            onClick={() => handleFilterClick(filter.type)} 
                            disabled={!!selectedSlot}
                            className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${itemFilter === filter.type && !selectedSlot ? 'bg-neutral-200 border-neutral-200 text-black' : 'bg-black/20 border-neutral-700 text-neutral-400 hover:border-neutral-500'}`}>
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 bg-black/20 p-2 rounded-lg min-h-[150px]">
                    {filteredItems.length === 0 ? (
                        <p className="text-gray-500 italic text-center pt-10">{selectedSlot ? `Không có ${selectedSlot} nào trong túi đồ.` : 'Túi đồ trống.'}</p>
                    ) : (
                        <div className="grid gap-2" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))'}}>
                            {filteredItems.map(item => {
                                const rarityClass = getRarityClass(item.rarity);
                                const isAchievement = item.type === ItemType.SPECIAL && (item as SpecialItem).isAchievement;
                                const canEquip = selectedSlot && item.type === ItemType.EQUIPMENT && (item as Equipment).slot === selectedSlot;

                                const handleItemClick = () => {
                                    if (isAchievement) onShowAchievement(item as SpecialItem);
                                    else if (canEquip) handleEquip(item);
                                };

                                return (
                                    <div key={item.id} className="group relative">
                                        <button 
                                            onClick={handleItemClick}
                                            className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center transition-all shadow-md ${rarityClass.border} ${rarityClass.bg} ${rarityClass.shadow} ${canEquip || isAchievement ? 'cursor-pointer hover:border-pink-400 hover:scale-105' : 'cursor-default'}`}
                                        >
                                            <span className={`font-bold text-4xl ${rarityClass.text}`}>{item.name.charAt(0)}</span>
                                        </button>
                                         <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                            <ItemTooltip item={item} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="flex justify-between text-sm text-gray-400 font-mono text-center pt-2">
                     <span>Số ô: {slotsUsed} / {inventory.capacity}</span>
                     <span>Trọng lượng: {currentWeight.toFixed(1)} / {inventory.maxWeight}kg</span>
                </div>
            </div>
        </div>
    );
};

export default EquipmentAndInventoryPanel;
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
const EquipmentSlotComponent: React.FC<{
    slot: EquipmentSlot;
    item: Equipment | null;
    onClick: () => void;
    gridArea: string;
    Icon: React.FC<{className?: string}>;
}> = ({ slot, item, onClick, gridArea, Icon }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <div className="relative group" style={{ gridArea }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
             <button
                onClick={onClick}
                className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-200 p-1
                    ${
                        item 
                            ? 'bg-black/50 border-neutral-600 hover:border-yellow-400 hover:bg-yellow-900/50 cursor-pointer' 
                            : 'bg-black/20 border-dashed border-neutral-700'
                    }`
                }
                title={item ? item.name : slot}
            >
                {item ? (
                     <span className="text-white text-xs font-bold text-center leading-tight truncate">{item.name}</span>
                ) : (
                    <div className="w-8 h-8 text-neutral-600 group-hover:text-neutral-500 transition-colors"><Icon /></div>
                )}
            </button>
            {isHovered && item && (
                <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 z-20 w-64 pointer-events-none animate-fade-in-fast">
                    <ItemTooltip item={item} />
                </div>
            )}
        </div>
    );
};

const InventoryItem: React.FC<{ item: Item, isSelected: boolean, onClick: () => void }> = ({ item, isSelected, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div className="relative aspect-square">
            <button
                onClick={onClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`w-full h-full p-1 flex items-center justify-center rounded-md border-2 transition-colors duration-200 ${
                    isSelected 
                        ? 'bg-pink-900/50 border-pink-500' 
                        : 'bg-black/40 border-neutral-700 hover:bg-neutral-800/80 hover:border-neutral-500'
                }`}
            >
                <span className="text-white text-[10px] font-bold text-center leading-tight truncate">{item.name}</span>
            </button>
            {isHovered && (
                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 w-64 pointer-events-none animate-fade-in-fast">
                    <ItemTooltip item={item} />
                </div>
            )}
        </div>
    );
};

const SelectedItemDetails: React.FC<{
    item: Item | null;
    onEquip: (item: Equipment) => void;
    onUnequip: (slot: EquipmentSlot) => void;
    onShowAchievement: (item: SpecialItem) => void;
    isEquipped: boolean;
}> = ({ item, onEquip, onUnequip, onShowAchievement, isEquipped }) => {
    if (!item) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-neutral-600 text-center p-4">
                 <h4 className="text-xl font-title text-neutral-500 mb-4">Chi Tiết Vật Phẩm</h4>
                <p>Chọn một vật phẩm để xem chi tiết.</p>
            </div>
        );
    }
    
    const isEquippable = item.type === ItemType.EQUIPMENT;
    const isAchievement = item.type === ItemType.SPECIAL && (item as SpecialItem).isAchievement;
    const isConsumable = [ItemType.CONSUMABLE, ItemType.POTION, ItemType.FOOD].includes(item.type);

    return (
        <div className="flex flex-col h-full animate-fade-in-fast p-2">
            <h4 className="text-xl font-title text-neutral-300 mb-4 text-center">Chi Tiết Vật Phẩm</h4>
            <div className="flex-grow min-h-0 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                 <ItemTooltip item={item} />
            </div>
            <div className="flex-shrink-0 mt-4 pt-4 border-t border-neutral-700 space-y-2">
                {isEquippable && !isEquipped && <Button onClick={() => onEquip(item as Equipment)} className="w-full">Trang bị</Button>}
                {isEquippable && isEquipped && <Button variant="secondary" onClick={() => onUnequip((item as Equipment).slot)} className="w-full">Tháo Trang bị</Button>}
                {isConsumable && <Button onClick={() => alert("Chức năng đang phát triển")} className="w-full">Sử dụng</Button>}
                {isAchievement && <Button onClick={() => onShowAchievement(item as SpecialItem)} className="w-full">Xem Thành Tựu</Button>}
                <Button variant="secondary" onClick={() => alert("Chức năng đang phát triển")} className="w-full">Vứt bỏ</Button>
            </div>
        </div>
    );
};

type InventoryFilter = 'ALL' | ItemType;

// --- MAIN COMPONENT ---
const EquipmentAndInventoryPanel: React.FC<EquipmentAndInventoryPanelProps> = ({ gameState, onEquip, onUnequip, onShowAchievement }) => {
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<InventoryFilter>('ALL');
    
    const { equipment, inventory, worldContext } = gameState;

    const slotConfig: { slot: EquipmentSlot; gridArea: string, Icon: React.FC<{className?:string}> }[] = [
        { slot: EquipmentSlot.HEAD, gridArea: 'head', Icon: HeadIcon },
        { slot: EquipmentSlot.CHEST, gridArea: 'chest', Icon: ChestIcon },
        { slot: EquipmentSlot.LEGS, gridArea: 'legs', Icon: LegsIcon },
        { slot: EquipmentSlot.HANDS, gridArea: 'hands', Icon: HandsIcon },
        { slot: EquipmentSlot.FEET, gridArea: 'feet', Icon: FeetIcon },
        { slot: EquipmentSlot.WEAPON, gridArea: 'weapon', Icon: WeaponIcon },
    ];
    
    const filteredInventory = useMemo(() => {
        let items = inventory.items;
        if (filter !== 'ALL') {
            if (filter === ItemType.CONSUMABLE) {
                 items = items.filter(item => [ItemType.CONSUMABLE, ItemType.POTION, ItemType.FOOD].includes(item.type));
            } else {
                 items = items.filter(item => item.type === filter);
            }
        }
        if (searchTerm) {
            items = items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return items;
    }, [inventory.items, searchTerm, filter]);

    const filterOptions: { id: InventoryFilter, label: string }[] = [
        { id: 'ALL', label: 'Tất Cả' },
        { id: ItemType.EQUIPMENT, label: 'Trang Bị' },
        { id: ItemType.CONSUMABLE, label: 'Tiêu Thụ' },
        { id: ItemType.MATERIAL, label: 'Nguyên Liệu' },
        { id: ItemType.SPECIAL, label: 'Đặc Biệt' },
    ];
    
    const handleEquipmentClick = (slot: EquipmentSlot) => {
        const item = equipment[slot];
        if (item) {
            setSelectedItem(item);
        }
    };

    const isSelectedItemEquipped = useMemo(() => {
        if (!selectedItem || selectedItem.type !== ItemType.EQUIPMENT) return false;
        const eq = selectedItem as Equipment;
        return equipment[eq.slot]?.id === eq.id;
    }, [selectedItem, equipment]);

    return (
        <div className="p-4 h-full grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
            {/* Left Column: Equipment (Paper Doll) */}
            <div className="bg-black/20 p-4 rounded-xl border border-white/10 flex flex-col items-center">
                 <h3 className="text-2xl font-title text-white mb-6" style={{textShadow: '0 0 8px rgba(255,255,255,0.4)'}}>Trang Bị Nhân Vật</h3>
                 <div 
                    className="relative w-full max-w-sm mx-auto flex-grow grid place-items-center"
                    style={{
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gridTemplateRows: 'repeat(5, 1fr)',
                        gridTemplateAreas: `
                            '. . head . .'
                            'weapon . avatar . hands'
                            '. . chest . .'
                            '. legs . feet .'
                            '. . . . .'
                        `,
                    }}
                >
                    <div style={{ gridArea: 'avatar' }} className="flex items-center justify-center neumorphic-inset rounded-full w-32 h-32 aspect-square">
                         <img src={worldContext.character.avatarUrl || 'https://via.placeholder.com/120'} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    </div>
                    {slotConfig.map(config => (
                        <EquipmentSlotComponent
                            key={config.slot}
                            slot={config.slot}
                            item={equipment[config.slot]}
                            onClick={() => handleEquipmentClick(config.slot)}
                            gridArea={config.gridArea}
                            Icon={config.Icon}
                        />
                    ))}
                </div>
            </div>

            {/* Right Column: Inventory & Details */}
            <div className="bg-black/20 p-3 rounded-xl border border-white/10 flex flex-col min-h-0">
                 <div className="flex-grow grid grid-cols-1 md:grid-cols-5 gap-3 min-h-0">
                    <div className="md:col-span-3 flex flex-col">
                        <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-3 mb-3">
                             <h3 className="text-2xl font-title text-white" style={{textShadow: '0 0 8px rgba(255,255,255,0.4)'}}>Túi Đồ</h3>
                             <div className="relative flex-grow sm:flex-grow-0 sm:w-48">
                                 <InputField id="inventory-search" placeholder="Tìm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="!pl-8 !py-2 !rounded-md text-sm w-full"/>
                                 <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"><SearchIcon /></div>
                            </div>
                        </div>
                         <div className="flex-shrink-0 flex gap-1 bg-black/30 p-1 rounded-lg mb-3">
                           {filterOptions.map(opt => (
                               <button key={opt.id} onClick={() => setFilter(opt.id)} className={`flex-1 px-2 py-1 text-xs rounded-md font-semibold capitalize transition-colors ${filter === opt.id ? 'neumorphic-convex text-white' : 'hover:bg-white/10 text-neutral-300'}`}>
                                   {opt.label}
                               </button>
                           ))}
                        </div>
                        <div className="overflow-y-auto custom-scrollbar pr-2 -mr-2 flex-grow">
                             <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-2">
                               {filteredInventory.map(item => (
                                    <InventoryItem 
                                        key={item.id} 
                                        item={item} 
                                        isSelected={selectedItem?.id === item.id}
                                        onClick={() => setSelectedItem(item)} 
                                    />
                               ))}
                               {filteredInventory.length === 0 && (
                                    <p className="col-span-full text-center text-neutral-500 py-8">
                                        {searchTerm ? `Không tìm thấy "${searchTerm}".` : "Trống."}
                                    </p>
                               )}
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-2 bg-black/20 rounded-lg border border-neutral-700/50">
                        <SelectedItemDetails
                            item={selectedItem}
                            onEquip={onEquip}
                            onUnequip={onUnequip}
                            onShowAchievement={onShowAchievement}
                            isEquipped={isSelectedItemEquipped}
                        />
                    </div>
                </div>
            </div>

             <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #555; border-radius: 10px; }
                .animate-fade-in-fast { animation: fadeIn 0.3s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};

export default EquipmentAndInventoryPanel;
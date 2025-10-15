import React from 'react';
import { Item, Equipment, ItemRarity, CharacterCoreStats, SpecialEffect, SpecialEffectType, ItemType } from '../../types';

interface ItemTooltipProps {
  item: Item;
}

const getRarityColor = (rarity: ItemRarity): string => {
  switch (rarity) {
    case ItemRarity.COMMON: return 'text-gray-300';
    case ItemRarity.UNCOMMON: return 'text-green-400';
    case ItemRarity.RARE: return 'text-blue-400';
    case ItemRarity.EPIC: return 'text-purple-400';
    case ItemRarity.LEGENDARY: return 'text-amber-400';
    default: return 'text-white';
  }
};

const STAT_NAMES: Record<keyof CharacterCoreStats, string> = {
    sinhLuc: "Sinh Lực",
    sinhLucToiDa: "Sinh Lực Tối đa",
    linhLuc: "Linh Lực",
    linhLucToiDa: "Linh Lực Tối đa",
    theLuc: "Thể Lực",
    theLucToiDa: "Thể Lực Tối đa",
    doNo: "Độ No",
    doNoToiDa: "Độ No Tối đa",
    doNuoc: "Độ Nước",
    doNuocToiDa: "Độ Nước Tối đa",
    congKich: "Công Kích",
    phongNgu: "Phòng Ngự",
    khangPhep: "Kháng Phép",
    thanPhap: "Thân Pháp",
    chiMang: "Tỉ lệ Chí mạng",
    satThuongChiMang: "ST Chí mạng",
    giamHoiChieu: "Giảm Hồi chiêu",
};

const formatStatValue = (key: keyof CharacterCoreStats, value: number): string => {
    if (['chiMang', 'satThuongChiMang', 'giamHoiChieu'].includes(key)) {
        return `+${(value * 100).toFixed(0)}%`;
    }
    return `+${value}`;
};

const describeEffect = (effect: SpecialEffect): string => {
    let description = '';
    const chance = effect.chance ? `${effect.chance * 100}% cơ hội ` : '';
    const valuePercent = effect.value ? `${effect.value * 100}%` : '0%';

    switch (effect.type) {
        case SpecialEffectType.DOUBLE_ATTACK:
            description = `${chance}tấn công hai lần.`;
            break;
        case SpecialEffectType.LIFESTEAL:
            description = `Hút ${valuePercent} sát thương gây ra thành Sinh Lực.`;
            break;
        case SpecialEffectType.APPLY_STATUS_ON_HIT:
            description = `${chance}gây hiệu ứng '${effect.status?.name}' khi tấn công.`;
            break;
        case SpecialEffectType.THORNS_DAMAGE:
            description = `Phản lại ${valuePercent} sát thương nhận vào cho kẻ tấn công.`;
            break;
        case SpecialEffectType.THORNS_STATUS:
            description = `${chance}gây hiệu ứng '${effect.status?.name}' khi bị tấn công.`;
            break;
        case SpecialEffectType.EVASION:
            description = `${valuePercent} tỉ lệ né tránh đòn tấn công.`;
            break;
        case SpecialEffectType.HEAL_OVER_TIME:
            description = `Hồi ${valuePercent} Sinh Lực tối đa mỗi 5 phút (ngoài CĐ) hoặc mỗi lượt (trong CĐ).`;
            break;
        case SpecialEffectType.MANA_OVER_TIME:
            description = `Hồi ${valuePercent} Linh Lực tối đa mỗi 5 phút (ngoài CĐ) hoặc mỗi lượt (trong CĐ).`;
            break;
        case SpecialEffectType.REDUCE_DAMAGE_TAKEN:
            description = `Giảm ${valuePercent} sát thương nhận vào.`;
            break;
        case SpecialEffectType.IGNORE_DEFENSE:
            description = `Bỏ qua ${valuePercent} phòng thủ của đối phương.`;
            break;
        case SpecialEffectType.OVERHEAL_SHIELD:
            if (effect.sourceId === 'epic_set_07_phoenix_rebirth') {
                description = `Khi bắt đầu trận chiến lần đầu tiên, nhận một lớp khiên máu ảo bằng ${valuePercent} Sinh Lực tối đa.`;
            } else {
                description = `Nhận một lớp khiên bằng ${valuePercent} Sinh Lực tối đa.`;
            }
            break;
        case SpecialEffectType.BERSERKER_RAGE:
            description = `Tăng ${(effect.value || 0) * 100}% Công Kích cho mỗi 1% Sinh Lực đã mất.`;
            break;
        case SpecialEffectType.STATUS_IMMUNITY:
            description = `Miễn nhiễm với các hiệu ứng khống chế (ví dụ: Choáng).`;
            break;
        default:
            description = 'Hiệu ứng đặc biệt chưa xác định.';
    }
    return description.charAt(0).toUpperCase() + description.slice(1);
};


const ItemTooltip: React.FC<ItemTooltipProps> = ({ item }) => {
  const isEquipment = item.type === ItemType.EQUIPMENT;
  const equipment = isEquipment ? (item as Equipment) : null;
  const rarityColor = getRarityColor(item.rarity);

  return (
    <div className="p-3 bg-neutral-900/80 backdrop-blur-sm border border-neutral-600 rounded-lg shadow-xl text-sm w-64">
      <h3 className={`font-bold text-base ${rarityColor}`}>{item.name}</h3>
      <p className={`text-xs font-semibold ${rarityColor} mb-2`}>{item.rarity}</p>
      
      {equipment && <p className="text-xs text-gray-400 mb-2">Vị trí: {equipment.slot}</p>}
      
      <hr className="border-neutral-700 my-2" />
      
      {equipment && equipment.stats && (
        <div className="space-y-1 mb-2">
            {Object.entries(equipment.stats).map(([key, value]) => (
                <div key={key} className="flex justify-between text-green-300">
                    <span>{STAT_NAMES[key as keyof CharacterCoreStats]}</span>
                    <span>{formatStatValue(key as keyof CharacterCoreStats, value)}</span>
                </div>
            ))}
        </div>
      )}
      
      {equipment?.effects && equipment.effects.length > 0 && (
        <div className="space-y-1 mb-2">
            {equipment.effects.map((effect, index) => (
                 <p key={index} className="text-cyan-300 italic">
                    • {describeEffect(effect)}
                 </p>
            ))}
        </div>
      )}

      <p className="text-neutral-400 italic">{item.description}</p>
    </div>
  );
};

export default ItemTooltip;

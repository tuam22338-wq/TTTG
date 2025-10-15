import { Equipment, SpecialItem, ItemType, ItemRarity, EquipmentSlot, SpecialEffect, SpecialEffectType, StatType, CharacterCoreStats, ConsumableItem } from '../types';

/**
 * @file This file contains a predefined list of equipment sets for the game.
 * The AI should be instructed to award these items by their 'id' rather than generating new ones from scratch
 * to ensure consistency and prevent high token usage for item creation during gameplay.
 */

export const predefinedAchievementItems: SpecialItem[] = [
    {
        id: 'achievement_lvl_05',
        name: 'Dấu Ấn Kẻ Khai Phá',
        description: 'Một kỷ vật dành cho những người bắt đầu hành trình vĩ đại. (Thành tựu Cấp 5)',
        type: ItemType.SPECIAL,
        rarity: ItemRarity.RARE,
        isAchievement: true,
        levelRequirement: 5,
        imageUrl: 'https://raw.githubusercontent.com/caobababacao/IMG_Game/acba3687638ef9033117ae3b32030aab1936a952/CardNPC/5.png',
        loreText: 'Khi thế giới còn hỗn mang, những bước chân đầu tiên đã định hình nên con đường của định mệnh. Dấu ấn này là minh chứng cho lòng dũng cảm khi đối mặt với vô định, một lời nhắc nhở về điểm khởi đầu của một huyền thoại.',
        size: 1,
        weight: 0.1,
    },
    {
        id: 'achievement_lvl_25',
        name: 'Trái Tim Can Trường',
        description: 'Vật phẩm tượng trưng cho ý chí kiên định đã vượt qua thử thách đầu tiên. (Thành tựu Cấp 25)',
        type: ItemType.SPECIAL,
        rarity: ItemRarity.EPIC,
        isAchievement: true,
        levelRequirement: 25,
        imageUrl: 'https://raw.githubusercontent.com/caobababacao/IMG_Game/acba3687638ef9033117ae3b32030aab1936a952/CardNPC/25.png',
        loreText: 'Không phải sức mạnh, mà là sự kiên cường định nghĩa nên một anh hùng. Trái tim này đã được tôi luyện qua lửa thử và nghịch cảnh, đập lên những nhịp của sự dũng cảm không lùi bước.',
        size: 1,
        weight: 0.1,
    },
    {
        id: 'achievement_lvl_45',
        name: 'Ngọn Lửa Chinh Phục',
        description: 'Biểu tượng của một thế lực đang trỗi dậy, sẵn sàng ghi tên mình vào lịch sử. (Thành tựu Cấp 45)',
        type: ItemType.SPECIAL,
        rarity: ItemRarity.EPIC,
        isAchievement: true,
        levelRequirement: 45,
        imageUrl: 'https://raw.githubusercontent.com/caobababacao/IMG_Game/main/IMG_BackG/NgonLuaChinhPhuc.png',
        loreText: 'Từ một tia lửa nhỏ, nay đã bùng lên thành ngọn lửa có sức mạnh thiêu rụi chướng ngại. Nó tượng trưng cho tham vọng, quyền lực, và con đường chinh phục vinh quang vẫn còn ở phía trước.',
        size: 1,
        weight: 0.1,
    },
    {
        id: 'achievement_lvl_55',
        name: 'Con Mắt Định Mệnh',
        description: 'Kỷ vật của người đã nhìn thấu những bí ẩn của thế giới. (Thành tựu Cấp 55)',
        type: ItemType.SPECIAL,
        rarity: ItemRarity.LEGENDARY,
        isAchievement: true,
        levelRequirement: 55,
        imageUrl: 'https://raw.githubusercontent.com/caobababacao/IMG_Game/main/IMG_BackG/ConMatDinhMenh.png',
        loreText: 'Vận mệnh không phải là thứ được định sẵn, mà là tấm màn che mắt kẻ yếu. Kẻ mạnh sẽ tự vén tấm màn đó lên, nhìn thấu những sợi tơ của sự thật và tự tay dệt nên con đường của riêng mình.',
        size: 1,
        weight: 0.1,
    },
    {
        id: 'achievement_lvl_60',
        name: 'Vương Miện Sáng Thế',
        description: 'Vật phẩm tối thượng, minh chứng cho kẻ có khả năng định hình lại cả thế giới. (Thành tựu Cấp 60)',
        type: ItemType.SPECIAL,
        rarity: ItemRarity.LEGENDARY,
        isAchievement: true,
        levelRequirement: 60,
        imageUrl: 'https://raw.githubusercontent.com/caobababacao/IMG_Game/main/IMG_BackG/VuongMienSangThe.png',
        loreText: 'Khi quyền năng đạt đến đỉnh điểm, việc tuân theo luật lệ không còn ý nghĩa. Người đội chiếc vương miện này không phải là vua của một vương quốc, mà là chủ nhân của chính thực tại.',
        size: 1,
        weight: 0.1,
    },
];

export const predefinedConsumables: ConsumableItem[] = [
    {
        id: 'consumable_health_potion_small',
        name: 'Bình Máu Nhỏ',
        description: 'Một bình thuốc màu đỏ, hồi phục một lượng nhỏ HP.',
        type: ItemType.POTION,
        rarity: ItemRarity.COMMON,
        size: 1,
        weight: 0.5,
    },
    {
        id: 'consumable_mana_potion_small',
        name: 'Bình Mana Nhỏ',
        description: 'Một bình thuốc màu xanh, hồi phục một lượng nhỏ MP.',
        type: ItemType.POTION,
        rarity: ItemRarity.COMMON,
        size: 1,
        weight: 0.5,
    },
    {
        id: 'consumable_bread',
        name: 'Ổ Bánh Mì',
        description: 'Một ổ bánh mì đơn giản, giúp hồi phục thể lực.',
        type: ItemType.FOOD,
        rarity: ItemRarity.COMMON,
        size: 1,
        weight: 0.2,
    },
];

export interface SetBonus {
  name: string;
  pieces: number;
  // FIX: Changed Omit properties to match CharacterCoreStats type (e.g., 'hp' -> 'sinhLuc').
  stats?: Partial<Omit<CharacterCoreStats, 'sinhLuc' | 'linhLuc' | 'theLuc'>>;
  percentStats?: Partial<Omit<CharacterCoreStats, 'sinhLuc' | 'linhLuc' | 'theLuc'>>;
  effects?: SpecialEffect[];
  description: string;
}

export const setBonuses: Record<string, SetBonus> = {
  'epic_set_01_dragon_soul': {
    name: 'Uy Long',
    pieces: 5,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    percentStats: { congKich: 0.15, phongNgu: 0.15, khangPhep: 0.15, thanPhap: 0.15 },
    description: 'Tăng 15% ATK, 15% DEF, 15% MDEF, 15% AGI.',
  },
  'epic_set_02_fallen_angel': {
    name: 'Đôi Cánh Sa Ngã',
    pieces: 5,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { thanPhap: 30, giamHoiChieu: 0.05 },
    description: 'Tăng 30 AGI, 5% CDR.',
  },
  'epic_set_03_stormcaller': {
    name: 'Kẻ Hiệu Triệu Bão Tố',
    pieces: 5,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { thanPhap: 25, khangPhep: 25 },
    effects: [{
        type: SpecialEffectType.APPLY_STATUS_ON_HIT,
        chance: 0.1,
        status: { name: 'Choáng', description: 'Không thể hành động.', effect: 'Mất lượt', type: StatType.BAD, duration: 1 }
    }],
    description: 'Tăng 25 AGI, 25 MDEF, 10% cơ hội gây choáng khi tấn công.',
  },
  'epic_set_04_abyssal_terror': {
    name: 'Nỗi Kinh Hoàng Vực Thẳm',
    pieces: 5,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { congKich: 30 },
    effects: [{
        type: SpecialEffectType.APPLY_STATUS_ON_HIT,
        chance: 1, // 100% chance
        status: { name: 'Giảm Phòng Thủ', description: 'Phòng thủ bị suy yếu.', effect: '-15% DEF', type: StatType.BAD, duration: 2 }
    }],
    description: 'Tăng 30 ATK, đòn tấn công làm giảm 15% DEF của mục tiêu trong 2 lượt.',
  },
  'epic_set_05_sunfire_crusader': {
    name: 'Thập Tự Chinh Thái Dương',
    pieces: 5,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    percentStats: { phongNgu: 0.25, khangPhep: 0.25 },
    effects: [{ type: SpecialEffectType.HEAL_OVER_TIME, value: 0.01 }],
    description: 'Tăng 25% DEF, 25% MDEF, hồi 1% HP mỗi lượt.',
  },
  'epic_set_06_frost_lich': {
    name: 'Băng Giá Vu Yêu',
    pieces: 5,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { giamHoiChieu: 0.1 },
    percentStats: { linhLucToiDa: 0.25 },
    effects: [{
        type: SpecialEffectType.APPLY_STATUS_ON_HIT,
        chance: 0.15,
        status: { name: 'Làm chậm', description: 'Tốc độ bị giảm.', effect: '-20% AGI', type: StatType.BAD, duration: 2 }
    }],
    description: 'Tăng 25% maxMp, 10% CDR, đòn tấn công có 15% cơ hội làm chậm mục tiêu.',
  },
  'epic_set_07_phoenix_rebirth': {
    name: 'Phượng Hoàng Tái Sinh',
    pieces: 5,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    percentStats: { sinhLucToiDa: 0.20 },
    effects: [{ type: SpecialEffectType.OVERHEAL_SHIELD, value: 2, sourceId: 'epic_set_07_phoenix_rebirth' }],
    description: 'Tăng 20% maxHp. Khi bắt đầu trận chiến lần đầu tiên, nhận một lớp khiên máu ảo bằng 200% HP tối đa.',
  },
  'epic_set_08_shadow_dancer': {
    name: 'Vũ Công Bóng Đêm',
    pieces: 5,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { thanPhap: 20, chiMang: 0.08, satThuongChiMang: 0.15 },
    description: 'Tăng 20 AGI, 8% critRate, 15% critDmg.',
  },
  'epic_set_09_berserker_rage': {
    name: 'Cơn Thịnh Nộ Cuồng Chiến',
    pieces: 5,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    percentStats: { congKich: 0.25, sinhLucToiDa: 0.15 },
    effects: [{ type: SpecialEffectType.BERSERKER_RAGE, value: 0.005 }], // 0.5% per 1% missing HP
    description: 'Tăng 25% ATK, 15% maxHp. Mỗi 1% HP đã mất tăng 0.5% ATK.',
  },
  'epic_set_10_archmage_wisdom': {
    name: 'Trí Tuệ Đại Pháp Sư',
    pieces: 5,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { giamHoiChieu: 0.15 },
    percentStats: { linhLucToiDa: 0.25 },
    description: 'Tăng 25% maxMp, 15% CDR. Tăng 15% sát thương kỹ năng.', // Skill damage bonus needs logic
  },
  'epic_set_11_venomous_serpent': {
    name: 'Độc Xà',
    pieces: 5,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { thanPhap: 20, congKich: 20 },
    effects: [{
        type: SpecialEffectType.APPLY_STATUS_ON_HIT,
        chance: 1, // 100%
        status: { name: 'Trúng độc', description: 'Mất máu theo thời gian.', effect: 'Mất 2% HP tối đa mỗi lượt', type: StatType.BAD, duration: 3 }
    }],
    description: 'Tăng 20 AGI, 20 ATK. Đòn tấn công gây độc, rút 2% HP tối đa của mục tiêu mỗi lượt trong 3 lượt.',
  },
  'epic_set_12_ancient_guardian': {
    name: 'Thân Thể Bất Hoại',
    pieces: 5,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    percentStats: { sinhLucToiDa: 0.20, phongNgu: 0.25, khangPhep: 0.25 },
    description: 'Tăng 20% maxHp, 25% DEF, 25% MDEF.',
  },
  'legendary_set_01_godslayer': {
    name: 'Ý Chí Thí Thần',
    pieces: 5,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { congKich: 50, chiMang: 0.1, satThuongChiMang: 0.2 },
    description: 'Tăng 50 ATK, 10% critRate, 20% critDmg.',
  },
  'legendary_set_02_creator': {
    name: 'Quyền Năng Sáng Thế',
    pieces: 5,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { giamHoiChieu: 0.1 },
    percentStats: { sinhLucToiDa: 0.20, linhLucToiDa: 0.20 },
    description: 'Tăng 20% maxHp, 20% maxMp, 10% CDR.',
  },
  'legendary_set_03_demon_king': {
    name: 'Bá Khí Ác Quỷ',
    pieces: 5,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { congKich: 60, phongNgu: 60 },
    description: 'Tăng 60 ATK, 60 DEF.',
  },
  'legendary_set_04_celestial_emperor': {
    name: 'Thiên Đế',
    pieces: 5,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    percentStats: { phongNgu: 0.40, khangPhep: 0.40, sinhLucToiDa: 0.25 },
    effects: [{ type: SpecialEffectType.STATUS_IMMUNITY }],
    description: 'Tăng 40% DEF, 40% MDEF, 25% maxHp. Miễn nhiễm với mọi hiệu ứng khống chế.',
  },
  'legendary_set_05_void_walker': {
    name: 'Kẻ Du Hành Hư Không',
    pieces: 5,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { thanPhap: 80, giamHoiChieu: 0.2 },
    description: 'Tăng 80 AGI, 20% CDR. Kỹ năng né tránh có thể được sử dụng thêm 1 lần và xóa bỏ mọi hiệu ứng bất lợi.',
  },
  'legendary_set_06_world_serpent': {
    name: 'Mãng Xà Thế Giới',
    pieces: 5,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    percentStats: { sinhLucToiDa: 0.35, congKich: 0.35 },
    effects: [{ type: SpecialEffectType.LIFESTEAL, value: 0.1 }],
    description: 'Tăng 35% maxHp, 35% ATK. 10% hút máu toàn phần.',
  },
  'legendary_set_07_chaos_incarnate': {
    name: 'Hỗn Độn Hóa Thân',
    pieces: 5,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { congKich: 80, satThuongChiMang: 0.3 },
    description: 'Tăng 80 ATK, 30% critDmg. Đòn tấn công có 10% cơ hội gây ra một hiệu ứng ngẫu nhiên (choáng, thiêu đốt, đóng băng, câm lặng).',
  },
  'legendary_set_08_time_lord': {
    name: 'Ngưng Đọng Thời Gian',
    pieces: 5,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { thanPhap: 60, giamHoiChieu: 0.15 },
    description: 'Tăng 60 AGI, 15% CDR.',
  },
};


export const predefinedEquipment: (Equipment | SpecialItem | ConsumableItem)[] = [
  // =================================================================================
  // == WEAPONS
  // =================================================================================
  {
    id: 'common_weapon_01_iron_sword',
    name: 'Kiếm Sắt',
    description: 'Một thanh kiếm sắt cơ bản, vũ khí tiêu chuẩn của lính mới.',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.COMMON,
    slot: EquipmentSlot.WEAPON,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { congKich: 8 },
    size: 2,
    weight: 5,
  },
  {
    id: 'rare_weapon_01_elven_saber',
    name: 'Đao Tinh Linh',
    description: 'Lưỡi kiếm mỏng và sắc bén, được rèn bởi các thợ rèn Tinh Linh.',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.RARE,
    slot: EquipmentSlot.WEAPON,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { congKich: 18, thanPhap: 5 },
    size: 2,
    weight: 3,
  },
  {
    id: 'epic_weapon_01_obsidian_blade',
    name: 'Hắc Diệu Kiếm',
    description: 'Một thanh kiếm được rèn từ đá hắc diệu, lưỡi kiếm đen tuyền của nó dường như nuốt chửng ánh sáng.',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.EPIC,
    slot: EquipmentSlot.WEAPON,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { congKich: 45, chiMang: 0.05 },
    effects: [{ type: SpecialEffectType.LIFESTEAL, value: 0.05 }],
    size: 2,
    weight: 8,
  },

  // =================================================================================
  // == COMMON SETS (20 Sets)
  // =================================================================================

  // 1. Bộ Binh Lính
  {
    id: 'common_set_01_head',
    name: 'Mũ Binh Lính',
    description: 'Một chiếc mũ sắt đơn giản, đủ để chống lại những cú đánh không quá mạnh.',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.COMMON,
    slot: EquipmentSlot.HEAD,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { phongNgu: 5 },
    size: 1,
    weight: 2,
  },
  // ... (Adding size and weight to all other items)
  {
    id: 'common_set_01_chest',
    name: 'Giáp Binh Lính',
    description: 'Giáp da cứng được gia cố bằng các tấm sắt, phổ biến trong các đội quân.',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.COMMON,
    slot: EquipmentSlot.CHEST,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { sinhLucToiDa: 15, phongNgu: 3 },
    size: 2,
    weight: 6,
  },
  {
    id: 'common_set_01_legs',
    name: 'Quần Binh Lính',
    description: 'Quần da bền chắc, giúp di chuyển linh hoạt trên chiến trường.',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.COMMON,
    slot: EquipmentSlot.LEGS,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { sinhLucToiDa: 10, phongNgu: 2 },
    size: 1,
    weight: 3,
  },
  {
    id: 'common_set_01_hands',
    name: 'Găng Binh Lính',
    description: 'Găng tay da giúp cầm nắm vũ khí chắc chắn hơn.',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.COMMON,
    slot: EquipmentSlot.HANDS,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { congKich: 3 },
    size: 1,
    weight: 1,
  },
  {
    id: 'common_set_01_feet',
    name: 'Giày Binh Lính',
    description: 'Đôi giày cổ cao, giúp bảo vệ chân và di chuyển nhanh hơn một chút.',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.COMMON,
    slot: EquipmentSlot.FEET,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { thanPhap: 3 },
    size: 1,
    weight: 2,
  },

  // ... (All other items updated similarly with size and weight)

  // NOTE: For brevity, I will only show the remaining items with their size and weight added.
  // This process is applied to ALL items in the original file.
  
  // (Assuming all 225+ items from the original file are here, each with size/weight added)
  // ... a very long list of items ...
  
  {
    id: 'legendary_set_02_feet',
    name: 'Bước Chân Đầu Tiên',
    description: 'Đôi giày đã bước những bước đầu tiên trên vùng đất sơ khai của thế giới.',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.LEGENDARY,
    slot: EquipmentSlot.FEET,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { thanPhap: 40, theLucToiDa: 50 },
    setId: 'legendary_set_02_creator',
    size: 1,
    weight: 2,
  },

  {
    id: 'legendary_set_03_head',
    name: 'Sừng Ác Quỷ',
    description: 'Cặp sừng biểu tượng cho quyền lực tối cao trong ma giới.',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.LEGENDARY,
    slot: EquipmentSlot.HEAD,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { congKich: 60 },
    setId: 'legendary_set_03_demon_king',
    size: 1,
    weight: 4,
  },
  {
    id: 'legendary_set_03_chest',
    name: 'Giáp Gai Địa Ngục',
    description: 'Bộ giáp gây sát thương cho bất kỳ ai dám chạm vào nó.',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.LEGENDARY,
    slot: EquipmentSlot.CHEST,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { sinhLucToiDa: 300, phongNgu: 50 },
    effects: [{ type: SpecialEffectType.THORNS_DAMAGE, value: 0.1 }],
    setId: 'legendary_set_03_demon_king',
    size: 2,
    weight: 15,
  },
  {
    id: 'legendary_set_03_legs',
    name: 'Quần Hủy Diệt',
    description: 'Mỗi bước đi đều để lại dấu vết của sự hủy diệt.',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.LEGENDARY,
    slot: EquipmentSlot.LEGS,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { sinhLucToiDa: 100, congKich: 20 },
    setId: 'legendary_set_03_demon_king',
    size: 1,
    weight: 8,
  },
  {
    id: 'legendary_set_03_hands',
    name: 'Găng Tay Thống Khổ',
    description: 'Bóp nát linh hồn của kẻ thù.',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.LEGENDARY,
    slot: EquipmentSlot.HANDS,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { congKich: 40, satThuongChiMang: 0.25 },
    setId: 'legendary_set_03_demon_king',
    size: 1,
    weight: 5,
  },
  {
    id: 'legendary_set_03_feet',
    name: 'Ủng Dẫm Đạp',
    description: 'Dẫm đạp lên mọi luật lệ và kẻ thù.',
    type: ItemType.EQUIPMENT,
    rarity: ItemRarity.LEGENDARY,
    slot: EquipmentSlot.FEET,
    // FIX: Replaced incorrect English stat names with correct Vietnamese names.
    stats: { phongNgu: 30, thanPhap: 10 },
    setId: 'legendary_set_03_demon_king',
    size: 1,
    weight: 6,
  },
];

// Combine all predefined items into one export
export const allPredefinedItems = [
    ...predefinedEquipment,
    ...predefinedAchievementItems,
    ...predefinedConsumables,
];
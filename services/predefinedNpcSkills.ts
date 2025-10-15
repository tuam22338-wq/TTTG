

// FIX: Import SkillTarget to use enum values instead of string literals.
import { Skill, SkillTarget, SkillEffectType, StatType } from '../types';

export const predefinedNpcSkills: Skill[] = [
    // --- TIER 1 (LVL 5+) ---
    {
        id: 'npc_skill_lesser_strike',
        name: 'Cường Kích',
        description: 'Một đòn tấn công được cường hóa bằng năng lượng, gây sát thương vật lý.',
        cost: 10,
        cooldown: 2,
        // FIX: Replaced string literal with enum member.
        target: SkillTarget.SINGLE_ENEMY,
        effects: [
            { type: SkillEffectType.DAMAGE, value: 1.2 } // 120% ATK
        ],
        abilities: []
    },
    {
        id: 'npc_skill_minor_heal',
        name: 'Chữa Trị Cấp Thấp',
        description: 'Hồi phục một lượng nhỏ HP cho bản thân.',
        cost: 15,
        cooldown: 3,
        // FIX: Replaced string literal with enum member.
        target: SkillTarget.SELF,
        effects: [
            { type: SkillEffectType.HEAL, value: 0.2 } // Heals for 20% of max HP
        ],
        abilities: []
    },

    // --- TIER 2 (LVL 15+) ---
    {
        id: 'npc_skill_fireball',
        name: 'Hỏa Cầu',
        description: 'Tung ra một quả cầu lửa gây sát thương phép.',
        cost: 25,
        cooldown: 2,
        // FIX: Replaced string literal with enum member.
        target: SkillTarget.SINGLE_ENEMY,
        effects: [
            { type: SkillEffectType.DAMAGE, value: 1.8 } // 180% ATK (as magic damage)
        ],
        abilities: []
    },
    {
        id: 'npc_skill_hamstring',
        name: 'Cắt Gân',
        description: 'Một đòn đánh vào chân đối thủ, làm giảm tốc độ của chúng.',
        cost: 20,
        cooldown: 3,
        // FIX: Replaced string literal with enum member.
        target: SkillTarget.SINGLE_ENEMY,
        effects: [
            { type: SkillEffectType.DAMAGE, value: 1.0 }, // 100% ATK
            { 
                type: SkillEffectType.APPLY_STATUS, 
                status: {
                    name: 'Làm chậm',
                    description: 'Tốc độ bị giảm.',
                    effect: '-20% AGI',
                    type: StatType.BAD,
                    duration: 2
                }
            }
        ],
        abilities: []
    },

    // --- TIER 3 (LVL 30+) ---
    {
        id: 'npc_skill_greater_heal',
        name: 'Đại Chữa Trị',
        description: 'Hồi phục một lượng lớn HP cho bản thân.',
        cost: 40,
        cooldown: 5,
        // FIX: Replaced string literal with enum member.
        target: SkillTarget.SELF,
        effects: [
            { type: SkillEffectType.HEAL, value: 0.5 } // Heals for 50% of max HP
        ],
        abilities: []
    },
    {
        id: 'npc_skill_earthquake',
        name: 'Động Đất',
        description: 'Gây chấn động mặt đất, gây sát thương cho tất cả kẻ địch.',
        cost: 60,
        cooldown: 5,
        // FIX: Replaced string literal with enum member.
        target: SkillTarget.ALL_ENEMIES,
        effects: [
            { type: SkillEffectType.DAMAGE, value: 1.5 } // 150% ATK to all
        ],
        abilities: []
    },
    {
        id: 'npc_skill_armor_break',
        name: 'Phá Giáp',
        description: 'Một đòn đánh mạnh mẽ làm suy yếu phòng thủ của đối phương.',
        cost: 35,
        cooldown: 4,
        // FIX: Replaced string literal with enum member.
        target: SkillTarget.SINGLE_ENEMY,
        effects: [
            { type: SkillEffectType.DAMAGE, value: 1.2 }, // 120% ATK
            { 
                type: SkillEffectType.APPLY_STATUS, 
                status: {
                    name: 'Giảm Phòng Thủ',
                    description: 'Phòng thủ bị suy yếu.',
                    effect: '-25% DEF',
                    type: StatType.BAD,
                    duration: 3
                }
            }
        ],
        abilities: []
    }
];

// Create a map for quick lookup
export const npcSkillMap = new Map(predefinedNpcSkills.map(skill => [skill.id, skill]));

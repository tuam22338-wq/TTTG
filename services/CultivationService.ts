import { CharacterCoreStats, CultivationState, Skill } from '../types';
import { predefinedNpcSkills } from './predefinedNpcSkills';

/**
 * @file This file contains client-side logic for calculating the player's cultivation realm based on their level.
 * Offloading this from the AI improves performance and ensures consistency.
 */
export const calculateRealm = (level: number): string => {
    if (level >= 1 && level <= 9) return `Phàm Nhân - Luyện Thể tầng ${level}`;
    if (level >= 10 && level <= 20) return `Phàm Nhân - Khải Linh tầng ${level - 9}`;
    if (level >= 21 && level <= 29) return `Tu Luyện Giả - Luyện Khí tầng ${level - 20}`;
    if (level >= 30 && level <= 33) {
        if (level === 30) return "Tu Luyện Giả - Trúc Cơ sơ kỳ";
        if (level >= 31 && level <= 32) return "Tu Luyện Giả - Trúc Cơ trung kỳ";
        return "Tu Luyện Giả - Trúc Cơ hậu kỳ";
    }
    if (level >= 34 && level <= 36) {
        if (level === 34) return "Tu Luyện Giả - Kim Đan sơ kỳ";
        if (level === 35) return "Tu Luyện Giả - Kim Đan trung kỳ";
        return "Tu Luyện Giả - Kim Đan hậu kỳ";
    }
    if (level >= 37 && level <= 39) {
        if (level === 37) return "Tiên Giới - Nguyên Anh sơ kỳ";
        if (level === 38) return "Tiên Giới - Nguyên Anh trung kỳ";
        return "Tiên Giới - Nguyên Anh hậu kỳ";
    }
    if (level >= 40 && level <= 49) {
        if (level <= 42) return "Tiên Giới - Hóa Thần sơ kỳ";
        if (level <= 46) return "Tiên Giới - Hóa Thần trung kỳ";
        return "Tiên Giới - Hóa Thần hậu kỳ";
    }
    if (level >= 50 && level <= 59) {
        if (level <= 52) return "Tiên Giới - Đại Thừa sơ kỳ";
        if (level <= 56) return "Tiên Giới - Đại Thừa trung kỳ";
        return "Tiên Giới - Đại Thừa hậu kỳ";
    }
    if (level >= 60 && level <= 69) return "Tiên Giới - Độ Kiếp";
    if (level >= 70 && level <= 79) {
        if (level <= 72) return "Chân Tiên - Tiên Nhân hạ phẩm";
        if (level <= 76) return "Chân Tiên - Tiên Nhân trung sản phẩm";
        return "Chân Tiên - Tiên Nhân thượng phẩm";
    }
    if (level >= 80 && level <= 89) return "Chân Tiên - Kim Tiên / Thái Ất Chân Tiên";
    if (level >= 90 && level <= 99) return "Thánh Nhân - Tiên Đế / Đạo Tổ";
    if (level >= 100) return "Tối Thượng - Hỗn Thánh Nhân / Chúa Tể Vĩnh Hằng";

    return "Phàm Nhân"; // Fallback
};

/**
 * Calculates the total experience points required to reach the next level.
 * @param level The current level.
 * @returns The total EXP needed for the next level.
 */
export const calculateExpForNextLevel = (level: number): number => {
    return Math.floor(100 * Math.pow(level, 1.5));
};


/**
 * Calculates the initial stats for a new character at level 1.
 * @returns A CharacterCoreStats object.
 */
export const calculateInitialStats = (): CharacterCoreStats => {
    const baseHp = 100;
    const baseMp = 50;
    const baseAtk = 10;
    const baseDef = 5;

    return {
        sinhLuc: baseHp,
        sinhLucToiDa: baseHp,
        linhLuc: baseMp,
        linhLucToiDa: baseMp,
        theLuc: 100,
        theLucToiDa: 100,
        doNo: 100,
        doNoToiDa: 100,
        doNuoc: 100,
        doNuocToiDa: 100,
        congKich: baseAtk,
        phongNgu: baseDef,
        khangPhep: 5,
        thanPhap: 10,
        chiMang: 0.05, // 5%
        satThuongChiMang: 1.5,  // 150%
        giamHoiChieu: 0,      // 0%
    };
};

/**
 * Applies stat gains for a level up. Increases max HP, MP, ATK, and DEF by 2%.
 * @param currentStats The character's current core stats.
 * @returns The updated CharacterCoreStats object.
 */
export const applyLevelUp = (currentStats: CharacterCoreStats): CharacterCoreStats => {
    const newMaxHp = Math.ceil(currentStats.sinhLucToiDa * 1.02);
    const newMaxMp = Math.ceil(currentStats.linhLucToiDa * 1.02);
    const newAtk = Math.ceil(currentStats.congKich * 1.02);
    const newDef = Math.ceil(currentStats.phongNgu * 1.02);
    const newMdef = Math.ceil(currentStats.khangPhep * 1.02);
    const newMaxTl = Math.ceil(currentStats.theLucToiDa * 1.02);
    const newMaxDoNo = Math.ceil(currentStats.doNoToiDa * 1.02);
    const newMaxDoNuoc = Math.ceil(currentStats.doNuocToiDa * 1.02);

    return {
        ...currentStats,
        sinhLuc: newMaxHp, // Fully heal on level up
        sinhLucToiDa: newMaxHp,
        linhLuc: newMaxMp, // Fully restore MP on level up
        linhLucToiDa: newMaxMp,
        theLuc: newMaxTl, // Fully restore TL on level up
        theLucToiDa: newMaxTl,
        doNo: newMaxDoNo, // Fully restore on level up
        doNoToiDa: newMaxDoNo,
        doNuoc: newMaxDoNuoc, // Fully restore on level up
        doNuocToiDa: newMaxDoNuoc,
        congKich: newAtk,
        phongNgu: newDef,
        khangPhep: newMdef,
    };
};

/**
 * Calculates the full combat stats for any given level based on the game's progression formula.
 * @param level The level to calculate stats for.
 * @returns A CharacterCoreStats object with stats for that level.
 */
export const calculateStatsForLevel = (level: number): CharacterCoreStats => {
    if (level <= 1) {
        return calculateInitialStats();
    }

    const initialStats = calculateInitialStats();
    const growthFactor = Math.pow(1.02, level - 1);

    const stats: CharacterCoreStats = {
        ...initialStats,
        sinhLucToiDa: Math.ceil(initialStats.sinhLucToiDa * growthFactor),
        linhLucToiDa: Math.ceil(initialStats.linhLucToiDa * growthFactor),
        theLucToiDa: Math.ceil(initialStats.theLucToiDa * growthFactor),
        doNoToiDa: Math.ceil(initialStats.doNoToiDa * growthFactor),
        doNuocToiDa: Math.ceil(initialStats.doNuocToiDa * growthFactor),
        congKich: Math.ceil(initialStats.congKich * growthFactor),
        phongNgu: Math.ceil(initialStats.phongNgu * growthFactor),
        khangPhep: Math.ceil(initialStats.khangPhep * growthFactor),
        thanPhap: Math.ceil(initialStats.thanPhap * growthFactor),
        // Percentages grow additively for simplicity
        chiMang: initialStats.chiMang + (0.001 * (level - 1)),
        satThuongChiMang: initialStats.satThuongChiMang + (0.005 * (level - 1)),
        giamHoiChieu: initialStats.giamHoiChieu + (0.0005 * (level - 1)),
    };

    // Set current stats to max
    stats.sinhLuc = stats.sinhLucToiDa;
    stats.linhLuc = stats.linhLucToiDa;
    stats.theLuc = stats.theLucToiDa;
    stats.doNo = stats.doNoToiDa;
    stats.doNuoc = stats.doNuocToiDa;

    return stats;
};

/**
 * Gets a list of skills an NPC should have based on their level.
 * @param level The NPC's level.
 * @returns An array of Skill objects.
 */
export const getSkillsForNpc = (level: number): Skill[] => {
    const skills: Skill[] = [];

    if (level >= 5) {
        skills.push(predefinedNpcSkills.find(s => s.id === 'npc_skill_lesser_strike')!);
    }
    if (level >= 8) {
        skills.push(predefinedNpcSkills.find(s => s.id === 'npc_skill_minor_heal')!);
    }
    if (level >= 15) {
        skills.push(predefinedNpcSkills.find(s => s.id === 'npc_skill_fireball')!);
    }
    if (level >= 20) {
        skills.push(predefinedNpcSkills.find(s => s.id === 'npc_skill_hamstring')!);
    }
    if (level >= 30) {
        skills.push(predefinedNpcSkills.find(s => s.id === 'npc_skill_armor_break')!);
    }
    if (level >= 35) {
        skills.push(predefinedNpcSkills.find(s => s.id === 'npc_skill_greater_heal')!);
    }
     if (level >= 40) {
        skills.push(predefinedNpcSkills.find(s => s.id === 'npc_skill_earthquake')!);
    }

    return skills;
};

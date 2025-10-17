import { CharacterCoreStats, CultivationState, Skill, WorldCreationState } from '../types';

/**
 * @file This file contains client-side logic for calculating the player's cultivation realm based on their level
 * and the custom cultivation system defined in the world context.
 * Offloading this from the AI improves performance and ensures consistency.
 */

/**
 * Calculates the cultivation realm string based on the player's level and the custom system defined in the world creation state.
 * @param level The player's current cultivation level.
 * @param worldContext The world creation state containing the custom cultivation system.
 * @returns A formatted string representing the player's current realm, e.g., "Kim Đan - Sơ kỳ" or "Cấp 5".
 */
export function getRealmString(level: number, worldContext: WorldCreationState): string {
    if (!worldContext.isCultivationEnabled || !worldContext.cultivationSystem?.mainTiers || worldContext.cultivationSystem.mainTiers.length === 0) {
        return `Cấp ${level}`;
    }

    let levelCounter = 1;
    for (const mainTier of worldContext.cultivationSystem.mainTiers) {
        if (mainTier.subTiers && mainTier.subTiers.length > 0) {
            for (const subTier of mainTier.subTiers) {
                if (levelCounter === level) {
                    return `${mainTier.name} - ${subTier.name}`;
                }
                levelCounter++;
            }
        } else {
            // Main tier without sub-tiers, assume it's one level
            if (levelCounter === level) {
                return mainTier.name;
            }
            levelCounter++;
        }
    }
    
    // Fallback if level is higher than defined tiers
    const lastTier = worldContext.cultivationSystem.mainTiers[worldContext.cultivationSystem.mainTiers.length - 1];
    if (lastTier) {
        const lastSubTier = lastTier.subTiers.length > 0 ? lastTier.subTiers[lastTier.subTiers.length - 1] : null;
        if (lastSubTier) {
             return `${lastTier.name} - ${lastSubTier.name} (Đại viên mãn)`;
        }
        return `${lastTier.name} (Đại viên mãn)`;
    }

    return `Cấp ${level}`;
}
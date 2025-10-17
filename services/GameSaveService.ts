import { GameState, AiSettings, GameTime, CultivationState } from '../types';

const MANUAL_SAVE_KEY = 'BMS_TG_ManualSaveData';
const AUTO_SAVE_KEY = 'BMS_TG_AutoSaveData';

const DEFAULT_AI_SETTINGS: AiSettings = {
    isLogicModeOn: true,
    lustModeFlavor: null,
    isConscienceModeOn: false,
    isStrictInterpretationOn: false,
    destinyCompassMode: 'NORMAL',
    npcMindset: 'DEFAULT',
    flowOfDestinyInterval: null,
    authorsMandate: [],
    isTurnBasedCombat: true,
};
const DEFAULT_TIME: GameTime = { day: 1, hour: 8, minute: 0, season: 'Xuân', weather: 'Quang đãng' };
const DEFAULT_CULTIVATION: CultivationState = { level: 1, exp: 0, expToNextLevel: 100 };

function validateAndHydrateGameState(parsedState: any): GameState | null {
  if (parsedState && parsedState.history && parsedState.playerStats && parsedState.worldContext) {
    const hydratedState = { ...parsedState };

    // --- Hydrate missing root-level properties ---
    hydratedState.npcs = Array.isArray(parsedState.npcs) ? parsedState.npcs : [];
    hydratedState.playerSkills = Array.isArray(parsedState.playerSkills) ? parsedState.playerSkills : [];
    hydratedState.playerStatOrder = Array.isArray(parsedState.playerStatOrder) ? parsedState.playerStatOrder : [];
    hydratedState.chronicle = Array.isArray(parsedState.chronicle) ? parsedState.chronicle : [];
    hydratedState.combatants = Array.isArray(parsedState.combatants) ? parsedState.combatants : [];
    hydratedState.isInCombat = typeof parsedState.isInCombat === 'boolean' ? parsedState.isInCombat : false;

    // AI Settings
    hydratedState.aiSettings = { ...DEFAULT_AI_SETTINGS, ...(parsedState.aiSettings || {}) };
    hydratedState.aiSettings.authorsMandate = Array.isArray(hydratedState.aiSettings.authorsMandate) ? hydratedState.aiSettings.authorsMandate : [];

    // Time
    hydratedState.time = { ...DEFAULT_TIME, ...(parsedState.time || {}) };

    // Cultivation
    hydratedState.cultivation = { ...DEFAULT_CULTIVATION, ...(parsedState.cultivation || {}) };

    // Inventory & Equipment
    if (!parsedState.inventory) {
      hydratedState.inventory = { items: [], capacity: 50, maxWeight: 25 };
    } else {
      hydratedState.inventory.items = Array.isArray(parsedState.inventory.items) ? parsedState.inventory.items : [];
    }
    if (!parsedState.equipment) {
      hydratedState.equipment = { WEAPON: null, HEAD: null, CHEST: null, LEGS: null, HANDS: null, FEET: null };
    }
    
    // Core Stats
    hydratedState.coreStats = parsedState.coreStats || {};
    
    // World Context sub-properties
    if (hydratedState.worldContext) {
        hydratedState.worldContext.initialFactions = Array.isArray(hydratedState.worldContext.initialFactions) ? hydratedState.worldContext.initialFactions : [];
        hydratedState.worldContext.initialNpcs = Array.isArray(hydratedState.worldContext.initialNpcs) ? hydratedState.worldContext.initialNpcs : [];
        hydratedState.worldContext.specialRules = Array.isArray(hydratedState.worldContext.specialRules) ? hydratedState.worldContext.specialRules : [];
        hydratedState.worldContext.initialLore = Array.isArray(hydratedState.worldContext.initialLore) ? hydratedState.worldContext.initialLore : [];
        if (hydratedState.worldContext.character) {
             hydratedState.worldContext.character.skills = Array.isArray(hydratedState.worldContext.character.skills) ? hydratedState.worldContext.character.skills : [];
        }
        if (hydratedState.worldContext.cultivationSystem && hydratedState.worldContext.cultivationSystem.mainTiers) {
            hydratedState.worldContext.cultivationSystem.mainTiers = hydratedState.worldContext.cultivationSystem.mainTiers.map((mainTier: any) => {
                const newMainTier = { ...mainTier };
                newMainTier.statBonuses = Array.isArray(newMainTier.statBonuses) ? newMainTier.statBonuses : [];
                newMainTier.subTiers = (newMainTier.subTiers || []).map((subTier: any) => {
                    const newSubTier = { ...subTier };
                    newSubTier.statBonuses = Array.isArray(newSubTier.statBonuses) ? newSubTier.statBonuses : [];
                    return newSubTier;
                });
                return newMainTier;
            });
        }
    }

    return hydratedState as GameState;
  }
  return null;
}


// --- Manual Save ---

export function saveManualSave(gameState: GameState): void {
  try {
    const serializedState = JSON.stringify(gameState);
    localStorage.setItem(MANUAL_SAVE_KEY, serializedState);
  } catch (error) {
    console.error("Failed to save manual game to localStorage:", error);
  }
}

export function loadManualSave(): GameState | null {
  try {
    const serializedState = localStorage.getItem(MANUAL_SAVE_KEY);
    if (serializedState === null) {
      return null;
    }
    const parsed = JSON.parse(serializedState);
    return validateAndHydrateGameState(parsed);
  } catch (error) {
    console.error("Failed to load manual game from localStorage:", error);
    return null;
  }
}

export function hasManualSave(): boolean {
  return localStorage.getItem(MANUAL_SAVE_KEY) !== null;
}

// --- Auto Save ---

export function saveAutoSave(gameState: GameState): void {
  try {
    const serializedState = JSON.stringify(gameState);
    localStorage.setItem(AUTO_SAVE_KEY, serializedState);
  } catch (error) {
    console.error("Failed to save auto game to localStorage:", error);
  }
}

export function loadAutoSave(): GameState | null {
  try {
    const serializedState = localStorage.getItem(AUTO_SAVE_KEY);
    if (serializedState === null) {
      return null;
    }
    const parsed = JSON.parse(serializedState);
    return validateAndHydrateGameState(parsed);
  } catch (error) {
    console.error("Failed to load auto game from localStorage:", error);
    return null;
  }
}

export function hasAutoSave(): boolean {
  return localStorage.getItem(AUTO_SAVE_KEY) !== null;
}


// --- General ---

export function deleteAllLocalSaves(): void {
  try {
    localStorage.removeItem(MANUAL_SAVE_KEY);
    localStorage.removeItem(AUTO_SAVE_KEY);
  } catch (error) {
    console.error("Failed to delete all saves from localStorage:", error);
  }
}


// --- File System ---

export function saveToFile(gameState: GameState): void {
  try {
    const serializedState = JSON.stringify(gameState, null, 2); // Pretty print JSON
    const blob = new Blob([serializedState], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `BMS-TG-save-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to save game to file:", error);
    alert("Không thể tải file lưu.");
  }
}

export function loadFromFile(file: File): Promise<GameState> {
  return new Promise((resolve, reject) => {
    if (!file || file.type !== 'application/json') {
      return reject(new Error("Vui lòng chọn một file save (.json) hợp lệ."));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsedState = JSON.parse(text);
        const validatedState = validateAndHydrateGameState(parsedState);
        if (validatedState) {
          resolve(validatedState);
        } else {
          reject(new Error("File save không hợp lệ hoặc bị hỏng."));
        }
      } catch (e) {
        reject(new Error("Không thể đọc file save. File có thể bị hỏng."));
      }
    };
    reader.onerror = () => {
      reject(new Error("Đã xảy ra lỗi khi đọc file."));
    };
    reader.readAsText(file);
  });
}

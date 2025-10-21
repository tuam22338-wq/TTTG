import { GameState, Settings, AiSettings, GameTime, CultivationState, ChatMessage, NovelSession } from '../types';

const DB_NAME = 'BMS_TamThienTheGioi';
const DB_VERSION = 2;
const GAME_SAVES_STORE = 'gameSaves';
const SETTINGS_STORE = 'appSettings';
const NOVEL_WRITER_STORE = 'novelWriter';

let db: IDBDatabase | null = null;

const OLD_MANUAL_SAVE_KEY = 'BMS_TG_ManualSaveData';
const OLD_AUTO_SAVE_KEY = 'BMS_TG_AutoSaveData';
const OLD_SETTINGS_KEY = 'appSettings';
const MIGRATION_FLAG_KEY = 'db_migrated';


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

function getDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            reject('Error opening IndexedDB.');
        };

        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const tempDb = (event.target as IDBOpenDBRequest).result;
            if (!tempDb.objectStoreNames.contains(GAME_SAVES_STORE)) {
                tempDb.createObjectStore(GAME_SAVES_STORE);
            }
            if (!tempDb.objectStoreNames.contains(SETTINGS_STORE)) {
                tempDb.createObjectStore(SETTINGS_STORE);
            }
            if (!tempDb.objectStoreNames.contains(NOVEL_WRITER_STORE)) {
                tempDb.createObjectStore(NOVEL_WRITER_STORE);
            }
        };
    });
}

async function get<T>(storeName: string, key: string): Promise<T | null> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        request.onsuccess = () => {
            resolve(request.result || null);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

async function set<T>(storeName: string, key: string, value: T): Promise<void> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(value, key);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

async function del(storeName: string, key: string): Promise<void> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function getAll<T>(storeName: string): Promise<T[]> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result || []);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}


// --- Public API ---

export async function saveGameState(type: 'manual' | 'auto', gameState: GameState): Promise<void> {
    await set(GAME_SAVES_STORE, type, gameState);
}

export async function loadGameState(type: 'manual' | 'auto'): Promise<GameState | null> {
    const state = await get<GameState>(GAME_SAVES_STORE, type);
    return state ? validateAndHydrateGameState(state) : null;
}

export async function hasSave(type: 'manual' | 'auto'): Promise<boolean> {
    const data = await get(GAME_SAVES_STORE, type);
    return data !== null;
}

export async function deleteSave(type: 'manual' | 'auto'): Promise<void> {
    await del(GAME_SAVES_STORE, type);
}

export async function saveSettings(settings: Settings): Promise<void> {
    await set(SETTINGS_STORE, 'settings', settings);
}

export async function loadSettings(): Promise<Partial<Settings> | null> {
    return await get<Partial<Settings>>(SETTINGS_STORE, 'settings');
}

export async function getAllNovelSessions(): Promise<NovelSession[]> {
    const sessions = await getAll<NovelSession>(NOVEL_WRITER_STORE);
    // Sort by last modified date, newest first
    return sessions.sort((a, b) => b.lastModified - a.lastModified);
}

export async function loadNovelSession(id: string): Promise<NovelSession | null> {
    return await get<NovelSession>(NOVEL_WRITER_STORE, id);
}

export async function saveNovelSession(session: NovelSession): Promise<void> {
    await set(NOVEL_WRITER_STORE, session.id, session);
}

export async function deleteNovelSession(id: string): Promise<void> {
    await del(NOVEL_WRITER_STORE, id);
}



// --- Migration Logic ---

export async function migrateFromLocalStorage() {
    if (localStorage.getItem(MIGRATION_FLAG_KEY)) {
        return; // Migration already done
    }

    console.log("Checking for data to migrate from localStorage to IndexedDB...");

    try {
        // Migrate saves
        const oldAutoSave = localStorage.getItem(OLD_AUTO_SAVE_KEY);
        if (oldAutoSave) {
            const gameState = validateAndHydrateGameState(JSON.parse(oldAutoSave));
            if (gameState) {
                await saveGameState('auto', gameState);
                localStorage.removeItem(OLD_AUTO_SAVE_KEY);
                console.log("Successfully migrated auto-save.");
            }
        }

        const oldManualSave = localStorage.getItem(OLD_MANUAL_SAVE_KEY);
        if (oldManualSave) {
            const gameState = validateAndHydrateGameState(JSON.parse(oldManualSave));
            if (gameState) {
                await saveGameState('manual', gameState);
                localStorage.removeItem(OLD_MANUAL_SAVE_KEY);
                console.log("Successfully migrated manual save.");
            }
        }
        
        // Migrate settings
        const oldSettings = localStorage.getItem(OLD_SETTINGS_KEY);
        if (oldSettings) {
            const settings = JSON.parse(oldSettings);
            await saveSettings(settings);
            localStorage.removeItem(OLD_SETTINGS_KEY);
            console.log("Successfully migrated settings.");
        }

        localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
        console.log("Migration complete.");

    } catch (error) {
        console.error("Error during localStorage to IndexedDB migration:", error);
        // Don't set the flag if migration fails, so it can be re-attempted.
    }
}


export function validateAndHydrateGameState(parsedState: any): GameState | null {
  if (parsedState && parsedState.history && parsedState.playerStats && parsedState.worldContext) {
    const hydratedState = { ...parsedState };

    // --- Hydrate missing root-level properties ---
    hydratedState.npcs = Array.isArray(parsedState.npcs) ? parsedState.npcs : [];
    hydratedState.playerSkills = Array.isArray(parsedState.playerSkills) ? parsedState.playerSkills : [];
    hydratedState.playerStatOrder = Array.isArray(parsedState.playerStatOrder) ? parsedState.playerStatOrder : [];
    hydratedState.chronicle = Array.isArray(parsedState.chronicle) ? parsedState.chronicle : [];
    hydratedState.combatants = Array.isArray(parsedState.combatants) ? parsedState.combatants : [];
    hydratedState.isInCombat = typeof parsedState.isInCombat === 'boolean' ? parsedState.isInCombat : false;
    hydratedState.codex = Array.isArray(parsedState.codex) ? parsedState.codex : [];

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
        
        hydratedState.worldContext.specialRules = (Array.isArray(hydratedState.worldContext.specialRules) ? hydratedState.worldContext.specialRules : []).map((rule: any) => ({
            ...rule,
            isEnabled: rule.isEnabled !== undefined ? rule.isEnabled : true, // Default to true if missing
            tags: Array.isArray(rule.tags) ? rule.tags : []
        }));
        
        hydratedState.worldContext.initialLore = (Array.isArray(hydratedState.worldContext.initialLore) ? hydratedState.worldContext.initialLore : []).map((rule: any) => ({
            ...rule,
            tags: Array.isArray(rule.tags) ? rule.tags : []
        }));

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
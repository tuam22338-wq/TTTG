import { useState, useCallback, useEffect } from 'react';
import {
    GameState,
    WorldCreationState,
    GameTurn,
    StatChanges,
    NPCUpdate,
    Skill,
    AiSettings,
    LustModeFlavor,
    NpcMindset,
    DestinyCompassMode,
    Item,
    EntityTarget,
    StatAction,
    StatScopes,
    CharacterCoreStats,
    Equipment,
    EquipmentSlot,
    SpecialItem,
    // FIX: Import NPC type to resolve 'Cannot find name 'NPC'' error.
    NPC,
    Weather,
} from '../types';
import * as GeminiStorytellerService from '../services/GeminiStorytellerService';
import * as GameSaveService from '../services/GameSaveService';
import { GoogleGenAI } from '@google/genai';
import { AiModelSettings, SafetySettings } from '../types';

const INITIAL_AI_SETTINGS: AiSettings = {
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

function getInitialCoreStats(worldState: WorldCreationState): CharacterCoreStats {
    const stats: Partial<CharacterCoreStats> = {};
    const coreStatKeys: (keyof CharacterCoreStats)[] = [
        'sinhLucToiDa', 'linhLucToiDa', 'theLucToiDa', 'doNoToiDa', 'doNuocToiDa',
        'congKich', 'phongNgu', 'khangPhep', 'thanPhap', 'chiMang', 'satThuongChiMang', 'giamHoiChieu'
    ];

    worldState.customAttributes.forEach(attr => {
        if (coreStatKeys.includes(attr.id as keyof CharacterCoreStats)) {
            (stats as any)[attr.id] = attr.baseValue;
        }
    });

    // Set current values to max
    stats.sinhLuc = stats.sinhLucToiDa;
    stats.linhLuc = stats.linhLucToiDa;
    stats.theLuc = stats.theLucToiDa;
    stats.doNo = stats.doNoToiDa;
    stats.doNuoc = stats.doNuocToiDa;

    const defaults: CharacterCoreStats = {
        sinhLuc: 100, sinhLucToiDa: 100, linhLuc: 50, linhLucToiDa: 50,
        theLuc: 100, theLucToiDa: 100, doNo: 100, doNoToiDa: 100,
        doNuoc: 100, doNuocToiDa: 100, congKich: 10, phongNgu: 5, khangPhep: 5,
        thanPhap: 10, chiMang: 0.05, satThuongChiMang: 1.5, giamHoiChieu: 0,
    };

    return { ...defaults, ...stats };
}

export function useGameEngine(
    initialData: WorldCreationState | GameState,
    geminiService: GoogleGenAI | null,
    aiModelSettings: AiModelSettings,
    safetySettings: SafetySettings
) {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newlyAcquiredSkill, setNewlyAcquiredSkill] = useState<Skill | null>(null);
    const [itemsReceived, setItemsReceived] = useState<Item[]>([]);
    const [showIntroductoryModal, setShowIntroductoryModal] = useState(false);

    const initializeGame = useCallback(async (worldState: WorldCreationState) => {
        if (!geminiService) {
            setError("Lỗi: Dịch vụ AI chưa được khởi tạo.");
            setIsLoading(false);
            return;
        }
        try {
            const {
                initialTurn,
                initialPlayerStatChanges,
                initialNpcUpdates,
                initialPlayerSkills,
                plotChronicle,
                presentNpcIds,
                summaryText,
                initialInventory,
            } = await GeminiStorytellerService.initializeStory(worldState, geminiService, aiModelSettings, safetySettings);

            const initialCoreStats = getInitialCoreStats(worldState);
            
            const newGameState: GameState = {
                worldContext: worldState,
                history: [initialTurn],
                playerStats: {},
                playerStatOrder: [],
                npcs: [],
                playerSkills: initialPlayerSkills || [],
                plotChronicle,
                presentNpcIds,
                totalTokens: initialTurn.tokenCount || 0,
                requestCount: 1,
                aiSettings: INITIAL_AI_SETTINGS,
                coreStats: initialCoreStats,
                cultivation: { level: 1, exp: 0, expToNextLevel: 100 },
                inventory: { items: [], capacity: 50, maxWeight: 25 },
                equipment: { WEAPON: null, HEAD: null, CHEST: null, LEGS: null, HANDS: null, FEET: null },
                chronicle: [{ turnNumber: 1, summary: summaryText, timestamp: new Date().toLocaleTimeString('vi-VN') }],
                time: { day: 1, hour: 8, minute: 0, season: 'Xuân', weather: 'Quang đãng' },
                isInCombat: false,
                combatants: [],
            };

            // Apply initial updates
            const withStats = applyStatChanges(newGameState, initialPlayerStatChanges, 'PLAYER');
            const withNpcs = applyNpcUpdates(withStats, initialNpcUpdates);
            
            setGameState(withNpcs);
            setShowIntroductoryModal(true);

        } catch (e: any) {
            console.error("Lỗi khởi tạo game:", e);
            setError(e.message || "Đã xảy ra lỗi không xác định khi bắt đầu câu chuyện.");
        } finally {
            setIsLoading(false);
        }
    }, [geminiService, aiModelSettings, safetySettings]);

    useEffect(() => {
        if ('history' in initialData) {
            // It's a saved GameState
            setGameState(initialData as GameState);
            setIsLoading(false);
        } else {
            // It's WorldCreationState for a new game
            initializeGame(initialData as WorldCreationState);
        }
    }, [initialData, initializeGame]);
    
    const applyStatChanges = (
        currentState: GameState,
        changes: StatChanges,
        target: 'PLAYER' | string // PLAYER or NPC ID
    ): GameState => {
        const newState = { ...currentState };
        let targetStats: Record<string, any>;
        let targetStatOrder: string[];
    
        if (target === 'PLAYER') {
            targetStats = { ...newState.playerStats };
            targetStatOrder = [...(newState.playerStatOrder || [])];
        } else {
            const npcIndex = newState.npcs.findIndex(n => n.id === target);
            if (npcIndex === -1) return currentState;
            targetStats = { ...newState.npcs[npcIndex].stats };
            targetStatOrder = []; // NPC stat order is not managed client-side
        }
    
        changes.statsToDelete?.forEach(statName => {
            delete targetStats[statName];
            const index = targetStatOrder.indexOf(statName);
            if (index > -1) {
                targetStatOrder.splice(index, 1);
            }
        });
    
        changes.statsToUpdate?.forEach(({ name, stat }) => {
            targetStats[name] = stat;
            if (!targetStatOrder.includes(name)) {
                targetStatOrder.push(name);
            }
        });
    
        if (target === 'PLAYER') {
            newState.playerStats = targetStats;
            newState.playerStatOrder = targetStatOrder;
        } else {
            const npcIndex = newState.npcs.findIndex(n => n.id === target);
            newState.npcs[npcIndex] = { ...newState.npcs[npcIndex], stats: targetStats };
        }
    
        return newState;
    };
    
    const applyNpcUpdates = (currentState: GameState, updates: NPCUpdate[]): GameState => {
        if (!updates || updates.length === 0) return currentState;
    
        let newNpcs = [...currentState.npcs];
    
        updates.forEach(update => {
            const existingNpcIndex = newNpcs.findIndex(n => n.id === update.id);
    
            switch (update.action) {
                case 'CREATE':
                    if (existingNpcIndex === -1 && update.payload) {
                        const { stats, ...restOfPayload } = update.payload as any;

                        let initialStats = {};
                        if (Array.isArray(stats)) {
                            initialStats = stats.reduce((acc: any, { name, stat }: {name: string, stat: any}) => {
                                acc[name] = stat;
                                return acc;
                            }, {});
                        }

                        newNpcs.push({
                            level: 1,
                            coreStats: getInitialCoreStats(currentState.worldContext),
                            skills: [],
                            ...restOfPayload,
                            id: update.id,
                            stats: initialStats
                        } as NPC);
                    }
                    break;
                case 'UPDATE':
                    if (existingNpcIndex !== -1 && update.payload) {
                        const existingNpc = newNpcs[existingNpcIndex];
                        const { stats, ...restOfPayload } = update.payload as any;

                        let finalStats = { ...existingNpc.stats };
                        if (Array.isArray(stats)) {
                             const statsUpdateObject = stats.reduce((acc: any, { name, stat }: {name: string, stat: any}) => {
                                if (name && stat) {
                                    acc[name] = stat;
                                }
                                return acc;
                            }, {});
                            finalStats = { ...finalStats, ...statsUpdateObject };
                        }
                        
                        newNpcs[existingNpcIndex] = { 
                            ...existingNpc, 
                            ...restOfPayload,
                            stats: finalStats,
                        };
                    }
                    break;
                case 'DELETE':
                    if (existingNpcIndex !== -1) {
                        newNpcs.splice(existingNpcIndex, 1);
                    }
                    break;
            }
        });
    
        return { ...currentState, npcs: newNpcs };
    };

    const processTurn = async (choice: string, isRewrite: boolean = false, isCorrection: boolean = false) => {
        if (!gameState || !geminiService) {
            setError("Trạng thái game hoặc dịch vụ AI không hợp lệ.");
            return;
        }
        setIsLoading(true);
        setError(null);
        
        try {
            const {
                newTurn,
                playerStatChanges,
                npcUpdates,
                newlyAcquiredSkill,
                newPlotChronicle,
                presentNpcIds,
                summaryText,
                itemsReceived,
                timeElapsed,
                nsfwSceneStateChange,
                expGained,
                coreStatsChanges,
                weatherChange,
                isInCombat,
                combatantNpcIds
            } = await GeminiStorytellerService.continueStory(
                gameState,
                choice,
                geminiService,
                gameState.aiSettings.isLogicModeOn,
                gameState.aiSettings.lustModeFlavor,
                gameState.aiSettings.npcMindset,
                gameState.aiSettings.isConscienceModeOn,
                gameState.aiSettings.isStrictInterpretationOn,
                gameState.aiSettings.destinyCompassMode,
                isRewrite,
                false, // shouldTriggerWorldTurn logic needs to be implemented
                isCorrection,
                gameState.coreStats, // finalCoreStats for now is just current coreStats
                gameState.aiSettings.authorsMandate,
                gameState.aiSettings.isTurnBasedCombat,
                aiModelSettings,
                safetySettings
            );
            
            setGameState(prevState => {
                 if (!prevState) return null;
                 
                 let newState = { ...prevState };

                 // 1. Apply stat & NPC updates
                 newState = applyStatChanges(newState, playerStatChanges, 'PLAYER');
                 newState = applyNpcUpdates(newState, npcUpdates);
                 
                 // 2. Update history and chronicle
                 if (isRewrite) {
                     const newHistory = [...prevState.history];
                     newHistory[newHistory.length -1] = newTurn;
                     newState.history = newHistory;
                 } else {
                     newState.history = [...prevState.history, newTurn];
                     newState.chronicle = [...prevState.chronicle, { turnNumber: prevState.history.length + 1, summary: summaryText, timestamp: new Date().toLocaleTimeString('vi-VN') }];
                 }
                 
                 // 3. Update core state
                 newState.plotChronicle = newPlotChronicle;
                 newState.presentNpcIds = presentNpcIds;
                 newState.totalTokens += newTurn.tokenCount || 0;
                 newState.requestCount += 1;
                 
                 // 4. Handle time and environment
                 const newMinutes = prevState.time.minute + timeElapsed;
                 const newHour = prevState.time.hour + Math.floor(newMinutes / 60);
                 const newDay = prevState.time.day + Math.floor(newHour / 24);
                 
                 newState.time = {
                     ...prevState.time,
                     minute: newMinutes % 60,
                     hour: newHour % 24,
                     day: newDay
                 };

                 if (weatherChange) {
                    newState.time.weather = weatherChange;
                 }

                 // Season Logic (assuming 91 days per season)
                const dayOfYear = newDay % 364;
                if (dayOfYear < 91) {
                    newState.time.season = 'Xuân';
                } else if (dayOfYear < 182) {
                    newState.time.season = 'Hạ';
                } else if (dayOfYear < 273) {
                    newState.time.season = 'Thu';
                } else {
                    newState.time.season = 'Đông';
                }


                 GameSaveService.saveAutoSave(newState);
                 
                 return newState;
            });

            if (newlyAcquiredSkill) {
                setNewlyAcquiredSkill(newlyAcquiredSkill);
            }
            
        } catch (e: any) {
            console.error("Lỗi xử lý lượt đi:", e);
            setError(e.message || "Đã xảy ra lỗi không xác định khi AI xử lý hành động.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const updateAiSettings = (newSettings: Partial<AiSettings>) => {
        setGameState(prev => {
            if (!prev) return null;
            const updatedState = {
                ...prev,
                aiSettings: {
                    ...prev.aiSettings,
                    ...newSettings
                }
            };
            // If Lust Mode is turned on, automatically turn off Strict Interpretation
            if (newSettings.lustModeFlavor && updatedState.aiSettings.isStrictInterpretationOn) {
                updatedState.aiSettings.isStrictInterpretationOn = false;
            }
            return updatedState;
        });
    };
    
    const addPlayerSkill = (skill: Skill) => {
        setGameState(prev => {
            if (!prev) return null;
            // Avoid duplicates
            if (prev.playerSkills.some(s => s.name === skill.name)) {
                return prev;
            }
            return {
                ...prev,
                playerSkills: [...prev.playerSkills, skill]
            };
        });
    };
    
    const executeEntityAction = async (target: EntityTarget, action: StatAction, scopes: StatScopes, directive?: string, newPersonality?: string) => {
        // This is a placeholder for a complex operation that would call the GeminiStorytellerService
        console.log("Executing action:", { target, action, scopes, directive, newPersonality });
        // In a real implementation, you'd call a service function here and update state with the result.
    };

    const handleAcknowledgeSkill = () => {
        if (newlyAcquiredSkill) {
            addPlayerSkill(newlyAcquiredSkill);
            setNewlyAcquiredSkill(null);
        }
    };

    const handleDeclineSkill = () => {
        setNewlyAcquiredSkill(null);
    };

    return {
        gameState,
        isLoading,
        error,
        newlyAcquiredSkill,
        itemsReceived,
        showIntroductoryModal,
        processTurn,
        updateAiSettings,
        executeEntityAction,
        handleAcknowledgeSkill,
        handleDeclineSkill,
        addPlayerSkill, // Expose for manual adding if needed
        setShowIntroductoryModal, // To close it from GameScreen
        setGameState, // For direct state manipulation like combat results
    };
}
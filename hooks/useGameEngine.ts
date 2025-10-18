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
import { ApiClient } from '../services/gemini/client';

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
    // Start with a zeroed-out stats object that matches the CharacterCoreStats type.
    const newCoreStats: CharacterCoreStats = {
        sinhLuc: 0, sinhLucToiDa: 0, linhLuc: 0, linhLucToiDa: 0,
        theLuc: 0, theLucToiDa: 0, doNo: 0, doNoToiDa: 0,
        doNuoc: 0, doNuocToiDa: 0, congKich: 0, phongNgu: 0, khangPhep: 0,
        thanPhap: 0, chiMang: 0, satThuongChiMang: 0, giamHoiChieu: 0,
    };

    // Create a map for quick lookup from the world creation attributes.
    const attributeMap = new Map(worldState.customAttributes.map(attr => [attr.id, attr.baseValue]));

    // Iterate over the keys of the newCoreStats object to populate it from the attribute map.
    // This ensures only attributes defined in world creation are given a value.
    for (const key in newCoreStats) {
        if (attributeMap.has(key)) {
            // Type assertion is safe here as we are iterating over known keys.
            (newCoreStats as any)[key] = attributeMap.get(key);
        }
    }

    // Set current resource values to their corresponding maximums.
    // If a max value was not defined in attributes, it remains 0, so the current value also becomes 0.
    newCoreStats.sinhLuc = newCoreStats.sinhLucToiDa;
    newCoreStats.linhLuc = newCoreStats.linhLucToiDa;
    newCoreStats.theLuc = newCoreStats.theLucToiDa;
    newCoreStats.doNo = newCoreStats.doNoToiDa;
    newCoreStats.doNuoc = newCoreStats.doNuocToiDa;

    return newCoreStats;
}

export function useGameEngine(
    initialData: WorldCreationState | GameState,
    apiClient: ApiClient,
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
        if (!apiClient.getApiClient()) {
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
            } = await GeminiStorytellerService.initializeStory(worldState, apiClient, aiModelSettings, safetySettings);

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
                // FIX: Added missing 'codex' property to satisfy the GameState type.
                codex: [],
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
    }, [apiClient, aiModelSettings, safetySettings]);

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
        if (!gameState || !apiClient.getApiClient()) {
            setError("Trạng thái game hoặc dịch vụ AI không hợp lệ.");
            return;
        }
        setIsLoading(true);
        setError(null);

        // 1. Immediately add a new turn shell to history for streaming
        setGameState(prevState => {
            if (!prevState) return null;
            const playerActionTurn: GameTurn = {
                playerAction: choice,
                storyText: '', // Empty for streaming
                choices: [],
                statusNarration: null,
                omniscientInterlude: null
            };
            const history = isRewrite ? [...prevState.history.slice(0, -1), playerActionTurn] : [...prevState.history, playerActionTurn];
            return { ...prevState, history };
        });
        
        try {
            let fullResponseJsonString = '';

            const onChunk = (chunk: string) => {
                fullResponseJsonString += chunk;

                // Fragile parsing of streaming JSON to get storyText for UI updates
                const storyTextMatch = fullResponseJsonString.match(/"storyText"\s*:\s*"((?:[^"\\]|\\.)*)/);
                const currentStoryText = storyTextMatch && storyTextMatch[1] 
                    ? JSON.parse(`"${storyTextMatch[1]}"`) 
                    : '...';

                setGameState(prevState => {
                    if (!prevState) return null;
                    const newHistory = [...prevState.history];
                    const lastTurn = newHistory[newHistory.length - 1];
                    if (lastTurn) {
                        lastTurn.storyText = currentStoryText;
                    }
                    return { ...prevState, history: newHistory };
                });
            };

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
                combatantNpcIds,
                totalTokens
            } = await GeminiStorytellerService.continueStory(
                gameState, choice, apiClient,
                gameState.aiSettings.isLogicModeOn, gameState.aiSettings.lustModeFlavor,
                gameState.aiSettings.npcMindset, gameState.aiSettings.isConscienceModeOn,
                gameState.aiSettings.isStrictInterpretationOn, gameState.aiSettings.destinyCompassMode,
                isRewrite, false, isCorrection, gameState.coreStats,
                gameState.aiSettings.authorsMandate, gameState.aiSettings.isTurnBasedCombat,
                aiModelSettings, safetySettings, onChunk
            );
            
            setGameState(prevState => {
                 if (!prevState) return null;
                 
                 let newState = { ...prevState };

                 // 1. Apply stat & NPC updates
                 newState = applyStatChanges(newState, playerStatChanges, 'PLAYER');
                 newState = applyNpcUpdates(newState, npcUpdates);
                 
                 // 2. Update history and chronicle with the final, complete turn data
                 const finalHistory = [...prevState.history];
                 finalHistory[finalHistory.length - 1] = newTurn;
                 newState.history = finalHistory;

                 if (!isRewrite) {
                     newState.chronicle = [...prevState.chronicle, { turnNumber: prevState.history.length, summary: summaryText, timestamp: new Date().toLocaleTimeString('vi-VN'), isoTimestamp: new Date().toISOString() }];
                 }
                 
                 // 3. Update core state
                 newState.plotChronicle = newPlotChronicle;
                 newState.presentNpcIds = presentNpcIds;
                 newState.totalTokens += totalTokens || 0;
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
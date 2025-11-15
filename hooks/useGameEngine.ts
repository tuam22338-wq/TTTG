import { useState, useCallback, useEffect, useRef } from 'react';
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
    NPC,
    Weather,
    StatType,
    CharacterStat,
    ChronicleEntry,
    ParsedAction,
    WorldEvent,
    Settings,
    CustomScenario,
    ScenarioActionType,
    ScenarioConditionType,
    WorldRule,
} from '../types';
import * as GeminiStorytellerService from '../services/GeminiStorytellerService';
import * as GameSaveService from '../services/GameSaveService';
import { GoogleGenAI } from '@google/genai';
import { ApiClient } from '../services/gemini/client';
import * as client from '../services/gemini/client';
import { allPredefinedItems } from '../services/predefinedItems';

const INITIAL_AI_SETTINGS: AiSettings = {
    isLogicModeOn: true,
    lustModeFlavor: null,
    isConscienceModeOn: false,
    isStrictInterpretationOn: false,
    destinyCompassMode: 'NORMAL',
    npcMindset: 'DEFAULT',
    flowOfDestinyInterval: 3,
    authorsMandate: [],
    isTurnBasedCombat: true,
    writingStyle: 'descriptive',
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
    settings: Settings,
) {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newlyAcquiredSkill, setNewlyAcquiredSkill] = useState<Skill | null>(null);
    const [itemsReceived, setItemsReceived] = useState<Item[]>([]);
    const [showIntroductoryModal, setShowIntroductoryModal] = useState(false);
    const hasInitialized = useRef(false);
    
    const { aiModelSettings, masterSafetySwitch, safety } = settings;

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
                summaryText,
                initialInventory,
            } = await GeminiStorytellerService.initializeStory(worldState, apiClient, aiModelSettings, masterSafetySwitch, safety);

            const initialCoreStats = getInitialCoreStats(worldState);

            const summaryEmbedding = await client.callEmbeddingModel(summaryText, apiClient);
            const initialChronicleEntry: ChronicleEntry = {
                turnNumber: 1,
                summary: summaryText,
                timestamp: new Date().toLocaleTimeString('vi-VN'),
                isoTimestamp: new Date().toISOString(),
                embedding: summaryEmbedding,
            };
            
            const newGameState: GameState = {
                worldContext: worldState,
                history: [initialTurn],
                playerStats: {},
                playerStatOrder: [],
                playerTitle: '',
                npcs: [],
                playerSkills: initialPlayerSkills || [],
                plotChronicle: '',
                presentNpcIds: [],
                totalTokens: initialTurn.tokenCount || 0,
                requestCount: 1,
                aiSettings: INITIAL_AI_SETTINGS,
                coreStats: initialCoreStats,
                cultivation: { level: 1, exp: 0, expToNextLevel: 100 },
                inventory: { items: [], capacity: 50, maxWeight: 25 },
                equipment: { WEAPON: null, HEAD: null, CHEST: null, LEGS: null, HANDS: null, FEET: null },
                chronicle: [initialChronicleEntry],
                time: { day: 1, hour: 8, minute: 0, season: 'Xuân', weather: 'Quang đãng' },
                isInCombat: false,
                combatants: [],
                codex: [],
                pendingNarrativeEvents: [],
                worldTickCounter: 0,
                pendingWorldEvents: [],
                triggers: [],
                pendingNotifications: [],
                customScenarios: worldState.customScenarios || [],
                truthLedger: [],
            };

            // Apply initial updates
            const withStats = applyStatChanges(newGameState, initialPlayerStatChanges, 'PLAYER');
            const withNpcs = applyNpcUpdates(withStats, initialNpcUpdates);
            
            setGameState(withNpcs);

        } catch (e: any) {
            console.error("Lỗi khởi tạo game:", e);
            setError(e.message || "Đã xảy ra lỗi không xác định khi bắt đầu câu chuyện.");
        } finally {
            setIsLoading(false);
        }
    }, [apiClient, aiModelSettings, masterSafetySwitch, safety]);

    useEffect(() => {
        if (hasInitialized.current) {
            return;
        }
        if ('history' in initialData) {
            // It's a saved GameState
            setGameState(initialData as GameState);
            setIsLoading(false);
            hasInitialized.current = true;
        } else {
            // It's WorldCreationState for a new game
            hasInitialized.current = true;
            initializeGame(initialData as WorldCreationState);
            setShowIntroductoryModal(true);
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
                            goal: null,
                            currentLocation: 'Unknown',
                            affinity: 50,
                            memory: '',
                            hiddenMotive: null,
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

    const runWorldTick = async (currentState: GameState): Promise<GameState> => {
        const npcsWithGoals = currentState.npcs.filter(npc => npc.goal);
        if (npcsWithGoals.length === 0) {
            return currentState; // No one to simulate
        }

        try {
            console.log("Simulating NPC actions...");
            const simulatedActions = await GeminiStorytellerService.simulateNpcActions(
                npcsWithGoals,
                apiClient,
                aiModelSettings,
                masterSafetySwitch,
                safety
            );

            let newNpcs = [...currentState.npcs];
            let newPendingEvents: WorldEvent[] = [...currentState.pendingWorldEvents];

            simulatedActions.forEach(action => {
                const npcIndex = newNpcs.findIndex(n => n.id === action.npcId);
                if (npcIndex !== -1) {
                    // Update NPC state
                    if (action.newLocation) newNpcs[npcIndex].currentLocation = action.newLocation;
                    if (action.newStatus) newNpcs[npcIndex].status = action.newStatus;
                    
                    // Create a world event from the simulation
                    const newEvent: WorldEvent = {
                        id: `event_${Date.now()}_${action.npcId}`,
                        type: 'WORLD_NARRATIVE',
                        description: `Có tin tức về ${newNpcs[npcIndex].name}: ${action.action}`,
                        relatedEntityId: action.npcId,
                    };
                    newPendingEvents.push(newEvent);
                }
            });

            console.log("NPC simulation complete. New events:", newPendingEvents);
            return { ...currentState, npcs: newNpcs, pendingWorldEvents: newPendingEvents };

        } catch (error) {
            console.error("Failed to run world tick simulation:", error);
            return currentState; // Return original state on error
        }
    };

    const executeScenario = (scenarioId: string) => {
        setGameState(prevState => {
            if (!prevState) return null;
            const scenario = prevState.customScenarios.find(s => s.id === scenarioId);
            if (!scenario) {
                console.warn(`Attempted to execute non-existent scenario: ${scenarioId}`);
                return prevState;
            }

            console.log(`Executing scenario: ${scenario.name}`);
            let newState = { ...prevState };

            // 1. Check Conditions
            for (const condition of scenario.conditions) {
                let conditionMet = false;
                switch (condition.type) {
                    case 'PLAYER_HAS_ITEM':
                        if (condition.payload.itemId) {
                            conditionMet = newState.inventory.items.some(i => i.id === condition.payload.itemId);
                        }
                        break;
                    // ... other condition types
                }
                if (!conditionMet) {
                    console.log(`Scenario '${scenario.name}' failed condition check: ${condition.type}`);
                    return prevState; // Abort if any condition fails
                }
            }

            // 2. Execute Actions
            for (const action of scenario.actions) {
                switch (action.type) {
                    case 'SHOW_NOTIFICATION':
                        if (action.payload.message) {
                            newState.pendingNotifications = [...newState.pendingNotifications, action.payload.message];
                        }
                        break;
                    case 'GIVE_ITEM':
                        if (action.payload.itemId) {
                            const itemToAdd = allPredefinedItems.find(i => i.id === action.payload.itemId);
                            if (itemToAdd) {
                                newState.inventory.items = [...newState.inventory.items, itemToAdd];
                            }
                        }
                        break;
                    // ... other action types
                }
            }
            console.log(`Scenario '${scenario.name}' executed successfully.`);
            return newState;
        });
    };
    
    const processCodexEntries = async (storyText: string, currentState: GameState): Promise<WorldRule[]> => {
        const codexRegex = /\[HN\](.*?)\[\/HN\]/g;
        const newTerms = new Set<string>();
        let match;
        while ((match = codexRegex.exec(storyText)) !== null) {
            const term = match[1].trim();
            if (term) {
                const isExisting = currentState.codex.some(entry => entry.name.toLowerCase() === term.toLowerCase()) ||
                                   currentState.worldContext.initialLore.some(entry => entry.name.toLowerCase() === term.toLowerCase());
                if (!isExisting) {
                    newTerms.add(term);
                }
            }
        }
    
        if (newTerms.size === 0) {
            return [];
        }
    
        try {
            const storyContext = currentState.history.slice(-5).map(t => t.storyText).join('\n');
            const newEntriesData = await GeminiStorytellerService.generateCodexEntries(
                Array.from(newTerms),
                storyContext,
                apiClient,
                aiModelSettings
            );
    
            return newEntriesData.map(entry => ({
                id: `codex_${Date.now()}_${entry.name.replace(/\s+/g, '_')}`,
                ...entry
            }));
        } catch (error) {
            console.error("Failed to generate codex entries:", error);
            return []; // Return empty array on failure to not break the game flow
        }
    };

    const processTurn = async (choice: string, isRewrite: boolean = false, isCorrection: boolean = false) => {
        if (!gameState || !apiClient.getApiClient()) {
            setError("Trạng thái game hoặc dịch vụ AI không hợp lệ.");
            return;
        }
        setIsLoading(true);
        setError(null);

        let tempState = { ...gameState };

        // --- World Simulation ---
        const tickInterval = tempState.aiSettings.flowOfDestinyInterval;
        let shouldTriggerWorldTurn = false;
        let eventToProcess: WorldEvent | undefined = undefined;

        if (tickInterval !== null && tickInterval > 0 && !isRewrite && !isCorrection) {
            const newTickCounter = tempState.worldTickCounter + 1;
            if (newTickCounter >= tickInterval) {
                tempState = await runWorldTick(tempState); // now async
                tempState.worldTickCounter = 0; // Reset counter
            } else {
                tempState.worldTickCounter = newTickCounter;
            }
        }

        if (tempState.pendingWorldEvents.length > 0) {
            shouldTriggerWorldTurn = true;
            eventToProcess = tempState.pendingWorldEvents[0];
            tempState.pendingWorldEvents = tempState.pendingWorldEvents.slice(1);
        }
        
        // --- End Simulation ---

        const logicResultSummary = tempState.pendingNarrativeEvents.join('\n');

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
            return { ...prevState, history, pendingNarrativeEvents: [] };
        });
        
        try {
            let fullResponseJsonString = '';

            const onChunk = (chunk: string) => {
                fullResponseJsonString += chunk;

                // Fragile parsing of streaming JSON to get storyText for UI updates
                try {
                    const storyTextMatch = fullResponseJsonString.match(/"storyText"\s*:\s*"((?:[^"\\]|\\.)*)/);
                    if (storyTextMatch && storyTextMatch[1]) {
                        const currentStoryText = JSON.parse(`"${storyTextMatch[1]}"`);
                        setGameState(prevState => {
                            if (!prevState) return null;
                            const newHistory = [...prevState.history];
                            const lastTurn = newHistory[newHistory.length - 1];
                            if (lastTurn) {
                                lastTurn.storyText = currentStoryText;
                            }
                            return { ...prevState, history: newHistory };
                        });
                    }
                } catch (e) {
                    // Ignore parsing errors during streaming, they will be handled at the end.
                }
            };

            const response = await GeminiStorytellerService.continueStory(
                tempState, choice, logicResultSummary, apiClient,
                tempState.aiSettings,
                isRewrite, shouldTriggerWorldTurn, isCorrection, tempState.coreStats,
                aiModelSettings, masterSafetySwitch, safety, onChunk, eventToProcess
            );
            
            // --- Post-Response Processing ---
            if (response.functionCalls && response.functionCalls.length > 0) {
                response.functionCalls.forEach(call => {
                    if (call.name === 'triggerCustomScenario' && call.args.scenarioId) {
                        executeScenario(call.args.scenarioId as string);
                    }
                });
            }

            const newCodexEntries = await processCodexEntries(response.newTurn.storyText, gameState);


            const summaryEmbedding = (isRewrite || !response.summaryText) 
                ? null 
                : await client.callEmbeddingModel(response.summaryText, apiClient);

            setGameState(prevState => {
                 if (!prevState) return null;
                 
                 let newState: GameState = { ...prevState, ...tempState }; // Apply intermediate state from simulation

                 // 1. Apply stat & NPC updates
                 newState = applyStatChanges(newState, response.playerStatChanges, 'PLAYER');
                 newState = applyNpcUpdates(newState, response.npcUpdates);
                 
                 // 2. Update history and chronicle with the final, complete turn data
                 const finalHistory = [...prevState.history];
                 finalHistory[finalHistory.length - 1] = response.newTurn;
                 newState.history = finalHistory;

                 if (!isRewrite && summaryEmbedding && response.summaryText) {
                     newState.chronicle = [...prevState.chronicle, { 
                         turnNumber: prevState.history.length, 
                         summary: response.summaryText, 
                         timestamp: new Date().toLocaleTimeString('vi-VN'), 
                         isoTimestamp: new Date().toISOString(),
                         embedding: summaryEmbedding
                     }];
                 }

                 if (newCodexEntries.length > 0) {
                    newState.codex = [...newState.codex, ...newCodexEntries];
                 }
                 
                 // 3. Update core state
                 newState.playerTitle = response.playerTitle || prevState.playerTitle;
                 newState.presentNpcIds = response.presentNpcIds;
                 newState.totalTokens += response.totalTokens || 0;
                 newState.requestCount += 1;
                 
                if (response.factsToRecord && response.factsToRecord.length > 0) {
                    newState.truthLedger = [...new Set([...newState.truthLedger, ...response.factsToRecord])];
                }

                 // 4. Handle Experience and Leveling
                if (response.expGained > 0) {
                    let newExp = newState.cultivation.exp + response.expGained;
                    let newLevel = newState.cultivation.level;
                    let newExpToNext = newState.cultivation.expToNextLevel;

                    while (newExp >= newExpToNext) {
                        newExp -= newExpToNext;
                        newLevel += 1;
                        // Simple scaling formula for next level's XP requirement
                        newExpToNext = Math.floor(newExpToNext * 1.5); 
                    }

                    newState.cultivation = {
                        level: newLevel,
                        exp: newExp,
                        expToNextLevel: newExpToNext,
                    };
                }

                 // 5. Handle time and environment
                 const newMinutes = prevState.time.minute + response.timeElapsed;
                 const newHour = prevState.time.hour + Math.floor(newMinutes / 60);
                 const newDay = prevState.time.day + Math.floor(newHour / 24);
                 
                 newState.time = {
                     ...prevState.time,
                     minute: newMinutes % 60,
                     hour: newHour % 24,
                     day: newDay
                 };

                 if (response.weatherChange) {
                    newState.time.weather = response.weatherChange;
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

                 // 6. Apply core stat changes from AI
                if (response.coreStatsChanges) {
                    newState.coreStats = { ...newState.coreStats, ...response.coreStatsChanges };
                    // Ensure current resource values do not exceed their new maximums
                    if (response.coreStatsChanges.sinhLucToiDa !== undefined) newState.coreStats.sinhLuc = Math.min(newState.coreStats.sinhLuc, newState.coreStats.sinhLucToiDa);
                    if (response.coreStatsChanges.linhLucToiDa !== undefined) newState.coreStats.linhLuc = Math.min(newState.coreStats.linhLuc, newState.coreStats.linhLucToiDa);
                    if (response.coreStatsChanges.theLucToiDa !== undefined) newState.coreStats.theLuc = Math.min(newState.coreStats.theLuc, newState.coreStats.theLucToiDa);
                    if (response.coreStatsChanges.doNoToiDa !== undefined) newState.coreStats.doNo = Math.min(newState.coreStats.doNo, newState.coreStats.doNoToiDa);
                    if (response.coreStatsChanges.doNuocToiDa !== undefined) newState.coreStats.doNuoc = Math.min(newState.coreStats.doNuoc, newState.coreStats.doNuocToiDa);
                }

                // 7. Apply full skill list update from AI
                if (response.playerSkills) {
                    newState.playerSkills = response.playerSkills;
                }


                 GameSaveService.saveAutoSave(newState);
                 
                 return newState;
            });

            if (response.newlyAcquiredSkill) {
                setNewlyAcquiredSkill(response.newlyAcquiredSkill);
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
    
            const statName = `Lĩnh ngộ: ${skill.name}`;
            const newStat: CharacterStat = {
                description: `Bạn đã học được một kỹ năng mới! Chi tiết đã được thêm vào sổ tay kỹ năng của bạn.`,
                type: StatType.GOOD,
            };
    
            const newPlayerStats = { ...prev.playerStats, [statName]: newStat };
            const newPlayerStatOrder = [...prev.playerStatOrder];
            if (!newPlayerStatOrder.includes(statName)) {
                newPlayerStatOrder.push(statName);
            }
    
            return {
                ...prev,
                playerStats: newPlayerStats,
                playerStatOrder: newPlayerStatOrder,
                playerSkills: [...prev.playerSkills, skill]
            };
        });
    };
    
    const executeEntityAction = async (target: EntityTarget, action: StatAction, scopes: StatScopes, directive?: string, newPersonality?: string): Promise<boolean> => {
        if (!gameState || !apiClient.getApiClient()) {
            setError("Hành động thất bại: Game hoặc AI chưa sẵn sàng.");
            return false;
        }
        
        setIsLoading(true);
        setError(null); // Clear previous error before trying
        
        try {
            if (action === 'SANITIZE') {
                console.log("Sanitizing game state...");
                // FIX: Added await to the GeminiStorytellerService call. The function is async.
                const { playerStatChanges, npcUpdates } = await GeminiStorytellerService.sanitizeGameState(gameState, apiClient, aiModelSettings, masterSafetySwitch, safety);

                setGameState(prevState => {
                    if (!prevState) return null;
                    let newState = { ...prevState };
                    newState = applyStatChanges(newState, playerStatChanges, 'PLAYER');
                    npcUpdates.forEach(npcUpdate => {
                        newState = applyStatChanges(newState, npcUpdate.statsChanges, npcUpdate.id);
                    });
                    console.log("Sanitization complete. Game state updated.");
                    return newState;
                });

                alert("Đã cố gắng làm sạch và tối ưu hóa dữ liệu game. Lỗi đã được xóa. Vui lòng thử lại hành động trước đó hoặc tiếp tục chơi.");
                return true; // Indicate success
            } else {
                console.warn(`Action ${action} is not implemented yet.`);
                return false;
            }
        } catch (e: any) {
            console.error("Lỗi khi thực thi hành động thực thể:", e);
            setError(`Lỗi khi tối ưu hóa: ${e.message}`);
            return false; // Indicate failure
        } finally {
            setIsLoading(false);
        }
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

    const addNarrativeEvent = useCallback((event: string) => {
        setGameState(prev => {
            if (!prev) return null;
            return {
                ...prev,
                pendingNarrativeEvents: [...(prev.pendingNarrativeEvents || []), event],
            };
        });
    }, []);

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
        setError,
        addNarrativeEvent,
    };
}
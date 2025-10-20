import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
// FIX: Changed CharacterStatUpdate to CharacterStat, which is the correct exported type.
import { WorldCreationState, GameState, GameTurn, NPCUpdate, CharacterStat, NPC, Skill, LustModeFlavor, NpcMindset, DestinyCompassMode, StatChanges, CharacterStats, EntityTarget, Item, CharacterCoreStats, Combatant, AiModelSettings, SafetySettings, AttributeType, Weather } from '../types';
import * as schemas from './gemini/schemas';
import * as client from './gemini/client';
// FIX: Changed from a direct file reference to importing named exports from the module.
import * as prompts from './prompt-engineering/corePrompts';
import { getPerspectiveRules } from './prompt-engineering/perspectiveRules';
import { getDestinyCompassRules } from './prompt-engineering/destinyCompassRules';
import { getSituationalRules, getCombatSystemRules } from './prompt-engineering/situationalRules';
import { getFlowOfDestinyRules } from './prompt-engineering/flowOfDestinyRules';
import { getWorldRulesPrompt } from './prompt-engineering/worldRules';
import { predefinedEquipment } from './predefinedItems';

const itemListString = predefinedEquipment.map(item => `- ${item.id}: ${item.name}`).join('\n');

const getSafetySettings = (safety: SafetySettings) => {
    switch (safety.level) {
        case 'BLOCK_NONE':
            return [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ];
        case 'BLOCK_ONLY_HIGH':
            return [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            ];
        case 'BLOCK_MEDIUM_AND_ABOVE':
             return [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            ];
        case 'BLOCK_MOST':
             return [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MOST },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MOST },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MOST },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MOST },
            ];
        default:
            return undefined;
    }
};


// --- CORE LOGIC ---

export async function generateWorldFromPrompt(
    userIdea: string,
    isNsfw: boolean,
    apiClient: client.ApiClient,
    aiModelSettings: AiModelSettings,
    safetySettings: SafetySettings
): Promise<Partial<WorldCreationState>> {
    const nsfwInstruction = isNsfw
        ? "Quan trọng: Bối cảnh này có yếu tố 18+ (NSFW). Hãy sáng tạo các yếu tố nhân vật, phe phái, và bối cảnh phản ánh sự trưởng thành, phức tạp, và có thể bao gồm các chủ đề nhạy cảm một cách tinh tế."
        : "Giữ cho bối cảnh phù hợp với mọi lứa tuổi.";

    const prompt = `
Bạn là một AI Sáng tạo Thế giới chuyên nghiệp cho game nhập vai. Dựa trên ý tưởng cốt lõi của người dùng, hãy xây dựng một thế giới hoàn chỉnh và trả về dưới dạng một đối tượng JSON.

**Ý tưởng cốt lõi từ người dùng:**
---
${userIdea}
---

**Nhiệm vụ của bạn:**
1.  **Phát triển Ý tưởng:** Mở rộng ý tưởng trên thành một thế giới có chiều sâu.
2.  **Tạo các thực thể:**
    *   **Genre:** Xác định thể loại chính của thế giới (VD: Tiên hiệp, Huyền huyễn đô thị, Tận thế).
    *   **Description:** Viết một mô tả chi tiết về thế giới, bao gồm lịch sử, các thế lực chính, và bối cảnh hiện tại.
    *   **Character:** Tạo một nhân vật chính phù hợp với thế giới, bao gồm tên, giới tính (chỉ 'Nam' hoặc 'Nữ'), tính cách, tiểu sử, và 2-3 kỹ năng khởi đầu.
    *   **Initial Factions:** Tạo 2-3 phe phái/thế lực ban đầu có liên quan đến cốt truyện.
    *   **Initial NPCs:** Tạo 2-3 NPC ban đầu thú vị. Nếu NPC thuộc một phe phái, hãy dùng ID tự tạo (VD: 'faction_1', 'faction_2') và đảm bảo các ID này nhất quán.
3.  **${nsfwInstruction}**
4.  **Định dạng JSON:** Trả về một đối tượng JSON duy nhất tuân thủ schema đã cung cấp.

Hãy bắt đầu sáng tạo.`;

    const worldGenModelSettings: AiModelSettings = {
        ...aiModelSettings,
        maxOutputTokens: 8192, // Increase token limit for complex world generation.
    };

    const { parsed: aiResponse } = await client.callJsonAI(prompt, schemas.quickAssistSchema, apiClient, worldGenModelSettings, getSafetySettings(safetySettings));
    
    const generatedFactions = (aiResponse.initialFactions || []).map((faction: any, index: number) => ({
        ...faction,
        id: `faction_${index + 1}_${Date.now()}`
    }));

    const factionIdMap = new Map(generatedFactions.map((f: any, i: number) => [ `faction_${i+1}`, f.id ]));

    const generatedNpcs = (aiResponse.initialNpcs || []).map((npc: any, index: number) => ({
        ...npc,
        id: `npc_${index + 1}_${Date.now()}`,
        factionId: factionIdMap.get(npc.factionId) || 'independent'
    }));
    
    const generatedSkills = (aiResponse.character.skills || []).map((skill: any, index: number) => ({
        ...skill,
        id: `skill_${index + 1}_${Date.now()}`
    }));
    
    const generatedCharacter = {
        ...aiResponse.character,
        customGender: '',
        skills: generatedSkills
    };

    if (generatedCharacter.gender !== 'Nam' && generatedCharacter.gender !== 'Nữ') {
        generatedCharacter.gender = 'Nam';
    }

    return {
        genre: aiResponse.genre,
        description: aiResponse.description,
        character: generatedCharacter,
        initialFactions: generatedFactions,
        initialNpcs: generatedNpcs,
    };
}


export async function generateSkillFromUserInput(
    name: string,
    description: string,
    worldContext: WorldCreationState,
    apiClient: client.ApiClient,
    aiModelSettings: AiModelSettings,
    safetySettings: SafetySettings
): Promise<Skill> {
    const prompt = prompts.SKILL_GENERATOR_FROM_USER_PROMPT
        .replace('{WORLD_CONTEXT_PLACEHOLDER}', worldContext.description)
        .replace('{SKILL_NAME_PLACEHOLDER}', name)
        .replace('{SKILL_DESCRIPTION_PLACEHOLDER}', description);

    const { parsed: skill } = await client.callJsonAI(prompt, schemas.skillSchema, apiClient, aiModelSettings, getSafetySettings(safetySettings));

    // Ensure the name matches the user's input, as the AI might change it slightly.
    skill.name = name;

    return skill as Skill;
}


export async function generateSkillFromStat(
    statName: string, 
    worldContext: WorldCreationState, 
    apiClient: client.ApiClient,
    aiModelSettings: AiModelSettings,
    safetySettings: SafetySettings
): Promise<Skill> {
    const prompt = prompts.SKILL_GENERATOR_PROMPT
        .replace('{WORLD_CONTEXT_PLACEHOLDER}', worldContext.description)
        .replace('{STAT_NAME_PLACEHOLDER}', statName);
    
    const { parsed: skill } = await client.callJsonAI(prompt, schemas.skillSchema, apiClient, aiModelSettings, getSafetySettings(safetySettings));

    // Ensure the name matches, sometimes AI might change it slightly
    skill.name = statName;

    return skill as Skill;
}

export async function initializeStory(
    worldState: WorldCreationState, 
    apiClient: client.ApiClient,
    aiModelSettings: AiModelSettings,
    safetySettings: SafetySettings
): Promise<{
    initialTurn: GameTurn;
    initialPlayerStatChanges: StatChanges;
    initialNpcUpdates: NPCUpdate[];
    initialPlayerSkills: Skill[];
    plotChronicle: string;
    presentNpcIds: string[];
    summaryText: string;
    initialInventory: string[]; // Changed from Item[]
}> {
    const { genre, description, character, isNsfw, narrativePerspective, initialFactions, initialNpcs, customAttributes, specialRules, initialLore } = worldState;
    const charGender = character.gender === 'Tự định nghĩa' ? character.customGender : character.gender;

    const perspectiveRules = getPerspectiveRules(narrativePerspective);
    const destinyCompassRules = getDestinyCompassRules('NORMAL');
    const combatSystemRules = getCombatSystemRules(true); // Initial state always assumes turn-based is possible
    const worldRulesPrompt = getWorldRulesPrompt(specialRules, initialLore);

    const systemPromptWithPerspective = prompts.CORE_LOGIC_SYSTEM_PROMPT
      .replace('{PERSPECTIVE_RULES_PLACEHOLDER}', perspectiveRules)
      .replace('{WORLD_RULES_PLACEHOLDER}', worldRulesPrompt)
      .replace('{DESTINY_COMPASS_RULES_PLACEHOLDER}', destinyCompassRules)
      .replace('{COMBAT_SYSTEM_RULES_PLACEHOLDER}', combatSystemRules)
      .replace('{FLOW_OF_DESTINY_RULES_PLACEHOLDER}', '') // No flow of destiny for the first turn
      .replace('{SITUATIONAL_RULES_PLACEHOLDER}', ''); // No situational rules for the first turn

    const skillsString = character.skills && character.skills.length > 0
        ? JSON.stringify(character.skills.map(({ id, ...rest }) => rest), null, 2)
        : "Không có";

    // Filter to only send relevant attributes to the AI, not core combat stats.
    const informationalAttributes = customAttributes.filter(attr => attr.type === AttributeType.INFORMATIONAL || attr.type === AttributeType.HIDDEN);
    const customAttributesString = informationalAttributes.length > 0
        ? JSON.stringify(informationalAttributes.map(({ name, description, baseValue }) => ({ name, description, baseValue })), null, 2)
        : "Không có";

    const factionsString = initialFactions && initialFactions.length > 0
        ? JSON.stringify(initialFactions.map(({ id, ...rest }) => rest), null, 2)
        : "Không có";
        
    const npcsString = initialNpcs && initialNpcs.length > 0
        ? JSON.stringify(initialNpcs.map(({ id, ...rest }) => rest), null, 2)
        : "Không có";

    const userPrompt = `
### THÙY 4: KÝ ỨC & BỐI CẢNH (MEMORY & CONTEXT LOBE) ###
Đây là toàn bộ thông tin bạn cần để tạo ra lượt truyện đầu tiên.

**4.1. TẦNG KÝ ỨC DÀI HẠN (NỀN TẢNG):**
- **Nền tảng Thế giới:** Thể loại: ${genre || "Không có"}, Bối cảnh: ${description}
- **Thông tin Nhân vật chính:** Tên: ${character.name}, Giới tính: ${charGender}, Tính cách: ${character.personality}, Tiểu sử: ${character.biography}
- **Kỹ năng khởi đầu (dạng văn bản):** ${skillsString}
- **Hệ thống Thuộc tính Tùy chỉnh:** ${customAttributesString}
- **Thế lực khởi đầu:** ${factionsString}
- **NPC khởi đầu:** ${npcsString}

**4.2. TRẠNG THÁI HIỆN TẠI (SỰ THẬT TUYỆT ĐỐI):**
- **Danh sách Vật phẩm Tham khảo:** ${itemListString}

**4.3. Ý CHÍ NGƯỜI CHƠI (HÀNH ĐỘNG HIỆN TẠI):**
Bắt đầu cuộc phiêu lưu.
`;
    const fullPrompt = systemPromptWithPerspective + '\n\n' + userPrompt;

    const initialModelSettings: AiModelSettings = {
        ...aiModelSettings,
        maxOutputTokens: 8192, // Use a larger token limit for the very first, complex story generation call.
    };

    console.debug("Initializing story with custom token limit:", initialModelSettings.maxOutputTokens);

    const { parsed: aiResponse, response: result } = await client.callJsonAI(fullPrompt, schemas.coreLogicSchema, apiClient, initialModelSettings, getSafetySettings(safetySettings));

    return {
        initialTurn: {
            playerAction: null,
            storyText: aiResponse.storyText,
            statusNarration: aiResponse.statusNarration,
            choices: aiResponse.choices,
            tokenCount: result.candidates?.[0].tokenCount,
            omniscientInterlude: aiResponse.omniscientInterlude,
        },
        initialPlayerStatChanges: aiResponse.playerStatChanges || { statsToUpdate: [], statsToDelete: [] },
        initialNpcUpdates: aiResponse.npcUpdates || [],
        initialPlayerSkills: aiResponse.playerSkills || [],
        plotChronicle: aiResponse.summaryText || '',
        presentNpcIds: aiResponse.presentNpcIds || [],
        summaryText: aiResponse.summaryText || '',
        initialInventory: aiResponse.initialInventory || [],
    };
}

export async function continueStory(
    gameState: GameState,
    choice: string,
    apiClient: client.ApiClient,
    isLogicModeOn: boolean,
    lustModeFlavor: LustModeFlavor | null,
    npcMindset: NpcMindset,
    isConscienceModeOn: boolean,
    isStrictInterpretationOn: boolean,
    destinyCompassMode: DestinyCompassMode,
    isRewrite: boolean,
    shouldTriggerWorldTurn: boolean,
    isCorrection: boolean,
    finalCoreStats: CharacterCoreStats,
    authorsMandate: string[],
    isTurnBasedCombat: boolean,
    aiModelSettings: AiModelSettings,
    safetySettings: SafetySettings,
    onChunk: (chunk: string) => void
): Promise<{
    newTurn: GameTurn;
    playerStatChanges: StatChanges;
    npcUpdates: NPCUpdate[];
    newlyAcquiredSkill: Skill | null;
    newPlotChronicle: string;
    presentNpcIds: string[];
    summaryText: string;
    itemsReceived: string[]; // Changed from Item[]
    timeElapsed: number;
    nsfwSceneStateChange: 'ENTER' | 'EXIT' | 'NONE';
    expGained: number;
    coreStatsChanges: Partial<CharacterCoreStats> | null;
    weatherChange: Weather | null;
    isInCombat: boolean;
    combatantNpcIds: string[];
    totalTokens: number;
}> {
    const { worldContext, playerStats, npcs, playerSkills, plotChronicle, history, presentNpcIds } = gameState;

    const charGender = worldContext.character.gender === 'Tự định nghĩa' ? worldContext.character.gender : worldContext.character.gender;

    // Filter to only send relevant attributes to the AI, not core combat stats.
    const informationalAttributes = worldContext.customAttributes.filter(attr => attr.type === AttributeType.INFORMATIONAL || attr.type === AttributeType.HIDDEN);
    const customAttributesString = informationalAttributes.length > 0
        ? JSON.stringify(informationalAttributes.map(({ name, description, baseValue }) => ({ name, description, baseValue })), null, 2)
        : "Không có";

    const perspectiveRules = getPerspectiveRules(worldContext.narrativePerspective);
    const destinyCompassRules = getDestinyCompassRules(destinyCompassMode);
    const combatSystemRules = getCombatSystemRules(isTurnBasedCombat);
    let situationalRules = getSituationalRules(choice, isConscienceModeOn, lustModeFlavor, isStrictInterpretationOn, isLogicModeOn, npcMindset, isCorrection, authorsMandate);
    const flowOfDestinyRules = getFlowOfDestinyRules(shouldTriggerWorldTurn, choice);
    const worldRulesPrompt = getWorldRulesPrompt(worldContext.specialRules, worldContext.initialLore);

    const approximateWordCount = Math.floor(aiModelSettings.maxOutputTokens / 1.5);
    // Use a higher multiplier to get closer to the user's desired length, while leaving some buffer for JSON.
    const targetStoryWordCount = Math.max(150, Math.floor(approximateWordCount * 0.9));
    
    const lengthInstruction = `
**QUY TẮC ĐỘ DÀI TƯỜNG THUẬT (STORY LENGTH RULE - MỆNH LỆNH TỐI THƯỢNG):**
Bạn BẮT BUỘC phải viết một đoạn \`storyText\` có độ dài **TỐI THIỂU LÀ ${targetStoryWordCount} từ**. Đây là yêu cầu quan trọng nhất, ghi đè lên các quy tắc khác về sự ngắn gọn.
- **LÀM THẾ NÀO ĐỂ ĐẠT ĐƯỢC:** Hãy đi sâu vào chi tiết. Mô tả môi trường, đi sâu vào suy nghĩ và cảm xúc nội tâm của nhân vật, kéo dài các đoạn hội thoại, và thêm các hành động hoặc mô tả phụ để làm phong phú thêm cảnh.
- **KHÔNG VIẾT NGẮN:** TUYỆT ĐỐI không được viết một đoạn tường thuật ngắn hơn độ dài yêu cầu này. Nếu cần, hãy tự sáng tạo thêm tình tiết phụ để kéo dài câu chuyện.
`;

    if (situationalRules) {
        situationalRules += '\n\n---\n\n' + lengthInstruction;
    } else {
        situationalRules = lengthInstruction;
    }

    const systemPrompt = prompts.CORE_LOGIC_SYSTEM_PROMPT
        .replace('{PERSPECTIVE_RULES_PLACEHOLDER}', perspectiveRules)
        .replace('{WORLD_RULES_PLACEHOLDER}', worldRulesPrompt)
        .replace('{DESTINY_COMPASS_RULES_PLACEHOLDER}', destinyCompassRules)
        .replace('{COMBAT_SYSTEM_RULES_PLACEHOLDER}', combatSystemRules)
        .replace('{FLOW_OF_DESTINY_RULES_PLACEHOLDER}', flowOfDestinyRules)
        .replace('{SITUATIONAL_RULES_PLACEHOLDER}', situationalRules);
    
    const presentNpcs = npcs.filter(npc => presentNpcIds?.includes(npc.id));
    const otherNpcsSummary = npcs
        .filter(npc => !presentNpcIds?.includes(npc.id))
        .map(({ id, name, relationship, status, lastInteractionSummary }) => ({ id, name, relationship, status, lastInteractionSummary }));

    const userPrompt = `
### THÙY 4: KÝ ỨC & BỐI CẢNH (MEMORY & CONTEXT LOBE) ###
Đây là toàn bộ thông tin bạn cần để đưa ra quyết định cho lượt truyện này.

**4.1. TẦNG KÝ ỨC DÀI HẠN (NỀN TẢNG & BIÊN NIÊN SỬ):**
- **Nền tảng Thế giới:** Thể loại: ${worldContext.genre || "Không có"}, Bối cảnh: ${worldContext.description}
- **Thông tin Nhân vật chính:** Tên: ${worldContext.character.name}, Giới tính: ${charGender}, Tính cách: ${worldContext.character.personality}, Tiểu sử: ${worldContext.character.biography}
- **Hệ thống Thuộc tính Tùy chỉnh:** ${customAttributesString}
- **Biên niên sử Cốt truyện:** ${plotChronicle || "Chưa có sự kiện nào đáng chú ý."}

**4.2. TẦNG KÝ ỨC NGẮN HẠN (BỐI CẢNH GẦN NHẤT):**
- **Lượt truyện cuối:** ${history.length > 0 ? history[history.length - 1].storyText : "Đây là lượt đầu tiên."}
- **NPC đang có mặt (CHI TIẾT):** ${presentNpcs.length > 0 ? JSON.stringify(presentNpcs, null, 2) : "Không có NPC nào có mặt."}
- **NPC khác đã biết (TÓM TẮT):** ${otherNpcsSummary.length > 0 ? JSON.stringify(otherNpcsSummary, null, 2) : "Không có."}
- **Kỹ năng Người chơi:** ${playerSkills.length > 0 ? JSON.stringify(playerSkills, null, 2) : "Chưa có kỹ năng nào."}

**4.3. TRẠNG THÁI HIỆN TẠI (SỰ THẬT TUYỆT ĐỐI):**
- **Trạng thái Người chơi (Chiến đấu & Cảnh giới):** ${JSON.stringify({ ...finalCoreStats, cultivation: gameState.cultivation }, null, 2)}
- **Trạng thái Người chơi (Hiệu ứng & Thuộc tính):** ${JSON.stringify(playerStats, null, 2)}
- **Danh sách Vật phẩm Tham khảo:** ${itemListString}

**4.4. Ý CHÍ NGƯỜI CHƠI (HÀNH ĐỘNG HIỆN TẠI):**
${choice}
`;

    let fullPrompt = systemPrompt + '\n\n' + userPrompt;
    const MAX_JSON_RETRIES = 2;

    for (let attempt = 0; attempt < MAX_JSON_RETRIES; attempt++) {
        let fullResponseText = '';
        let totalTokens = 0;
        
        try {
            const stream = await client.callJsonAIStream(fullPrompt, schemas.coreLogicSchema, apiClient, aiModelSettings, getSafetySettings(safetySettings));

            for await (const chunk of stream) {
                const chunkText = chunk.text;
                if (chunkText) {
                    fullResponseText += chunkText;
                    onChunk(chunkText);
                }
                if (chunk.candidates?.[0]?.tokenCount) {
                   totalTokens = chunk.candidates[0].tokenCount;
                }
            }
            
            if (!fullResponseText.trim()) {
                 throw new Error(`AI không trả về nội dung sau khi streaming. Có thể đã bị chặn vì lý do an toàn.`);
            }

            const logicAiResponse = client.parseAndValidateJsonResponse(fullResponseText);

            const presentNpcsForCreative = npcs.filter(npc => logicAiResponse.presentNpcIds?.includes(npc.id));
            if (presentNpcsForCreative.length > 0) {
                const creativeTextUserPrompt = `
**Bối cảnh (Đoạn truyện vừa diễn ra):**
${logicAiResponse.storyText}

**Danh sách NPC hiện diện và tóm tắt cũ:**
${presentNpcsForCreative.map(npc => `- ${npc.name} (id: ${npc.id}, tóm tắt cũ: "${npc.lastInteractionSummary}")`).join('\n')}
`;
                const creativeResult = await client.callCreativeTextAI(prompts.CREATIVE_TEXT_SYSTEM_PROMPT + '\n\n' + creativeTextUserPrompt, apiClient, aiModelSettings, getSafetySettings(safetySettings));
                const creativeData = client.parseNpcCreativeText(creativeResult.text);
                
                logicAiResponse.npcUpdates = (logicAiResponse.npcUpdates || []).map((update: NPCUpdate) => {
                    if ((update.action === 'UPDATE' || update.action === 'CREATE') && creativeData.has(update.id)) {
                        const creative = creativeData.get(update.id)!;
                        if (!update.payload) { 
                            // @ts-ignore
                            update.payload = {};
                         }
                        // @ts-ignore
                        update.payload.status = creative.status;
                        // @ts-ignore
                        update.payload.lastInteractionSummary = creative.lastInteractionSummary;
                    }
                    return update;
                });
            }

            const newPlotChronicle = isRewrite ? plotChronicle : (plotChronicle + '\n- ' + logicAiResponse.summaryText);

            return {
                newTurn: {
                    playerAction: choice,
                    storyText: logicAiResponse.storyText,
                    statusNarration: logicAiResponse.statusNarration,
                    choices: logicAiResponse.choices,
                    tokenCount: totalTokens,
                    omniscientInterlude: logicAiResponse.omniscientInterlude
                },
                playerStatChanges: logicAiResponse.playerStatChanges || { statsToUpdate: [], statsToDelete: [] },
                npcUpdates: logicAiResponse.npcUpdates || [],
                newlyAcquiredSkill: logicAiResponse.newlyAcquiredSkill || null,
                newPlotChronicle: newPlotChronicle,
                presentNpcIds: logicAiResponse.presentNpcIds || [],
                summaryText: logicAiResponse.summaryText,
                itemsReceived: logicAiResponse.itemsReceived || [],
                timeElapsed: logicAiResponse.timeElapsed || 10,
                nsfwSceneStateChange: logicAiResponse.nsfwSceneStateChange || 'NONE',
                expGained: logicAiResponse.expGained || 0,
                coreStatsChanges: logicAiResponse.coreStatsChanges || null,
                weatherChange: logicAiResponse.weatherChange || null,
                isInCombat: logicAiResponse.isInCombat || false,
                combatantNpcIds: logicAiResponse.combatantNpcIds || [],
                totalTokens: totalTokens,
            };

        } catch (error: any) {
            console.warn(`Attempt ${attempt + 1} failed in continueStory. Error: ${error.message}`);
            if (attempt === MAX_JSON_RETRIES - 1) {
                console.error("All retry attempts failed for continueStory.");
                throw new Error(`AI đã trả về một phản hồi JSON không hợp lệ sau nhiều lần thử. Lỗi: ${error.message}\n\nDữ liệu gốc từ AI:\n${fullResponseText}`);
            }

            fullPrompt = `${systemPrompt}\n\n${userPrompt}\n\n---SYSTEM NOTE---\nYour previous streaming response resulted in invalid JSON and caused a parsing error. This is a critical error. You MUST regenerate the entire response and ensure it is a single, complete, valid JSON object that strictly follows the provided schema. Pay close attention to escaping double quotes (\\") within strings.\n\nHere is the invalid/incomplete JSON you streamed:\n\`\`\`\n${fullResponseText || '(empty response)'}\n\`\`\``;
            console.log("Retrying continueStory with corrective prompt...");
        }
    }
    throw new Error("Lỗi logic trong cơ chế thử lại của continueStory.");
}

export async function generateDefeatStory(
    gameState: GameState,
    apiClient: client.ApiClient,
    aiModelSettings: AiModelSettings,
    safetySettings: SafetySettings
): Promise<{ newTurn: GameTurn; }> {
    const { worldContext, plotChronicle, history } = gameState;
    const charGender = worldContext.character.gender === 'Tự định nghĩa' ? worldContext.character.gender : worldContext.character.gender;

    const userPrompt = `
---
**TẦNG 1: NỀN TẢNG THẾ GIỚI**
**Bối cảnh:** ${worldContext.description}
**Nhân vật chính:** Tên: ${worldContext.character.name}, Giới tính: ${charGender}, Tính cách: ${worldContext.character.personality}, Tiểu sử: ${worldContext.character.biography}
---
**TẦNG 2: BIÊN NIÊN SỬ CỐT TRUYỆN**
${plotChronicle || "Chưa có sự kiện nào đáng chú ý."}
---
**TẦNG 3: BỐI CẢNH GẦN NHẤT**
**Lượt truyện cuối:**
${history.length > 0 ? history[history.length - 1].storyText : "Đây là lượt đầu tiên."}
**Trạng thái Người chơi (Chỉ số chiến đấu & Cảnh giới):**
${JSON.stringify({ ...gameState.coreStats }, null, 2)}
---
**SỰ KIỆN:** Người chơi vừa bị đánh bại trong một trận chiến không thể cứu vãn. HP của họ hiện là 0. Hãy viết về hậu quả của sự thất bại này một cách bi thảm nhưng vẫn mở ra con đường tiếp tục.
`;

    const fullPrompt = prompts.DEFEAT_SYSTEM_PROMPT + '\n\n' + userPrompt;

    const { parsed: aiResponse, response: result } = await client.callJsonAI(fullPrompt, schemas.coreLogicSchema, apiClient, aiModelSettings, getSafetySettings(safetySettings));

    return {
        newTurn: {
            playerAction: "Bị đánh bại.",
            storyText: aiResponse.storyText,
            choices: aiResponse.choices,
            tokenCount: result.candidates?.[0].tokenCount,
        }
    };
}

export async function refineEntityStats(
    statsToRefine: CharacterStats,
    worldContext: WorldCreationState,
    apiClient: client.ApiClient,
    aiModelSettings: AiModelSettings,
    safetySettings: SafetySettings
): Promise<StatChanges> {
    const prompt = prompts.STAT_REFINEMENT_SYSTEM_PROMPT
        .replace('{STATS_JSON_PLACEHOLDER}', JSON.stringify(statsToRefine, null, 2));

    const { parsed: changes } = await client.callJsonAI(prompt, schemas.statChangesSchema, apiClient, aiModelSettings, getSafetySettings(safetySettings));

    return changes as StatChanges;
}

export async function reconstructEntity(
    gameState: GameState,
    target: EntityTarget,
    directive: string,
    newPersonality: string | undefined,
    apiClient: client.ApiClient,
    aiModelSettings: AiModelSettings,
    safetySettings: SafetySettings
): Promise<StatChanges> {
    let coreInfo = '';
    let oldStats: CharacterStats = {};
    if (target === 'PLAYER') {
        coreInfo = JSON.stringify(gameState.worldContext.character, null, 2);
        oldStats = gameState.playerStats;
    } else {
        const npc = gameState.npcs.find(n => n.id === target);
        if (npc) {
            coreInfo = JSON.stringify({ ...npc, personality: newPersonality || npc.personality }, null, 2);
            oldStats = npc.stats || {};
        }
    }
    
    const prompt = prompts.ENTITY_RECONSTRUCTION_SYSTEM_PROMPT
        .replace('{ENTITY_CORE_INFO_PLACEHOLDER}', coreInfo)
        .replace('{PLOT_CHRONICLE_PLACEHOLDER}', gameState.plotChronicle)
        .replace('{OLD_STATS_LIST_PLACEHOLDER}', JSON.stringify(Object.keys(oldStats), null, 2))
        .replace('{USER_DIRECTIVE_PLACEHOLDER}', directive || 'Không có.');

    const { parsed: changes } = await client.callJsonAI(prompt, schemas.statChangesSchema, apiClient, aiModelSettings, getSafetySettings(safetySettings));

    return changes as StatChanges;
}

export async function sanitizeGameState(
    gameState: GameState,
    apiClient: client.ApiClient,
    aiModelSettings: AiModelSettings,
    safetySettings: SafetySettings
): Promise<{
    playerStatChanges: StatChanges;
    npcUpdates: { id: string; statsChanges: StatChanges }[];
    sanitizedPlotChronicle: string;
}> {
    const dataToSanitize = {
        playerStats: gameState.playerStats,
        npcs: gameState.npcs.map(npc => ({ id: npc.id, stats: npc.stats })),
        plotChronicle: gameState.plotChronicle,
    };

    const prompt = prompts.GAME_STATE_SANITIZATION_PROMPT
        .replace('{GAME_DATA_JSON_PLACEHOLDER}', JSON.stringify(dataToSanitize, null, 2));

    const { parsed: sanitizedData } = await client.callJsonAI(prompt, schemas.sanitizedGameStateSchema, apiClient, aiModelSettings, getSafetySettings(safetySettings));

    return sanitizedData;
}
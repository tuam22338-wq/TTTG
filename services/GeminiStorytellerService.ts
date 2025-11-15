import { GoogleGenAI, HarmCategory, HarmBlockThreshold, FunctionDeclaration, Type, FunctionCall, GenerateContentResponse } from '@google/genai';
import { WorldCreationState, GameState, GameTurn, NPCUpdate, CharacterStat, NPC, Skill, LustModeFlavor, NpcMindset, DestinyCompassMode, StatChanges, CharacterStats, EntityTarget, Item, CharacterCoreStats, Combatant, AiModelSettings, SafetySettings, AttributeType, Weather, TrainingDataSet, TrainingDataChunk, ChronicleEntry, ParsedAction, WorldEvent, WorldRule, AiSettings, SkillTarget } from '../types';
import * as schemas from './gemini/schemas';
import * as client from './gemini/client';
import * as prompts from './prompt-engineering/corePrompts';
import { getPerspectiveRules } from './prompt-engineering/perspectiveRules';
import { getDestinyCompassRules } from './prompt-engineering/destinyCompassRules';
import { getSituationalRules, getCombatSystemRules } from './prompt-engineering/situationalRules';
import { getFlowOfDestinyRules } from './prompt-engineering/flowOfDestinyRules';
import { getWorldRulesPrompt } from './prompt-engineering/worldRules';
import { predefinedEquipment } from './predefinedItems';
import * as StorageService from './StorageService';

const itemListString = predefinedEquipment.map(item => `- ${item.id}: ${item.name}`).join('\n');

const getSafetySettings = (masterSwitch: boolean, safetyConfig: SafetySettings) => {
    if (!masterSwitch) {
        return [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ];
    }
    
    const threshold = HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE;
    
    return [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: safetyConfig.blockHarassment ? threshold : HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: safetyConfig.blockHateSpeech ? threshold : HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: safetyConfig.blockSexuallyExplicit ? threshold : HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: safetyConfig.blockDangerousContent ? threshold : HarmBlockThreshold.BLOCK_NONE },
    ];
};


// --- HELPERS ---

function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) {
        return 0;
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] * vecA[i];
        magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
}

function findTopKChunks<T extends { embedding?: number[] }>(promptEmbedding: number[], chunks: T[], k: number = 3): T[] {
    if (chunks.length === 0) return [];

    const similarities = chunks
        .filter(chunk => chunk.embedding && chunk.embedding.length > 0)
        .map(chunk => ({
            chunk,
            similarity: cosineSimilarity(promptEmbedding, chunk.embedding!),
        }));

    similarities.sort((a, b) => b.similarity - a.similarity);

    return similarities.slice(0, k).map(item => item.chunk);
}

export async function simulateNpcActions(
    npcs: NPC[],
    apiClient: client.ApiClient,
    aiModelSettings: AiModelSettings,
    masterSafetySwitch: boolean,
    safety: SafetySettings
): Promise<{ npcId: string; action: string; newStatus?: string; newLocation?: string; }[]> {
    const npcsJson = JSON.stringify(npcs.map(({ id, name, personality, goal, currentLocation, status }) => ({ id, name, personality, goal, currentLocation, status })), null, 2);
    const prompt = prompts.NPC_SIMULATION_PROMPT.replace('{NPCS_JSON_PLACEHOLDER}', npcsJson);

    const { parsed } = await client.callJsonAI(
        prompt,
        schemas.npcSimulationUpdateSchema,
        apiClient,
        { ...aiModelSettings, temperature: 0.5 }, // Slightly creative for simulation
        getSafetySettings(masterSafetySwitch, safety)
    );

    return parsed;
}


// --- CORE LOGIC ---

export async function parsePlayerAction(
    action: string,
    inventory: Item[],
    skills: Skill[],
    presentNpcs: NPC[],
    apiClient: client.ApiClient,
    aiModelSettings: AiModelSettings
): Promise<ParsedAction> {
    const inventoryString = inventory.map(i => `- ${i.name} (id: ${i.id})`).join('\n') || "Không có";
    const skillsString = skills.map(s => `- ${s.name} (id: ${s.id})`).join('\n') || "Không có";
    const npcsString = presentNpcs.map(n => `- ${n.name} (id: ${n.id})`).join('\n') || "Không có";

    const prompt = prompts.ACTION_PARSER_PROMPT
        .replace('{INVENTORY_PLACEHOLDER}', inventoryString)
        .replace('{SKILLS_PLACEHOLDER}', skillsString)
        .replace('{NPCS_PLACEHOLDER}', npcsString)
        .replace('{ACTION_PLACEHOLDER}', action);
    
    // Use a faster, cheaper model for parsing
    const parserModelSettings: AiModelSettings = {
        ...aiModelSettings,
        model: 'gemini-2.5-flash',
        temperature: 0, // Be deterministic
        maxOutputTokens: 256,
        jsonBuffer: 100,
        thinkingBudget: 0,
    };

    const { parsed } = await client.callJsonAI(prompt, schemas.actionParserSchema, apiClient, parserModelSettings, []);
    return parsed as ParsedAction;
}


export async function generateWorldFromPromptWithKnowledge(
    userIdea: string,
    knowledgeBaseIds: string[],
    isNsfw: boolean,
    apiClient: client.ApiClient,
    aiModelSettings: AiModelSettings,
    masterSafetySwitch: boolean,
    safety: SafetySettings
): Promise<Partial<WorldCreationState>> {

    const allChunks: TrainingDataChunk[] = [];
    for (const id of knowledgeBaseIds) {
        const knowledgeBase = await StorageService.getTrainingSetById(id);
        if (knowledgeBase && knowledgeBase.chunks.length > 0) {
            allChunks.push(...knowledgeBase.chunks);
        }
    }

    if (allChunks.length === 0) {
        throw new Error("Không tìm thấy hoặc các bộ kiến thức nền được chọn bị rỗng.");
    }
    
    const promptEmbedding = await client.callEmbeddingModel(userIdea, apiClient);
    
    const topChunks = findTopKChunks(promptEmbedding, allChunks, 5);
    const knowledgeContext = topChunks.map((chunk, index) => `**Kiến thức tham khảo ${index + 1}:**\n${chunk.content}`).join('\n\n');

    const nsfwInstruction = isNsfw
        ? "Quan trọng: Bối cảnh này có yếu tố 18+ (NSFW). Hãy sáng tạo các yếu tố nhân vật, phe phái, và bối cảnh phản ánh sự trưởng thành, phức tạp, và có thể bao gồm các chủ đề nhạy cảm một cách tinh tế."
        : "Giữ cho bối cảnh phù hợp với mọi lứa tuổi.";

    const prompt = `
Bạn là một AI Sáng tạo Thế giới chuyên nghiệp cho game nhập vai. Dựa trên ý tưởng cốt lõi của người dùng VÀ các kiến thức nền được cung cấp, hãy xây dựng một thế giới hoàn chỉnh và trả về dưới dạng một đối tượng JSON.

**Kiến thức nền (Thông tin tham khảo có độ ưu tiên cao):**
---
${knowledgeContext}
---

**Ý tưởng cốt lõi từ người dùng:**
---
${userIdea}
---

**Nhiệm vụ của bạn:**
1.  **Tích hợp Kiến thức:** BẮT BUỘC phải sử dụng các thông tin trong phần "Kiến thức nền" làm cơ sở để phát triển ý tưởng của người dùng.
2.  **Tạo các thực thể:**
    *   **Genre:** Xác định thể loại chính của thế giới.
    *   **Description:** Viết một mô tả chi tiết về thế giới.
    *   **Character:** Tạo một nhân vật chính phù hợp với thế giới.
    *   **Initial Factions:** Tạo 2-3 phe phái/thế lực ban đầu.
    *   **Initial NPCs:** Tạo 2-3 NPC ban đầu thú vị.
    *   **Custom Attributes (QUAN TRỌNG):** Sáng tạo 2-3 thuộc tính tùy chỉnh (ngoài các chỉ số chiến đấu cơ bản) mang tính đặc trưng cho thế giới này (VD: trong thế giới cyberpunk, có thể là 'Uy tín đường phố' hoặc 'Lòng trung thành với tập đoàn'). Cung cấp đầy đủ các trường \`id\`, \`name\`, \`description\`, \`type\`, \`icon\`, và \`baseValue\`.
    *   **Special Rules (QUAN TRỌNG):** Sáng tạo 1-2 quy luật đặc biệt để làm thế giới thêm độc đáo (VD: 'Ma thuật bị cấm trong thành phố', 'Mọi giao dịch đều phải dùng máu').
3.  **${nsfwInstruction}**
4.  **Định dạng JSON:** Trả về một đối tượng JSON duy nhất tuân thủ schema đã cung cấp.

Hãy bắt đầu sáng tạo.`;

    const worldGenModelSettings: AiModelSettings = { ...aiModelSettings, maxOutputTokens: 8192 };
    const { parsed: aiResponse } = await client.callJsonAI(prompt, schemas.quickAssistSchema, apiClient, worldGenModelSettings, getSafetySettings(masterSafetySwitch, safety));
    
    const generatedFactions = (aiResponse.initialFactions || []).map((faction: any, index: number) => ({ ...faction, id: `faction_${index + 1}_${Date.now()}` }));
    const factionIdMap = new Map(generatedFactions.map((f: any, i: number) => [ `faction_${i+1}`, f.id ]));
    const generatedNpcs = (aiResponse.initialNpcs || []).map((npc: any, index: number) => ({ ...npc, id: `npc_${index + 1}_${Date.now()}`, factionId: factionIdMap.get(npc.factionId) || 'independent' }));
    const generatedSkills = (aiResponse.character.skills || []).map((skill: any, index: number) => ({
        name: skill.name,
        description: skill.description,
        id: `skill_${index + 1}_${Date.now()}`,
        cost: 10,
        cooldown: 0,
        target: SkillTarget.SINGLE_ENEMY,
        effects: [],
        abilities: []
    }));
    const generatedCharacter = { ...aiResponse.character, customGender: '', skills: generatedSkills };

    if (generatedCharacter.gender !== 'Nam' && generatedCharacter.gender !== 'Nữ') {
        generatedCharacter.gender = 'Nam';
    }

    return {
        ...aiResponse,
        character: generatedCharacter,
        initialFactions: generatedFactions,
        initialNpcs: generatedNpcs,
    };
}

export async function sanitizeGameState(
    gameState: GameState,
    apiClient: client.ApiClient,
    aiModelSettings: AiModelSettings,
    masterSafetySwitch: boolean,
    safety: SafetySettings
): Promise<{ playerStatChanges: StatChanges; npcUpdates: { id: string; statsChanges: StatChanges; }[]; sanitizedPlotChronicle: string; }> {
    const gameData = {
        playerStats: gameState.playerStats,
        npcs: gameState.npcs.map(npc => ({ id: npc.id, name: npc.name, stats: npc.stats })),
        plotChronicle: gameState.plotChronicle,
    };
    const prompt = prompts.GAME_STATE_SANITIZATION_PROMPT.replace('{GAME_DATA_JSON_PLACEHOLDER}', JSON.stringify(gameData, null, 2));

    const { parsed } = await client.callJsonAI(
        prompt,
        schemas.sanitizedGameStateSchema,
        apiClient,
        {...aiModelSettings, model: 'gemini-2.5-flash'}, // use a faster model for this task
        getSafetySettings(masterSafetySwitch, safety)
    );

    return parsed;
}


export async function generateWorldFromPrompt(
    userIdea: string,
    isNsfw: boolean,
    apiClient: client.ApiClient,
    aiModelSettings: AiModelSettings,
    masterSafetySwitch: boolean,
    safety: SafetySettings
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
    *   **Description:** Viết một mô tả chi tiết về thế giới.
    *   **Character:** Tạo một nhân vật chính phù hợp với thế giới.
    *   **Initial Factions:** Tạo 2-3 phe phái/thế lực ban đầu.
    *   **Initial NPCs:** Tạo 2-3 NPC ban đầu thú vị.
    *   **Custom Attributes (QUAN TRỌNG):** Sáng tạo 2-3 thuộc tính tùy chỉnh (ngoài các chỉ số chiến đấu cơ bản) mang tính đặc trưng cho thế giới này (VD: trong thế giới cyberpunk, có thể là 'Uy tín đường phố' hoặc 'Lòng trung thành với tập đoàn'). Cung cấp đầy đủ các trường \`id\`, \`name\`, \`description\`, \`type\`, \`icon\`, và \`baseValue\`.
    *   **Special Rules (QUAN TRỌNG):** Sáng tạo 1-2 quy luật đặc biệt để làm thế giới thêm độc đáo (VD: 'Ma thuật bị cấm trong thành phố', 'Mọi giao dịch đều phải dùng máu').
3.  **${nsfwInstruction}**
4.  **Định dạng JSON:** Trả về một đối tượng JSON duy nhất tuân thủ schema đã cung cấp.

Hãy bắt đầu sáng tạo.`;

    const worldGenModelSettings: AiModelSettings = {
        ...aiModelSettings,
        maxOutputTokens: 8192,
    };

    const { parsed: aiResponse } = await client.callJsonAI(prompt, schemas.quickAssistSchema, apiClient, worldGenModelSettings, getSafetySettings(masterSafetySwitch, safety));
    
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
        name: skill.name,
        description: skill.description,
        id: `skill_${index + 1}_${Date.now()}`,
        cost: 10,
        cooldown: 0,
        target: SkillTarget.SINGLE_ENEMY,
        effects: [],
        abilities: []
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
        ...aiResponse, // This will include genre, description, customAttributes, specialRules
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
    masterSafetySwitch: boolean,
    safety: SafetySettings
): Promise<Skill> {
    const prompt = prompts.SKILL_GENERATOR_FROM_USER_PROMPT
        .replace('{WORLD_CONTEXT_PLACEHOLDER}', worldContext.description)
        .replace('{SKILL_NAME_PLACEHOLDER}', name)
        .replace('{SKILL_DESCRIPTION_PLACEHOLDER}', description);

    const { parsed: skill } = await client.callJsonAI(prompt, schemas.skillSchema, apiClient, aiModelSettings, getSafetySettings(masterSafetySwitch, safety));

    skill.name = name;

    return skill as Skill;
}

export async function generateCharacterAppearance(
    worldState: WorldCreationState,
    apiClient: client.ApiClient,
    aiModelSettings: AiModelSettings,
    masterSafetySwitch: boolean,
    safety: SafetySettings
): Promise<string> {
    const { character, description } = worldState;
    const charGender = character.gender === 'Tự định nghĩa' ? character.customGender : character.gender;

    const prompt = prompts.CHARACTER_APPEARANCE_GENERATOR_PROMPT
        .replace('{WORLD_CONTEXT_PLACEHOLDER}', description)
        .replace('{NAME_PLACEHOLDER}', character.name || 'Chưa có tên')
        .replace('{GENDER_PLACEHOLDER}', charGender)
        .replace('{PERSONALITY_PLACEHOLDER}', character.personality || 'Chưa xác định');

    const response = await client.callCreativeTextAI(prompt, apiClient, aiModelSettings, getSafetySettings(masterSafetySwitch, safety));
    return response.text;
}


export async function generateSkillFromStat(
    statName: string, 
    worldContext: WorldCreationState, 
    apiClient: client.ApiClient,
    aiModelSettings: AiModelSettings,
    masterSafetySwitch: boolean,
    safety: SafetySettings
): Promise<Skill> {
    const prompt = prompts.SKILL_GENERATOR_PROMPT
        .replace('{WORLD_CONTEXT_PLACEHOLDER}', worldContext.description)
        .replace('{STAT_NAME_PLACEHOLDER}', statName);
    
    const { parsed: skill } = await client.callJsonAI(prompt, schemas.skillSchema, apiClient, aiModelSettings, getSafetySettings(masterSafetySwitch, safety));

    skill.name = statName;

    return skill as Skill;
}

export async function generateCodexEntries(
    terms: string[],
    storyContext: string,
    apiClient: client.ApiClient,
    aiModelSettings: AiModelSettings
): Promise<Omit<WorldRule, 'id'>[]> {
    const prompt = prompts.CODEX_ENTRY_GENERATOR_PROMPT
        .replace('{STORY_CONTEXT_PLACEHOLDER}', storyContext)
        .replace('{TERMS_LIST_PLACEHOLDER}', terms.map(t => `- ${t}`).join('\n'));

    const codexModelSettings: AiModelSettings = {
        ...aiModelSettings,
        model: 'gemini-2.5-flash',
        temperature: 0.2, // Be factual
        maxOutputTokens: 1024,
        jsonBuffer: 500,
        thinkingBudget: 0,
    };
    
    const { parsed } = await client.callJsonAI(prompt, schemas.codexEntrySchema, apiClient, codexModelSettings, []);
    return parsed as Omit<WorldRule, 'id'>[];
}


export async function initializeStory(
    worldState: WorldCreationState, 
    apiClient: client.ApiClient,
    aiModelSettings: AiModelSettings,
    masterSafetySwitch: boolean,
    safety: SafetySettings
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
        ? JSON.stringify(character.skills, null, 2)
        : "Không có";

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
- **Thông tin Nhân vật chính:** Tên: ${character.name}, Giới tính: ${charGender}, Tính cách: ${character.personality}, Tiểu sử: ${character.biography}, Cảnh giới khởi đầu: ${character.initialRealm || 'Phàm nhân'}
- **Kỹ năng khởi đầu (dạng dữ liệu JSON):** ${skillsString}
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
        maxOutputTokens: 8192, 
    };

    console.debug("Initializing story with custom token limit:", initialModelSettings.maxOutputTokens);

    const { parsed: aiResponse, response: result } = await client.callJsonAI(fullPrompt, schemas.coreLogicSchema, apiClient, initialModelSettings, getSafetySettings(masterSafetySwitch, safety));

    const initialPlayerSkills = worldState.character.skills || [];

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
        initialPlayerSkills: initialPlayerSkills,
        plotChronicle: aiResponse.summaryText || '',
        presentNpcIds: aiResponse.presentNpcIds || [],
        summaryText: aiResponse.summaryText || '',
        initialInventory: aiResponse.initialInventory || [],
    };
}

export async function continueStory(
    gameState: GameState,
    choice: string,
    logicResultSummary: string,
    apiClient: client.ApiClient,
    aiSettings: AiSettings,
    isRewrite: boolean,
    shouldTriggerWorldTurn: boolean,
    isCorrection: boolean,
    finalCoreStats: CharacterCoreStats,
    aiModelSettings: AiModelSettings,
    masterSafetySwitch: boolean,
    safety: SafetySettings,
    onChunk: (chunk: string) => void,
    worldEvent?: WorldEvent
): Promise<{
    newTurn: GameTurn;
    playerStatChanges: StatChanges;
    npcUpdates: NPCUpdate[];
    newlyAcquiredSkill: Skill | null;
    presentNpcIds: string[];
    summaryText: string;
    itemsReceived: string[];
    playerTitle: string | null;
    timeElapsed: number;
    nsfwSceneStateChange: 'ENTER' | 'EXIT' | 'NONE';
    expGained: number;
    coreStatsChanges: Partial<CharacterCoreStats> | null;
    weatherChange: Weather | null;
    isInCombat: boolean;
    combatantNpcIds: string[];
    totalTokens: number;
    playerSkills: Skill[] | null;
    functionCalls: FunctionCall[] | null;
    factsToRecord: string[] | null;
}> {
    const { worldContext, playerStats, npcs, playerSkills, history, presentNpcIds, inventory, equipment, chronicle, truthLedger } = gameState;

    const lastTurnText = history.length > 0 ? history[history.length - 1].storyText : "";
    const retrievalQuery = `${choice}\n${lastTurnText.slice(-200)}`;
    const queryEmbedding = await client.callEmbeddingModel(retrievalQuery, apiClient);

    const relevantMemories = findTopKChunks(queryEmbedding, chronicle, 3);
    const episodicMemoryContext = relevantMemories.length > 0 
        ? relevantMemories.map(m => `- (Lượt ${m.turnNumber}): ${m.summary}`).join('\n')
        : "Không có ký ức tình tiết nào liên quan.";

    let knowledgeContext = "Không có kiến thức nền nào liên quan.";
    if (worldContext.knowledgeBaseIds && worldContext.knowledgeBaseIds.length > 0) {
        const allKnowledgeChunks: TrainingDataChunk[] = [];
        for (const id of worldContext.knowledgeBaseIds) {
            const knowledgeBase = await StorageService.getTrainingSetById(id);
            if (knowledgeBase) {
                allKnowledgeChunks.push(...knowledgeBase.chunks);
            }
        }
        if (allKnowledgeChunks.length > 0) {
            const relevantKnowledge = findTopKChunks(queryEmbedding, allKnowledgeChunks, 2);
            if (relevantKnowledge.length > 0) {
                knowledgeContext = relevantKnowledge.map((k, i) => `**Kiến thức ${i+1}:** ${k.content}`).join('\n\n');
            }
        }
    }
    
    const ragContextPrompt = `
**4.0. TẦNG KÝ ỨC TRUY VẤN (RETRIEVAL-AUGMENTED MEMORY):**
Đây là những ký ức và kiến thức liên quan nhất đến tình hình hiện tại, được hệ thống tự động chắt lọc.
- **Ký ức Tình tiết Liên quan:**
${episodicMemoryContext}
- **Kiến thức Thế giới Liên quan:**
${knowledgeContext}
`;

    const charGender = worldContext.character.gender === 'Tự định nghĩa' ? worldContext.character.customGender : worldContext.character.gender;

    const informationalAttributes = worldContext.customAttributes.filter(attr => attr.type === AttributeType.INFORMATIONAL || attr.type === AttributeType.HIDDEN);
    const customAttributesString = informationalAttributes.length > 0
        ? JSON.stringify(informationalAttributes.map(({ name, description, baseValue }) => ({ name, description, baseValue })), null, 2)
        : "Không có";

    const perspectiveRules = getPerspectiveRules(worldContext.narrativePerspective);
    const destinyCompassRules = getDestinyCompassRules(aiSettings.destinyCompassMode);
    const combatSystemRules = getCombatSystemRules(aiSettings.isTurnBasedCombat);
    let situationalRules = getSituationalRules(choice, aiSettings, isCorrection);
    const flowOfDestinyRules = getFlowOfDestinyRules(shouldTriggerWorldTurn, choice, worldEvent);
    const worldRulesPrompt = getWorldRulesPrompt(worldContext.specialRules, worldContext.initialLore);

    const targetStoryWordCount = aiModelSettings.minOutputWords;
    
    const lengthInstruction = prompts.STORY_LENGTH_RULE.replace('{TARGET_WORD_COUNT}', String(targetStoryWordCount));

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
        .map(({ id, name, relationship, status, lastInteractionSummary, goal }) => ({ id, name, relationship, status, lastInteractionSummary, goal }));

    const logicSummaryPrompt = logicResultSummary ? `
**4.3.5. KẾT QUẢ LOGIC (SỰ THẬT TUYỆT ĐỐI):**
Các sự kiện sau đã xảy ra do client xử lý logic. Bạn BẮT BUỘC phải tường thuật và tích hợp chúng vào \`storyText\`.
---
${logicResultSummary}
---
` : '';

    const equipmentSummary = Object.entries(equipment).reduce((acc, [slot, item]) => {
        (acc as any)[slot] = item ? { id: item.id, name: item.name } : null;
        return acc;
    }, {});
        
    const inventorySummary = inventory.items.map(i => ({ id: i.id, name: i.name }));

    const userPrompt = `
### BẢN TÓM TẮT NHẬN THỨC (COGNITIVE SNAPSHOT) ###
Đây là toàn bộ thông tin bạn cần để đưa ra quyết định cho lượt truyện tiếp theo.
${ragContextPrompt}
### THÙY 4: KÝ ỨC & BỐI CẢNH (MEMORY & CONTEXT LOBE) ###

**4.1. TẦNG KÝ ỨC DÀI HẠN (NỀN TẢNG):**
- **Nền tảng Thế giới:** Thể loại: ${worldContext.genre || "Không có"}, Bối cảnh: ${worldContext.description}
- **Thông tin Nhân vật chính:** Tên: ${worldContext.character.name}, Giới tính: ${charGender}, Tính cách: ${worldContext.character.personality}, Tiểu sử: ${worldContext.character.biography}
- **Hệ thống Thuộc tính Tùy chỉnh:** ${customAttributesString}

**4.2. TẦNG KÝ ỨC NGẮN HẠN (LỊCH SỬ GẦN ĐÂY):**
- **5 Lượt truyện gần nhất:**
${history.slice(-5).map((turn, i) => `Lượt ${history.length - 4 + i}: ${turn.playerAction ? `Người chơi: "${turn.playerAction}".` : ''} Diễn biến: ${turn.storyText.substring(0, 200)}...`).join('\n')}

**4.3. TRẠNG THÁI HIỆN TẠI (SỰ THẬT TUYỆT ĐỐI):**
- **Thời gian:** ${gameState.time.day} ngày đã trôi qua. Hiện tại là ${gameState.time.hour}:${String(gameState.time.minute).padStart(2, '0')}.
- **Chỉ số Cốt lõi của Nhân vật chính:** ${JSON.stringify(finalCoreStats, null, 2)}
- **Trạng thái của Nhân vật chính:** ${Object.keys(playerStats).length > 0 ? JSON.stringify(playerStats, null, 2) : "Không có"}
- **Kỹ năng của Nhân vật chính (dạng dữ liệu JSON):** ${playerSkills.length > 0 ? JSON.stringify(playerSkills, null, 2) : "Không có"}
- **Trang bị:** ${JSON.stringify(equipmentSummary, null, 2)}
- **Túi đồ:** ${JSON.stringify(inventorySummary, null, 2)}
- **NPC đang có mặt:** ${presentNpcs.length > 0 ? JSON.stringify(presentNpcs, null, 2) : "Không có"}
- **Tóm tắt về các NPC khác:** ${otherNpcsSummary.length > 0 ? JSON.stringify(otherNpcsSummary, null, 2) : "Không có"}
- **Danh sách Vật phẩm Tham khảo:** ${itemListString}
- **Sự thật Bất biến (Truth Ledger):** \n${truthLedger.map(f => `- ${f}`).join('\n') || "Chưa có"}
${logicSummaryPrompt}
**4.4. Ý CHÍ NGƯỜI CHƠI (HÀNH ĐỘNG HIỆN TẠI):**
${choice}
`;

    const fullPrompt = systemPrompt + '\n\n' + userPrompt;

    const stream = await client.callJsonAIStream(
        fullPrompt, schemas.coreLogicSchema, apiClient,
        { ...aiModelSettings, maxOutputTokens: aiModelSettings.maxOutputTokens + aiModelSettings.jsonBuffer },
        getSafetySettings(masterSafetySwitch, safety),
        [{ functionDeclarations: [schemas.triggerCustomScenarioFunction] }]
    );

    let fullResponse = '';
    let lastChunk: GenerateContentResponse | undefined;
    for await (const chunk of stream) {
        lastChunk = chunk;
        const chunkText = chunk.text;
        if (chunkText) {
            fullResponse += chunkText;
            onChunk(chunkText);
        }
    }

    if (!fullResponse && !lastChunk?.functionCalls) {
        const finishReason = lastChunk?.candidates?.[0]?.finishReason;
        const safetyRatings = lastChunk?.candidates?.[0]?.safetyRatings;
        let errorMessage = "Phản hồi của AI trống.";
        if (finishReason === 'SAFETY') {
            errorMessage = `Phản hồi bị chặn vì lý do an toàn. Chi tiết: ${JSON.stringify(safetyRatings)}`;
        } else if (finishReason) {
            errorMessage += ` Lý do: ${finishReason}`;
        }
        throw new Error(errorMessage);
    }
    
    const parsed = client.parseAndValidateJsonResponse(fullResponse || '{}');
    
    const tokenCount = lastChunk?.candidates?.[0].tokenCount || 0;

    return {
        newTurn: {
            playerAction: choice,
            storyText: parsed.storyText || '',
            statusNarration: parsed.statusNarration,
            choices: parsed.choices || [],
            tokenCount: tokenCount,
            omniscientInterlude: parsed.omniscientInterlude,
        },
        playerStatChanges: parsed.playerStatChanges || { statsToUpdate: [], statsToDelete: [] },
        npcUpdates: parsed.npcUpdates || [],
        newlyAcquiredSkill: parsed.newlyAcquiredSkill || null,
        presentNpcIds: parsed.presentNpcIds || [],
        summaryText: parsed.summaryText || '',
        itemsReceived: parsed.itemsReceived || [],
        playerTitle: parsed.playerTitle || null,
        timeElapsed: parsed.timeElapsed ?? 10,
        nsfwSceneStateChange: parsed.nsfwSceneStateChange || 'NONE',
        expGained: parsed.expGained || 0,
        coreStatsChanges: parsed.coreStatsChanges || null,
        weatherChange: parsed.weatherChange || null,
        isInCombat: parsed.isInCombat || false,
        combatantNpcIds: parsed.combatantNpcIds || [],
        totalTokens: tokenCount,
        playerSkills: parsed.playerSkills || null,
        functionCalls: lastChunk?.functionCalls || null,
        factsToRecord: parsed.factsToRecord || null,
    };
}
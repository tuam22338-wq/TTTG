import { Type } from '@google/genai';

export type GeminiModel =
  | 'gemini-2.5-flash'
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash-lite'
  | 'gemini-flash-lite-latest'
  | 'gemini-flash-latest';

export enum AiProvider {
  GEMINI = 'GEMINI',
  DEEPSEEK = 'DEEPSEEK',
}

export enum ApiKeySource {
  DEFAULT = 'DEFAULT',
  CUSTOM = 'CUSTOM',
}

export interface AiModelSettings {
  model: GeminiModel;
  temperature: number;
  topK: number;
  topP: number;
  maxOutputTokens: number;
  thinkingBudget: number;
  autoRotateModels: boolean;
  rotationDelay: number;
}

export interface DeepSeekModelSettings {
    model: 'deepseek-chat' | 'deepseek-coder';
    temperature: number;
    topP: number;
    maxOutputTokens: number;
}

export interface AudioSettings {
  enabled: boolean;
  volume: number;
}

export type SafetyLevel = 'BLOCK_NONE' | 'BLOCK_ONLY_HIGH' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_MOST';

export interface SafetySettings {
  level: SafetyLevel;
}

export type NarrativePerspective = 'Nhãn Quan Toàn Tri' | 'Ngôi thứ ba Giới hạn' | 'Ngôi thứ hai' | 'Ngôi thứ ba Toàn tri';

export interface Settings {
  aiProvider: AiProvider;
  apiKeySource: ApiKeySource;
  customApiKeys: string[];
  currentApiKeyIndex: number;
  deepSeekApiKey: string;
  aiModelSettings: AiModelSettings;
  deepSeekModelSettings: DeepSeekModelSettings;
  audio: AudioSettings;
  safety: SafetySettings;
  autoHideActionPanel: boolean;
  narrativePerspective: NarrativePerspective;
  zoomLevel: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface CharacterSkillInput {
  id: string;
  name: string;
  description: string;
  effect: string;
}

export interface InitialFaction {
    id: string;
    name: string;
    type: string;
    style: string;
    territory: string;
    reputation: string;
    powerLevel: string;
    resources: string;
    playerRelation: string;
    description: string;
}

export interface InitialNpc {
    id: string;
    name: string;
    gender: string;
    personality: string;
    initialRealm: string;
    appearance: string;
    backstory: string;
    factionId: string;
    playerRelation: string;
    specialSetting: string;
}

export enum AttributeType {
    VITAL = 'VITAL',
    PRIMARY = 'PRIMARY',
    INFORMATIONAL = 'INFORMATIONAL',
    HIDDEN = 'HIDDEN'
}

export type CoreStatLinkTarget = keyof Omit<CharacterCoreStats, 'sinhLuc' | 'linhLuc' | 'theLuc' | 'doNo' | 'doNuoc'>;

export type LinkEffectType = 'FLAT' | 'PERCENT';

export interface CustomAttributeLink {
  targetStat: CoreStatLinkTarget;
  effectType: LinkEffectType;
  ratio: number;
  value: number;
}


export interface CustomAttributeDefinition {
    id: string;
    name: string;
    description: string;
    type: AttributeType;
    icon: string;
    baseValue: number;
    isDefault: boolean;
    links?: CustomAttributeLink[];
}

export interface CultivationStatBonus {
    stat: keyof Omit<CharacterCoreStats, 'sinhLuc' | 'linhLuc' | 'theLuc' | 'doNo' | 'doNuoc'>;
    value: number;
}

export interface CultivationSubTier {
    id: string;
    name: string;
    statBonuses?: CultivationStatBonus[];
}

export interface CultivationMainTier {
    id: string;
    name: string;
    description: string;
    breakthroughRequirement: string;
    subTiers: CultivationSubTier[];
    statBonuses: CultivationStatBonus[];
}

export interface CultivationSystemSettings {
    systemName: string;
    resourceName: string;
    unitName: string;
    description: string;
    mainTiers: CultivationMainTier[];
}

export interface WorldRule {
  id: string;
  name: string;
  content: string;
  isEnabled?: boolean;
  tags?: string[];
}

export interface WorldCreationState {
  genre: string;
  description: string;
  isNsfw: boolean;
  narrativePerspective: NarrativePerspective;
  character: {
    name: string;
    gender: 'Nam' | 'Nữ' | 'Tự định nghĩa';
    customGender: string;
    personality: string;
    biography: string;
    skills: CharacterSkillInput[];
  };
  isCultivationEnabled: boolean;
  cultivationSystem: CultivationSystemSettings;
  customAttributes: CustomAttributeDefinition[];
  initialFactions: InitialFaction[];
  initialNpcs: InitialNpc[];
  specialRules: WorldRule[];
  initialLore: WorldRule[];
}

export enum StatType {
    GOOD = 'GOOD',
    BAD = 'BAD',
    INJURY = 'INJURY',
    NSFW = 'NSFW',
    KNOWLEDGE = 'KNOWLEDGE',
    NEUTRAL = 'NEUTRAL',
}

export interface CharacterStat {
    description: string;
    type: StatType;
    duration?: number;
    effect?: string;
    source?: string;
    cure?: string;
}

export type CharacterStats = Record<string, CharacterStat>;

export interface OmniscientInterlude {
    title: string;
    text: string;
}

export interface GameTurn {
    playerAction: string | null;
    storyText: string;
    statusNarration?: string | null;
    choices: string[];
    tokenCount?: number;
    omniscientInterlude?: OmniscientInterlude | null;
}

export type LustModeFlavor = 'DOMINATION' | 'HARMONY' | 'SUBMISSION' | 'TEASING' | 'AI_FREESTYLE' | 'SEDUCTION';
export type NpcMindset = 'DEFAULT' | 'IRON_WILL' | 'TORN_MIND' | 'PRIMAL_INSTINCT' | 'HEDONISTIC_MIND';
export type DestinyCompassMode = 'NORMAL' | 'HARSH' | 'HELLISH';

export type StatTypeGroup = 'REGULAR' | 'KNOWLEDGE';
export type StatScopes = Record<StatTypeGroup, boolean>;
export type StatAction = 'DELETE' | 'REFINE' | 'RECONSTRUCT' | 'SANITIZE';
export type EntityTarget = 'PLAYER' | 'ALL_NPCS' | 'PLAYER_AND_ALL_NPCS' | string;


export interface AiSettings {
    isLogicModeOn: boolean;
    lustModeFlavor: LustModeFlavor | null;
    isConscienceModeOn: boolean;
    isStrictInterpretationOn: boolean;
    destinyCompassMode: DestinyCompassMode;
    npcMindset: NpcMindset;
    flowOfDestinyInterval: number | null;
    authorsMandate: string[];
    isTurnBasedCombat: boolean;
}

export interface NPC {
    id: string;
    name: string;
    personality: string;
    appearance: string;
    backstory: string;
    status: string;
    relationship: string;
    stats: CharacterStats;
    lastInteractionSummary: string;
    level: number;
    coreStats: CharacterCoreStats;
    skills: Skill[];
}

export type NPCUpdateAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface NPCUpdate {
    id: string;
    action: NPCUpdateAction;
    payload?: Partial<NPC>;
}

export interface Ability {
    name: string;
    description: string;
}

export enum SkillTarget {
    SELF = 'SELF',
    SINGLE_ENEMY = 'SINGLE_ENEMY',
    ALL_ENEMIES = 'ALL_ENEMIES',
    SINGLE_ALLY = 'SINGLE_ALLY',
    ALL_ALLIES = 'ALL_ALLIES',
}

export enum SkillEffectType {
    DAMAGE = 'DAMAGE',
    HEAL = 'HEAL',
    APPLY_STATUS = 'APPLY_STATUS',
}

export interface DamageEffect {
    type: SkillEffectType.DAMAGE;
    value: number; // e.g., 1.5 for 150% ATK
}

export interface HealEffect {
    type: SkillEffectType.HEAL;
    value: number; // e.g., 0.2 for 20% max HP
}

export interface StatusApplicationEffect {
    type: SkillEffectType.APPLY_STATUS;
    status: Omit<CharacterStat & { name: string; duration: number }, 'source' | 'cure'>;
}

export type SkillEffect = DamageEffect | HealEffect | StatusApplicationEffect;


export interface Skill {
    id: string;
    name: string;
    description: string;
    abilities: Ability[];
    cost: number;
    cooldown: number;
    target: SkillTarget;
    effects: SkillEffect[];
}

export interface StatChanges {
    statsToUpdate: { name: string; stat: CharacterStat }[];
    statsToDelete: string[];
}

export interface CharacterCoreStats {
  sinhLuc: number;
  sinhLucToiDa: number;
  linhLuc: number;
  linhLucToiDa: number;
  theLuc: number;
  theLucToiDa: number;
  doNo: number;
  doNoToiDa: number;
  doNuoc: number;
  doNuocToiDa: number;
  congKich: number;
  phongNgu: number;
  khangPhep: number;
  thanPhap: number;
  chiMang: number;
  satThuongChiMang: number;
  giamHoiChieu: number;
}


export enum ItemType {
    EQUIPMENT = 'EQUIPMENT',
    POTION = 'POTION',
    FOOD = 'FOOD',
    MATERIAL = 'MATERIAL',
    SPECIAL = 'SPECIAL',
    CONSUMABLE = 'CONSUMABLE',
}

export enum ItemRarity {
    COMMON = 'COMMON',
    UNCOMMON = 'UNCOMMON',
    RARE = 'RARE',
    EPIC = 'EPIC',
    LEGENDARY = 'LEGENDARY',
}

export interface Item {
    id: string;
    name: string;
    description: string;
    type: ItemType;
    rarity: ItemRarity;
    size: number;
    weight: number;
}

export interface SpecialItem extends Item {
    type: ItemType.SPECIAL;
    isAchievement: boolean;
    levelRequirement: number;
    imageUrl: string;
    loreText: string;
}

export interface ConsumableItem extends Item {
    type: ItemType.POTION | ItemType.FOOD | ItemType.CONSUMABLE;
}


export enum EquipmentSlot {
    WEAPON = 'WEAPON',
    HEAD = 'HEAD',
    CHEST = 'CHEST',
    LEGS = 'LEGS',
    HANDS = 'HANDS',
    FEET = 'FEET',
}

export enum SpecialEffectType {
    DOUBLE_ATTACK = 'DOUBLE_ATTACK',
    LIFESTEAL = 'LIFESTEAL',
    APPLY_STATUS_ON_HIT = 'APPLY_STATUS_ON_HIT',
    THORNS_DAMAGE = 'THORNS_DAMAGE',
    THORNS_STATUS = 'THORNS_STATUS',
    EVASION = 'EVASION',
    HEAL_OVER_TIME = 'HEAL_OVER_TIME',
    MANA_OVER_TIME = 'MANA_OVER_TIME',
    REDUCE_DAMAGE_TAKEN = 'REDUCE_DAMAGE_TAKEN',
    IGNORE_DEFENSE = 'IGNORE_DEFENSE',
    OVERHEAL_SHIELD = 'OVERHEAL_SHIELD',
    BERSERKER_RAGE = 'BERSERKER_RAGE',
    STATUS_IMMUNITY = 'STATUS_IMMUNITY',
}

export interface SpecialEffect {
    type: SpecialEffectType;
    chance?: number;
    value?: number;
    status?: Omit<CharacterStat & { name: string, duration: number }, 'source' | 'cure'>;
    sourceId?: string;
}

export interface Equipment extends Item {
    type: ItemType.EQUIPMENT;
    slot: EquipmentSlot;
    stats?: Partial<CharacterCoreStats>;
    effects?: SpecialEffect[];
    setId?: string;
}

export type EquipmentSlots = {
    [key in EquipmentSlot]: Equipment | null;
};

export interface Inventory {
    items: Item[];
    capacity: number;
    maxWeight: number;
}

export interface Combatant {
    id: string;
    name: string;
    type: 'PLAYER' | 'ENEMY';
    level: number;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    atk: number;
    def: number;
    mdef: number;
    agi: number;
    critRate: number;
    critDmg: number;
    statuses: Array<Omit<CharacterStat, 'description' | 'source' | 'cure'> & { name: string; duration: number }>;
    skills: Skill[];
    effects?: SpecialEffect[];
    cooldowns?: Record<string, number>;
    shield?: number;
}

export interface CultivationState {
    level: number;
    exp: number;
    expToNextLevel: number;
}

export interface ChronicleEntry {
    turnNumber: number;
    summary: string;
    timestamp: string;
    isoTimestamp?: string;
}

export type Season = 'Xuân' | 'Hạ' | 'Thu' | 'Đông';
export type Weather = 'Quang đãng' | 'Nhiều mây' | 'Mưa' | 'Bão' | 'Tuyết';

export interface GameTime {
    day: number;
    hour: number;
    minute: number;
    season: Season;
    weather: Weather;
}

export interface GameState {
    worldContext: WorldCreationState;
    history: GameTurn[];
    playerStats: CharacterStats;
    playerStatOrder: string[];
    npcs: NPC[];
    playerSkills: Skill[];
    plotChronicle: string;
    presentNpcIds: string[];
    totalTokens: number;
    requestCount: number;
    aiSettings: AiSettings;
    coreStats: CharacterCoreStats;
    cultivation: CultivationState;
    inventory: Inventory;
    equipment: EquipmentSlots;
    chronicle: ChronicleEntry[];
    time: GameTime;
    isInCombat: boolean;
    combatants: Combatant[];
    codex: WorldRule[];
}

export type ViewMode = 'desktop' | 'mobile';
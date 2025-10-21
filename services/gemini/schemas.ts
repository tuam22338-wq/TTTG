import { Type } from '@google/genai';

const statSchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['GOOD', 'BAD', 'INJURY', 'NSFW', 'KNOWLEDGE', 'NEUTRAL'] },
        duration: { type: Type.INTEGER, nullable: true },
        effect: { type: Type.STRING, nullable: true },
        source: { type: Type.STRING, nullable: true },
        cure: { type: Type.STRING, nullable: true },
    },
    required: ['description', 'type']
};

export const statChangesSchema = {
    type: Type.OBJECT,
    properties: {
        statsToUpdate: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    stat: statSchema
                },
                required: ['name', 'stat']
            }
        },
        statsToDelete: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
    },
};


const abilitySchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
    },
    required: ['name', 'description']
};

const statusEffectSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['GOOD', 'BAD', 'INJURY', 'NSFW', 'KNOWLEDGE', 'NEUTRAL'] },
        duration: { type: Type.INTEGER },
        effect: { type: Type.STRING, nullable: true },
    },
    required: ['name', 'description', 'type', 'duration']
};

const skillEffectSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: ['DAMAGE', 'HEAL', 'APPLY_STATUS'] },
        value: { type: Type.NUMBER, nullable: true, description: "For DAMAGE: multiplier (1.5 = 150%). For HEAL: percentage (0.2 = 20%)." },
        status: { ...statusEffectSchema, nullable: true },
    },
    required: ['type']
};

export const skillSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, nullable: true },
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        abilities: {
            type: Type.ARRAY,
            items: abilitySchema
        },
        cost: { type: Type.INTEGER },
        cooldown: { type: Type.INTEGER },
        target: { type: Type.STRING, enum: ['SELF', 'SINGLE_ENEMY', 'ALL_ENEMIES', 'SINGLE_ALLY', 'ALL_ALLIES'] },
        effects: {
            type: Type.ARRAY,
            items: skillEffectSchema
        }
    },
    required: ['name', 'description', 'abilities', 'cost', 'cooldown', 'target', 'effects']
};

const coreStatsProperties = {
    sinhLuc: { type: Type.NUMBER, nullable: true },
    sinhLucToiDa: { type: Type.NUMBER, nullable: true },
    linhLuc: { type: Type.NUMBER, nullable: true },
    linhLucToiDa: { type: Type.NUMBER, nullable: true },
    theLuc: { type: Type.NUMBER, nullable: true },
    theLucToiDa: { type: Type.NUMBER, nullable: true },
    doNo: { type: Type.NUMBER, nullable: true },
    doNoToiDa: { type: Type.NUMBER, nullable: true },
    doNuoc: { type: Type.NUMBER, nullable: true },
    doNuocToiDa: { type: Type.NUMBER, nullable: true },
    congKich: { type: Type.NUMBER, nullable: true },
    phongNgu: { type: Type.NUMBER, nullable: true },
    khangPhep: { type: Type.NUMBER, nullable: true },
    thanPhap: { type: Type.NUMBER, nullable: true },
    chiMang: { type: Type.NUMBER, nullable: true },
    satThuongChiMang: { type: Type.NUMBER, nullable: true },
    giamHoiChieu: { type: Type.NUMBER, nullable: true },
};

export const coreLogicSchema = {
    type: Type.OBJECT,
    properties: {
        storyText: { type: Type.STRING },
        statusNarration: { type: Type.STRING, nullable: true },
        choices: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        playerStatChanges: { ...statChangesSchema, nullable: true },
        npcUpdates: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    action: { type: Type.STRING, enum: ['CREATE', 'UPDATE', 'DELETE'] },
                    payload: { 
                        type: Type.OBJECT, 
                        properties: {
                            name: { type: Type.STRING, nullable: true },
                            personality: { type: Type.STRING, nullable: true },
                            appearance: { type: Type.STRING, nullable: true },
                            backstory: { type: Type.STRING, nullable: true },
                            status: { type: Type.STRING, nullable: true },
                            relationship: { type: Type.STRING, nullable: true },
                            stats: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        stat: statSchema
                                    },
                                    required: ['name', 'stat']
                                },
                                nullable: true
                            },
                            lastInteractionSummary: { type: Type.STRING, nullable: true },
                            level: { type: Type.INTEGER, nullable: true },
                            coreStats: {
                                type: Type.OBJECT,
                                properties: coreStatsProperties,
                                nullable: true,
                            },
                            skills: {
                                type: Type.ARRAY,
                                items: skillSchema,
                                nullable: true,
                            }
                        }, 
                        nullable: true 
                    }
                },
                required: ['id', 'action']
            },
            nullable: true
        },
        newlyAcquiredSkill: { ...skillSchema, nullable: true },
        plotChronicle: { type: Type.STRING, nullable: true },
        presentNpcIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            nullable: true
        },
        summaryText: { type: Type.STRING },
        itemsReceived: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            nullable: true
        },
        initialInventory: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            nullable: true
        },
        playerSkills: {
             type: Type.ARRAY,
             items: skillSchema,
             nullable: true
        },
        timeElapsed: { type: Type.INTEGER, nullable: true },
        nsfwSceneStateChange: { type: Type.STRING, enum: ['ENTER', 'EXIT', 'NONE'], nullable: true },
        expGained: { type: Type.INTEGER, nullable: true },
        coreStatsChanges: { 
            type: Type.OBJECT, 
            properties: coreStatsProperties, 
            nullable: true 
        },
        isInCombat: { type: Type.BOOLEAN, nullable: true },
        combatantNpcIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            nullable: true
        },
        omniscientInterlude: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                text: { type: Type.STRING }
            },
            required: ['title', 'text'],
            nullable: true
        },
        weatherChange: {
            type: Type.STRING,
            enum: ['Quang đãng', 'Nhiều mây', 'Mưa', 'Bão', 'Tuyết'],
            nullable: true
        },
    },
    required: ['storyText', 'choices', 'summaryText']
};

export const novelModeSchema = {
    type: Type.OBJECT,
    properties: {
        storyText: { type: Type.STRING },
        summaryText: { type: Type.STRING },
    },
    required: ['storyText', 'summaryText']
};

export const sanitizedGameStateSchema = {
    type: Type.OBJECT,
    properties: {
        playerStatChanges: statChangesSchema,
        npcUpdates: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    statsChanges: statChangesSchema
                },
                required: ['id', 'statsChanges']
            }
        },
        sanitizedPlotChronicle: { type: Type.STRING }
    },
    required: ['playerStatChanges', 'npcUpdates', 'sanitizedPlotChronicle']
};

const quickAssistCharacterSkillSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
    },
    required: ['name', 'description']
};

const quickAssistCharacterSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        gender: { type: Type.STRING, enum: ['Nam', 'Nữ'] },
        personality: { type: Type.STRING },
        biography: { type: Type.STRING },
        skills: {
            type: Type.ARRAY,
            items: skillSchema, // Use the full skill schema
        }
    },
    required: ['name', 'gender', 'personality', 'biography', 'skills']
};

const quickAssistFactionSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        type: { type: Type.STRING },
        style: { type: Type.STRING },
        territory: { type: Type.STRING },
        reputation: { type: Type.STRING },
        powerLevel: { type: Type.STRING },
        resources: { type: Type.STRING },
        playerRelation: { type: Type.STRING },
        description: { type: Type.STRING }
    },
    required: ['name', 'type', 'style', 'territory', 'reputation', 'powerLevel', 'resources', 'playerRelation', 'description']
};

const quickAssistNpcSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        gender: { type: Type.STRING },
        personality: { type: Type.STRING },
        initialRealm: { type: Type.STRING },
        appearance: { type: Type.STRING },
        backstory: { type: Type.STRING },
        factionId: { type: Type.STRING, description: "ID tự tạo của phe phái mà họ thuộc về (ví dụ: 'faction_1'), hoặc 'independent' nếu không thuộc phe nào." },
        playerRelation: { type: Type.STRING },
        specialSetting: { type: Type.STRING }
    },
    required: ['name', 'gender', 'personality', 'initialRealm', 'appearance', 'backstory', 'factionId', 'playerRelation', 'specialSetting']
};

export const quickAssistSchema = {
    type: Type.OBJECT,
    properties: {
        genre: { type: Type.STRING },
        description: { type: Type.STRING, description: "Mô tả chi tiết về bối cảnh, lịch sử và các thế lực chính của thế giới." },
        character: quickAssistCharacterSchema,
        initialFactions: {
            type: Type.ARRAY,
            items: quickAssistFactionSchema
        },
        initialNpcs: {
            type: Type.ARRAY,
            items: quickAssistNpcSchema
        }
    },
    required: ['genre', 'description', 'character', 'initialFactions', 'initialNpcs']
};
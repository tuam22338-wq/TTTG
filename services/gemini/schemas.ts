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

export const skillSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        abilities: {
            type: Type.ARRAY,
            items: abilitySchema
        }
    },
    required: ['name', 'description', 'abilities']
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

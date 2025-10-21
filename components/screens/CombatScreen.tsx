

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GameState, Combatant, CharacterStat, StatType, SpecialEffect, SpecialEffectType, Skill, SkillEffectType, StatusApplicationEffect } from '../../types';
import Button from '../ui/Button';

interface CombatScreenProps {
  gameState: GameState;
  endCombat: (result: 'win' | 'loss' | 'flee', turnsElapsed: number, finalCombatants: Combatant[]) => void;
  isLoading: boolean;
  usedOneTimeEffectSources: string[];
  onUseOneTimeEffect: (sourceId: string) => void;
}

const StatBar: React.FC<{ current: number; max: number; barColor: string; label: string }> = ({ current, max, barColor, label }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    return (
        <div title={`${label}: ${Math.floor(current)}/${max}`}>
            <div className="flex justify-between text-xs mb-0.5">
                <span className="font-semibold">{label}</span>
                <span>{`${Math.floor(current)} / ${max}`}</span>
            </div>
            <div className="h-2 w-full bg-neutral-700 rounded-full overflow-hidden border border-black/50">
                <div className={`${barColor} h-full rounded-full transition-all duration-300`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const CombatantDisplay: React.FC<{ combatant: Combatant }> = ({ combatant }) => (
    <div className="p-3 bg-black/60 rounded-lg border border-neutral-700 space-y-2">
        <h3 className="font-bold text-lg text-center truncate">{combatant.name}</h3>
        {combatant.shield && combatant.shield > 0 && (
            <StatBar current={combatant.shield} max={combatant.shield} barColor="bg-cyan-400" label="Khiên" />
        )}
        <StatBar current={combatant.hp} max={combatant.maxHp} barColor="bg-red-500" label="Sinh Lực" />
        <StatBar current={combatant.mp} max={combatant.maxMp} barColor="bg-blue-500" label="Linh Lực" />
        <div className="flex flex-wrap gap-1 min-h-[20px]">
            {combatant.statuses.map((status) => (
                <span key={status.name} className={`text-xs px-1.5 py-0.5 rounded-full ${status.type === 'GOOD' ? 'bg-green-600/80' : 'bg-red-600/80'} text-white`} title={status.description}>
                    {status.name} ({status.duration})
                </span>
            ))}
        </div>
    </div>
);

const CombatScreen: React.FC<CombatScreenProps> = ({ gameState, endCombat, isLoading, usedOneTimeEffectSources, onUseOneTimeEffect }) => {
    const [combatants, setCombatants] = useState<Combatant[]>(() => JSON.parse(JSON.stringify(gameState.combatants)));
    const [turnOrder, setTurnOrder] = useState<string[]>([]);
    const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
    const [combatLog, setCombatLog] = useState<string[]>(['Trận chiến bắt đầu!']);
    const [playerAction, setPlayerAction] = useState<'main' | 'skill' | 'item'>('main');
    const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
    const [combatResult, setCombatResult] = useState<'win' | null>(null);
    const [turnsElapsed, setTurnsElapsed] = useState(0);

    const player = useMemo(() => combatants.find(c => c.type === 'PLAYER'), [combatants]);
    const enemies = useMemo(() => combatants.filter(c => c.type === 'ENEMY'), [combatants]);
    
    useEffect(() => {
        document.body.style.backgroundImage = "url('https://raw.githubusercontent.com/caobababacao/IMG_Game/d60d4a80849a1a7a6a6b44ed8781edd02fe37ad8/IMG_BackG/Nen_COMBAT.jpg')";
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundColor = 'black';
    
        return () => {
            document.body.style.backgroundImage = 'none';
            document.body.style.backgroundSize = '';
            document.body.style.backgroundPosition = '';
            // GameScreen's useEffect will still be active, resetting the color back to neutral-900
        };
    }, []);

    useEffect(() => {
        const sorted = [...combatants].sort((a, b) => b.agi - a.agi).map(c => c.id);
        setTurnOrder(sorted);
        setSelectedTargetId(enemies.find(e => e.hp > 0)?.id || null);
    }, []);

    const addToLog = useCallback((message: string) => {
        setCombatLog(prev => [...prev.slice(-9), message]);
    }, []);

    const processEndOfTurn = useCallback((
        actingCombatantId: string,
    ) => (combatantsAfterAction: Combatant[]): Combatant[] => {
        let finalCombatants = [...combatantsAfterAction];
    
        // Apply HoT/MoT for everyone
        finalCombatants = finalCombatants.map(c => {
            if (c.hp <= 0) return c;
            let newHp = c.hp;
            let newMp = c.mp;
    
            const hotEffect = c.effects?.find(e => e.type === SpecialEffectType.HEAL_OVER_TIME);
            const motEffect = c.effects?.find(e => e.type === SpecialEffectType.MANA_OVER_TIME);
    
            if (hotEffect && c.hp < c.maxHp) {
                const healAmount = Math.floor(c.maxHp * (hotEffect.value || 0));
                newHp = Math.min(c.maxHp, c.hp + healAmount);
                if (newHp > c.hp) addToLog(`${c.name} hồi ${Math.floor(newHp - c.hp)} Sinh Lực.`);
            }
            if (motEffect && c.mp < c.maxMp) {
                const manaAmount = Math.floor(c.maxMp * (motEffect.value || 0));
                newMp = Math.min(c.maxMp, c.mp + manaAmount);
                if (newMp > c.mp) addToLog(`${c.name} hồi ${Math.floor(newMp - c.mp)} Linh Lực.`);
            }
            return { ...c, hp: newHp, mp: newMp };
        });
    
        // Tick statuses and cooldowns for the acting combatant
        finalCombatants = finalCombatants.map(c => {
            if (c.id !== actingCombatantId || c.hp <= 0) return c;
    
            // Tick statuses
            const newStatuses = c.statuses
                .map(s => ({ ...s, duration: s.duration - 1 }))
                .filter(s => {
                    if (s.duration <= 0) {
                        addToLog(`${s.name} của ${c.name} đã hết hiệu lực.`);
                        return false;
                    }
                    return true;
                });
    
            // Tick cooldowns
            const newCooldowns = { ...(c.cooldowns || {}) };
            for (const skillId in newCooldowns) {
                if (newCooldowns[skillId] > 0) {
                    newCooldowns[skillId] -= 1;
                }
            }
    
            return { ...c, statuses: newStatuses, cooldowns: newCooldowns };
        });
    
        return finalCombatants;
    }, [addToLog]);

    const advanceTurn = useCallback(() => {
        setCurrentTurnIndex(prevIndex => {
            const nextIndex = (prevIndex + 1) % turnOrder.length;
            if (nextIndex === 0) {
                setTurnsElapsed(prev => prev + 1);
            }
            return nextIndex;
        });
    }, [turnOrder.length]);

    const executeAction = useCallback((
        actionFn: (currentCombatants: Combatant[]) => { logs: string[], updatedCombatants: Combatant[] },
        actingCombatantId: string
    ) => {
        let actionLogs: string[] = [];
        
        const endOfTurnProcessor = processEndOfTurn(actingCombatantId);
        
        setCombatants(prevCombatants => {
            const { logs, updatedCombatants } = actionFn(prevCombatants);
            actionLogs = logs;
            return endOfTurnProcessor(updatedCombatants);
        });

        actionLogs.forEach(log => addToLog(log));
        
        advanceTurn();
    }, [addToLog, processEndOfTurn, advanceTurn]);


    const resolveAttack = useCallback((attacker: Combatant, defender: Combatant): { logs: string[], updatedAttacker: Combatant, updatedDefender: Combatant, attackLanded: boolean } => {
        let logs: string[] = [];
        let updatedAttacker = { ...attacker };
        let updatedDefender = { ...defender, statuses: [...defender.statuses] };
        
        // 1. Evasion Check
        const evasionEffect = defender.effects?.find(e => e.type === SpecialEffectType.EVASION);
        if (evasionEffect && Math.random() < (evasionEffect.value || 0)) {
            logs.push(`${attacker.name} tấn công nhưng ${defender.name} đã né được!`);
            return { logs, updatedAttacker, updatedDefender, attackLanded: false };
        }

        // BERSERKER RAGE: Calculate bonus ATK before damage calculation
        let effectiveAtk = attacker.atk;
        const berserkerEffect = attacker.effects?.find(e => e.type === SpecialEffectType.BERSERKER_RAGE);
        if (berserkerEffect) {
            const missingHpPercent = 1 - (attacker.hp / attacker.maxHp);
            if (missingHpPercent > 0) {
                const atkBonusPercent = missingHpPercent * 100 * (berserkerEffect.value || 0);
                effectiveAtk = attacker.atk * (1 + atkBonusPercent);
                logs.push(`${attacker.name} nổi cơn thịnh nộ, tăng sức tấn công!`);
            }
        }

        const isDefending = defender.statuses.some(s => s.name === "Phòng thủ");
        
        // 2. Ignore Defense Calculation
        const ignoreDefEffect = attacker.effects?.find(e => e.type === SpecialEffectType.IGNORE_DEFENSE);
        const ignoreDefValue = ignoreDefEffect ? (ignoreDefEffect.value || 0) : 0;
        const defenderBaseDef = isDefending ? defender.def * 2 : defender.def;
        const effectiveDef = defenderBaseDef * (1 - ignoreDefValue);
        if (ignoreDefValue > 0) logs.push(`${attacker.name} bỏ qua một phần phòng thủ của ${defender.name}!`);

        // 3. Damage Calculation
        const baseDamage = Math.max(1, effectiveAtk - effectiveDef);
        const isCrit = Math.random() < attacker.critRate;
        let finalDamage = isCrit ? Math.floor(baseDamage * attacker.critDmg) : baseDamage;

        // 4. Reduce Damage Taken Calculation
        const reduceDmgEffect = defender.effects?.find(e => e.type === SpecialEffectType.REDUCE_DAMAGE_TAKEN);
        if (reduceDmgEffect) {
            finalDamage = Math.floor(finalDamage * (1 - (reduceDmgEffect.value || 0)));
            logs.push(`${defender.name} giảm thiểu sát thương nhận vào!`);
        }

        // 5. Apply Damage (with Shield logic)
        let damageDealt = finalDamage;
        if (updatedDefender.shield && updatedDefender.shield > 0) {
            const shieldDamage = Math.min(updatedDefender.shield, damageDealt);
            updatedDefender.shield -= shieldDamage;
            damageDealt -= shieldDamage;
            logs.push(`${defender.name} hấp thụ ${shieldDamage} sát thương bằng khiên!`);
            if (updatedDefender.shield <= 0) {
                logs.push(`Khiên của ${defender.name} đã bị phá vỡ!`);
            }
        }

        if (damageDealt > 0) {
            updatedDefender.hp = Math.max(0, updatedDefender.hp - damageDealt);
        }
        logs.push(`${attacker.name} tấn công ${defender.name}${isCrit ? ' một đòn CHÍ MẠNG' : ''}, gây ${finalDamage} sát thương!`);
        if (isDefending) logs.push(`${defender.name} đã phòng thủ, giảm thiểu sát thương!`);

        // 6. Handle On-Hit Effects from Attacker
        (attacker.effects || []).forEach(effect => {
            if (Math.random() < (effect.chance || 1)) {
                switch (effect.type) {
                    case SpecialEffectType.LIFESTEAL:
                        const healedAmount = Math.floor(finalDamage * (effect.value || 0));
                        if (healedAmount > 0) {
                            updatedAttacker.hp = Math.min(updatedAttacker.maxHp, updatedAttacker.hp + healedAmount);
                            logs.push(`${attacker.name} hút ${healedAmount} Sinh Lực từ ${defender.name}!`);
                        }
                        break;
                    case SpecialEffectType.APPLY_STATUS_ON_HIT:
                        if (effect.status) {
                             const isImmune = updatedDefender.effects?.some(e => e.type === SpecialEffectType.STATUS_IMMUNITY);
                             if (isImmune && effect.status.name === 'Choáng') {
                                 logs.push(`${updatedDefender.name} miễn nhiễm với hiệu ứng Choáng!`);
                             } else if (!updatedDefender.statuses.some(s => s.name === effect.status!.name)) {
                                updatedDefender.statuses.push({ ...effect.status });
                                logs.push(`${defender.name} bị ${effect.status.name}!`);
                            }
                        }
                        break;
                }
            }
        });

        // 7. Handle On-Hit Effects from Defender (Thorns)
        (defender.effects || []).forEach(effect => {
             if (Math.random() < (effect.chance || 1)) {
                switch (effect.type) {
                    case SpecialEffectType.THORNS_DAMAGE:
                        const thornDamage = Math.floor((effect.value || 0) * finalDamage);
                        if (thornDamage > 0) {
                            updatedAttacker.hp = Math.max(0, updatedAttacker.hp - thornDamage);
                            logs.push(`${attacker.name} nhận ${thornDamage} sát thương phản lại từ ${defender.name}!`);
                        }
                        break;
                    case SpecialEffectType.THORNS_STATUS:
                        if (effect.status) {
                            if (!updatedAttacker.statuses.some(s => s.name === effect.status!.name)) {
                                updatedAttacker.statuses.push({ ...effect.status });
                                logs.push(`${attacker.name} bị ${effect.status.name} khi tấn công ${defender.name}!`);
                            }
                        }
                        break;
                }
            }
        });

        return { logs, updatedAttacker, updatedDefender, attackLanded: true };
    }, []);
    

    const executeAttackAction = (attacker: Combatant, defender: Combatant) => (currentCombatants: Combatant[]): { logs: string[], updatedCombatants: Combatant[] } => {
        let totalLogs: string[] = [];
        let finalAttackerState = { ...currentCombatants.find(c => c.id === attacker.id)! };
        let finalDefenderState = { ...currentCombatants.find(c => c.id === defender.id)! };

        const doubleAttackEffect = attacker.effects?.find(e => e.type === SpecialEffectType.DOUBLE_ATTACK);
        const hasDoubleAttack = doubleAttackEffect && Math.random() < (doubleAttackEffect.chance || 0);
        const numAttacks = hasDoubleAttack ? 2 : 1;
        
        if (hasDoubleAttack) {
             totalLogs.push(`${attacker.name} kích hoạt Tấn công hai lần!`);
        }

        for (let i = 0; i < numAttacks; i++) {
             if (finalDefenderState.hp <= 0) break;
             if (i > 0) totalLogs.push(`Đòn tấn công thứ hai!`);

             const result = resolveAttack(finalAttackerState, finalDefenderState);
             totalLogs = [...totalLogs, ...result.logs];
             finalAttackerState = result.updatedAttacker;
             finalDefenderState = result.updatedDefender;
        }

        const finalCombatants = currentCombatants.map(c => {
            if (c.id === finalAttackerState.id) return finalAttackerState;
            if (c.id === finalDefenderState.id) return finalDefenderState;
            return c;
        });

        return { logs: totalLogs, updatedCombatants: finalCombatants };
    };

    const executeSkillAction = useCallback((attacker: Combatant, targets: Combatant[], skill: Skill) => (currentCombatants: Combatant[]): { logs: string[], updatedCombatants: Combatant[] } => {
        let logs = [`${attacker.name} sử dụng ${skill.name}!`];
    
        let finalCombatants = [...currentCombatants];
    
        // Deduct cost and set cooldown on the attacker
        finalCombatants = finalCombatants.map(c => {
            if (c.id === attacker.id) {
                return {
                    ...c,
                    mp: c.mp - skill.cost,
                    cooldowns: { ...(c.cooldowns || {}), [skill.id]: skill.cooldown + 1 } // +1 because it ticks down at the end of this turn
                };
            }
            return c;
        });
        
        let targetIds = new Set(targets.map(t => t.id));
        let attackerId = attacker.id;
    
        skill.effects.forEach(effect => {
            switch (effect.type) {
                case SkillEffectType.DAMAGE:
                    finalCombatants = finalCombatants.map(c => {
                        if (targetIds.has(c.id)) {
                            const damage = Math.max(1, Math.floor(attacker.atk * (effect.value || 1)) - c.mdef);
                            let damageTaken = damage;
                            let newShield = c.shield || 0;
    
                            if (newShield > 0) {
                                const shieldDamage = Math.min(newShield, damageTaken);
                                newShield -= shieldDamage;
                                damageTaken -= shieldDamage;
                                logs.push(`${c.name} hấp thụ ${shieldDamage} sát thương phép bằng khiên!`);
                            }
                            
                            logs.push(`${c.name} nhận ${damageTaken} sát thương phép!`);
                            return { ...c, shield: newShield, hp: Math.max(0, c.hp - damageTaken) };
                        }
                        return c;
                    });
                    break;
                case SkillEffectType.HEAL:
                    finalCombatants = finalCombatants.map(c => {
                        if (c.id === attackerId) {
                            const healAmount = Math.floor(c.maxHp * (effect.value || 0));
                            logs.push(`${c.name} hồi ${healAmount} Sinh Lực!`);
                            return { ...c, hp: Math.min(c.maxHp, c.hp + healAmount) };
                        }
                        return c;
                    });
                    break;
                case SkillEffectType.APPLY_STATUS:
                     if (effect.status) {
                         finalCombatants = finalCombatants.map(c => {
                            if (targetIds.has(c.id) && !c.statuses.some(s => s.name === effect.status!.name)) {
                                logs.push(`${c.name} bị ${effect.status.name}!`);
                                return { ...c, statuses: [...c.statuses, { ...effect.status! }] };
                            }
                            return c;
                         });
                     }
                     break;
            }
        });
    
        return { logs, updatedCombatants: finalCombatants };
    }, []);
    
    const executeNpcTurnAI = useCallback((npc: Combatant) => {
        const playerTarget = combatants.find(c => c.type === 'PLAYER' && c.hp > 0);
        if (!playerTarget) {
            executeAction(() => ({ logs: [], updatedCombatants: combatants }), npc.id);
            return;
        }

        const usableSkills = (npc.skills || []).filter(skill => 
            npc.mp >= skill.cost && 
            (!npc.cooldowns || (npc.cooldowns[skill.id] || 0) <= 0)
        );

        // Priority #2: Heal if HP is low
        if (npc.hp / npc.maxHp <= 0.25) {
            const healSkill = usableSkills.find(s => s.target === 'SELF' && s.effects.some(e => e.type === SkillEffectType.HEAL));
            if (healSkill) {
                executeAction(executeSkillAction(npc, [npc], healSkill), npc.id);
                return;
            }
        }
        
        // Priority #1: Use best damage skill
        const damageSkills = usableSkills.filter(s => s.effects.some(e => e.type === SkillEffectType.DAMAGE));
        if (damageSkills.length > 0) {
            // Simple logic: use the first available damage skill. Can be improved later.
            const skillToUse = damageSkills[0]; 
            const targets = skillToUse.target === 'SINGLE_ENEMY' ? [playerTarget] : enemies.filter(e => e.hp > 0);
            executeAction(executeSkillAction(npc, targets, skillToUse), npc.id);
            return;
        }

        // Priority #3: Basic attack
        executeAction(executeAttackAction(npc, playerTarget), npc.id);
    }, [combatants, enemies, executeAction, executeAttackAction, executeSkillAction]);

    const handlePlayerAttack = () => {
        if (!player || !selectedTargetId) return;
        const target = combatants.find(c => c.id === selectedTargetId);
        if (!target) return;
        executeAction(executeAttackAction(player, target), player.id);
    };

    const handlePlayerDefend = () => {
        if (!player) return;
        
        executeAction((currentCombatants) => {
            const logs = [`${player.name} vào thế phòng thủ!`];
            const updatedCombatants = currentCombatants.map(c => {
                if (c.id === player.id) {
                    const newStatuses = c.statuses.filter(s => s.name !== "Phòng thủ");
                    const defendStatus: Combatant['statuses'][0] = { name: "Phòng thủ", description: "Tăng cường phòng ngự, giảm sát thương nhận vào.", effect: "x2 Phòng Ngự", duration: 2, type: StatType.GOOD };
                    newStatuses.push(defendStatus);
                    return { ...c, statuses: newStatuses };
                }
                return c;
            });
            return { logs, updatedCombatants };
        }, player.id);
    };

    const handlePlayerSkill = (skill: Skill) => {
        if (!player) return;
    
        // Check cost
        if (player.mp < skill.cost) {
            addToLog(`Không đủ Linh Lực để sử dụng ${skill.name}!`);
            return;
        }
    
        // Check cooldown
        if (player.cooldowns && player.cooldowns[skill.id] > 0) {
            addToLog(`${skill.name} đang trong thời gian hồi!`);
            return;
        }
    
        let targets: Combatant[] = [];
        switch (skill.target) {
            case 'SELF':
                targets = [player];
                break;
            case 'SINGLE_ENEMY':
                if (!selectedTargetId) {
                    addToLog('Vui lòng chọn một mục tiêu!');
                    return;
                }
                const target = combatants.find(c => c.id === selectedTargetId);
                if (!target || target.hp <= 0) {
                    addToLog('Mục tiêu không hợp lệ!');
                    return;
                }
                targets = [target];
                break;
            case 'ALL_ENEMIES':
                targets = enemies.filter(e => e.hp > 0);
                if (targets.length === 0) {
                    addToLog('Không có mục tiêu nào để tấn công!');
                    return;
                }
                break;
        }
    
        executeAction(executeSkillAction(player, targets, skill), player.id);
        setPlayerAction('main');
    };

    useEffect(() => {
        const checkCombatEnd = (currentCombatants: Combatant[]) => {
            const livingEnemies = currentCombatants.filter(c => c.type === 'ENEMY' && c.hp > 0);
            const livingPlayer = currentCombatants.find(c => c.type === 'PLAYER');
    
            if (livingPlayer && livingPlayer.hp <= 0) {
                const shieldEffect = player?.effects?.find(e => e.type === SpecialEffectType.OVERHEAL_SHIELD && e.sourceId && !usedOneTimeEffectSources.includes(e.sourceId));

                if (shieldEffect && shieldEffect.sourceId) {
                    addToLog(`${player!.name} được bao bọc bởi một lớp khiên Phượng Hoàng!`);
                    onUseOneTimeEffect(shieldEffect.sourceId);
                    setCombatants(prev => prev.map(c => {
                        if (c.type === 'PLAYER') {
                            const shieldAmount = Math.floor(c.maxHp * (shieldEffect.value || 0));
                            return { ...c, hp: 1, shield: shieldAmount }; 
                        }
                        return c;
                    }));
                    return false; // Combat does not end
                } else {
                    setTimeout(() => endCombat('loss', turnsElapsed, currentCombatants), 500);
                    return true; // Combat ends
                }
            }
    
            if (livingEnemies.length === 0 && gameState.isInCombat && !combatResult) {
                setCombatResult('win');
                addToLog("Tất cả kẻ địch đã bị đánh bại!");
                return true; // Combat ends
            }
            return false; // Combat continues
        };

        if (checkCombatEnd(combatants)) return;
        
        const currentCombatantId = turnOrder[currentTurnIndex];
        const currentCombatant = combatants.find(c => c.id === currentCombatantId);

        if (currentCombatant && currentCombatant.hp <= 0) {
            const timeout = setTimeout(() => {
                addToLog(`${currentCombatant.name} đã bị đánh bại và bỏ qua lượt.`);
                advanceTurn();
            }, 200); // Add a small delay for log readability
            return () => clearTimeout(timeout);
        }
        
        if (currentCombatant?.type === 'ENEMY' && !combatResult) {
            const isStunned = currentCombatant.statuses.some(s => s.name === 'Choáng');
             if (isStunned) {
                const timeout = setTimeout(() => {
                     executeAction((current) => ({ logs: [`${currentCombatant.name} bị choáng và không thể hành động!`], updatedCombatants: current }), currentCombatant.id);
                }, 1000);
                return () => clearTimeout(timeout);
            }

            const aiTurnTimeout = setTimeout(() => {
                executeNpcTurnAI(currentCombatant);
            }, 1000);
            
            return () => clearTimeout(aiTurnTimeout);
        }
    }, [currentTurnIndex, combatants, turnOrder, combatResult, endCombat, addToLog, gameState.isInCombat, turnsElapsed, player, onUseOneTimeEffect, usedOneTimeEffectSources, executeAction, executeNpcTurnAI, advanceTurn]);
    
    // NEW: NPC MP Regeneration every 3 rounds (Silent)
    useEffect(() => {
        if (turnsElapsed > 0 && turnsElapsed % 3 === 0) {
            setCombatants(prevCombatants => 
                prevCombatants.map(c => {
                    if (c.type === 'ENEMY' && c.hp > 0 && c.mp < c.maxMp) {
                        const manaToRestore = Math.floor(c.maxMp * 0.30);
                        const newMp = Math.min(c.maxMp, c.mp + manaToRestore);
                        return { ...c, mp: newMp };
                    }
                    return c;
                })
            );
        }
    }, [turnsElapsed]);


    const isPlayerTurn = player && turnOrder[currentTurnIndex] === player.id && !combatResult;
    
    if (!player) {
        return <div className="h-full flex items-center justify-center">Lỗi: Không tìm thấy người chơi.</div>;
    }

    return (
        <div className="relative h-full text-white flex flex-col p-4 overflow-hidden">
            <div className="absolute inset-0 bg-black/80"></div>

            <div className="relative flex-grow grid grid-cols-3 gap-4 h-full">
                {/* Player Side */}
                <div className="flex flex-col justify-center items-start">
                    <CombatantDisplay combatant={player} />
                </div>
                
                {/* Center - Spacer/Visuals */}
                <div></div>

                {/* Enemy Side */}
                <div className="flex flex-col justify-center items-end gap-y-4">
                    {enemies.map(enemy => (
                         <button key={enemy.id} onClick={() => enemy.hp > 0 && setSelectedTargetId(enemy.id)} className={`w-full transition-all duration-200 disabled:opacity-50 ${selectedTargetId === enemy.id ? 'transform scale-105' : ''} ${enemy.hp <= 0 ? 'opacity-50' : ''}`} disabled={enemy.hp <= 0}>
                            <CombatantDisplay combatant={enemy} />
                         </button>
                    ))}
                </div>
            </div>

            {/* Log & Actions Panel */}
            <div className="relative flex-shrink-0 h-1/3 grid grid-cols-2 gap-4 mt-4">
                 {/* Combat Log */}
                 <div className="bg-black/80 rounded-lg p-3 flex flex-col-reverse overflow-y-auto border border-neutral-700 custom-scrollbar">
                    <div className="space-y-1">
                        {combatLog.map((msg, i) => <p key={i} className="text-sm animate-fade-in-fast">{msg}</p>)}
                    </div>
                 </div>

                {/* Actions */}
                <div className="bg-black/80 rounded-lg p-3 border border-neutral-700">
                    {combatResult === 'win' ? (
                        <div className="h-full flex items-center justify-center">
                             <Button onClick={() => endCombat('win', turnsElapsed, combatants)}>Thu Thập Chiến Lợi Phẩm</Button>
                        </div>
                    ) : (
                        isPlayerTurn ? (
                            playerAction === 'main' ? (
                                <div className="grid grid-cols-2 gap-3 h-full">
                                    <Button variant="primary" onClick={handlePlayerAttack} disabled={!selectedTargetId || enemies.find(e => e.id === selectedTargetId)?.hp <= 0}>Tấn Công</Button>
                                    <Button variant="secondary" onClick={() => setPlayerAction('skill')}>Kỹ Năng</Button>
                                    <Button variant="secondary" disabled>Vật Phẩm</Button>
                                    <Button variant="secondary" onClick={handlePlayerDefend}>Phòng Thủ</Button>
                                    <Button variant="secondary" onClick={() => endCombat('flee', turnsElapsed, combatants)} className="col-span-2">Bỏ Chạy</Button>
                                </div>
                            ) : playerAction === 'skill' ? (
                                <div className="h-full flex flex-col">
                                    <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {(player.skills || []).length > 0 ? (
                                            (player.skills || []).map(skill => {
                                                const isOnCooldown = player.cooldowns && (player.cooldowns[skill.id] || 0) > 0;
                                                const notEnoughMp = player.mp < skill.cost;
                                                const disabled = isOnCooldown || notEnoughMp;
                                                return (
                                                    <button
                                                        key={skill.id}
                                                        onClick={() => handlePlayerSkill(skill)}
                                                        disabled={disabled}
                                                        className="w-full text-left p-2 rounded-md bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-500 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <div className="flex justify-between font-semibold">
                                                            <span>{skill.name}</span>
                                                            <span>{skill.cost} LP</span>
                                                        </div>
                                                        <p className="text-xs text-neutral-400">{skill.description}</p>
                                                        {isOnCooldown && <p className="text-xs text-yellow-400">Hồi chiêu: {player.cooldowns![skill.id]} lượt</p>}
                                                        {notEnoughMp && <p className="text-xs text-red-400">Không đủ Linh Lực</p>}
                                                    </button>
                                                )
                                            })
                                        ) : (
                                            <p className="text-center text-neutral-500">Không có kỹ năng nào.</p>
                                        )}
                                    </div>
                                    <Button variant="secondary" onClick={() => setPlayerAction('main')} className="mt-2 flex-shrink-0">Quay Lại</Button>
                                </div>
                            ) : null
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-lg font-bold animate-pulse">Lượt của đối phương...</p>
                            </div>
                        )
                    )}
                </div>
            </div>
            <style>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; } to { opacity: 1; }
                }
                .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-in forwards; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #4A5568; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #718096; }
            `}</style>
        </div>
    );
};

export default CombatScreen;
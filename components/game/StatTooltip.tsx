import React, { useState, useMemo } from 'react';
import { GameState, Equipment, SpecialEffect, StatType, CharacterStat, CoreStatLinkTarget } from '../../types';

interface StatTooltipProps {
  children: React.ReactNode;
  statId: keyof GameState['coreStats'];
  gameState: GameState;
}

const StatTooltip: React.FC<StatTooltipProps> = ({ children, statId, gameState }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { coreStats, equipment, playerStats, worldContext } = gameState;

  const calculation = useMemo(() => {
    const baseAttr = worldContext.customAttributes.find(attr => attr.id === statId);
    let baseValue = baseAttr?.baseValue ?? 0;
    let fromLinks = 0;
    let fromEquipment = 0;
    
    // Calculate bonus from attribute links
    worldContext.customAttributes.forEach(attr => {
        if (attr.links) {
            attr.links.forEach(link => {
                if (link.targetStat === statId) {
                     const sourceValue = coreStats[attr.id as keyof GameState['coreStats']] ?? 0;
                     if(link.effectType === 'FLAT') {
                         fromLinks += Math.floor(sourceValue / link.ratio) * link.value;
                     }
                }
            });
        }
    });

    // Calculate bonus from equipment
    Object.values(equipment).forEach(item => {
      // FIX: Explicitly cast `item` to Equipment because type inference from Object.values is failing in this environment.
      const equipmentItem = item as Equipment | null;
      if (equipmentItem && equipmentItem.stats && equipmentItem.stats[statId] !== undefined) {
        fromEquipment += equipmentItem.stats[statId]!;
      }
    });

    const total = baseValue + fromLinks + fromEquipment;

    return {
      name: baseAttr?.name || statId,
      description: baseAttr?.description || '',
      baseValue,
      fromLinks,
      fromEquipment,
      total,
    };
  }, [statId, coreStats, equipment, playerStats, worldContext]);

  if (!calculation) return <>{children}</>;

  return (
    <div 
        className="relative"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 w-64 p-3 bg-neutral-900/80 backdrop-blur-sm border border-neutral-600 rounded-lg shadow-xl text-sm animate-fade-in-fast pointer-events-none">
          <h4 className="font-bold text-base text-cyan-300">{calculation.name}</h4>
          <p className="text-xs text-neutral-400 italic mb-2">{calculation.description}</p>
          <hr className="border-neutral-700 my-2" />
          <div className="space-y-1 text-xs">
            <div className="flex justify-between"><span>Cơ bản:</span> <span className="font-mono">{calculation.baseValue.toFixed(2)}</span></div>
            {calculation.fromLinks > 0 && <div className="flex justify-between"><span>+ Từ Liên kết:</span> <span className="font-mono text-yellow-300">{calculation.fromLinks.toFixed(2)}</span></div>}
            {calculation.fromEquipment > 0 && <div className="flex justify-between"><span>+ Từ Trang bị:</span> <span className="font-mono text-green-400">{calculation.fromEquipment.toFixed(2)}</span></div>}
          </div>
          <hr className="border-neutral-700 my-2" />
          <div className="flex justify-between font-bold text-white">
            <span>Tổng cộng:</span>
            <span className="font-mono">{calculation.total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatTooltip;
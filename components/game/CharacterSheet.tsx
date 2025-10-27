import React, { useMemo } from 'react';
import { GameState, AttributeType } from '../../types';
import { getRealmString } from '../../services/CultivationService';
import { GetIconComponent } from '../icons/AttributeIcons';
import { AtkIcon, DefIcon, MDefIcon, AgiIcon, CritIcon, CritDmgIcon, CdrIcon } from '../icons/CombatStatIcons';

interface CharacterSheetProps {
  gameState: GameState;
}

const Section: React.FC<{ title: string, children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={`bg-black/20 p-3 rounded-xl border border-white/10 ${className}`}>
        <h3 className="text-md font-bold text-white mb-3 font-rajdhani uppercase tracking-wider">{title}</h3>
        {children}
    </div>
);

const StatBar: React.FC<{ current: number; max: number; barColor: string; label: string }> = ({ current, max, barColor, label }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between text-xs mb-1 font-semibold">
                <span className="text-neutral-300">{label}</span>
                <span className="font-mono">{`${Math.floor(current)}/${max}`}</span>
            </div>
            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-black/50">
                <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const StatGridItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number; title: string }> = ({ icon, label, value, title }) => (
    <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-lg border border-transparent hover:border-neutral-600 transition-colors" title={title}>
        <div className="w-6 h-6 flex-shrink-0 text-neutral-300 bg-black/30 rounded p-1">{icon}</div>
        <div className="flex-grow min-w-0">
            <p className="text-xs font-semibold text-white truncate">{label}</p>
            <p className="text-sm font-bold text-cyan-300 font-mono">{value}</p>
        </div>
    </div>
);


const CharacterSheet: React.FC<CharacterSheetProps> = ({ gameState }) => {
    const { worldContext, coreStats, cultivation, playerTitle } = gameState;
    const { character } = worldContext;

    const realmString = getRealmString(cultivation.level, worldContext);
    const genderString = character.gender === 'Tự định nghĩa' ? character.customGender : character.gender;

    const VITAL_BAR_COLORS: Record<string, string> = {
        sinhLucToiDa: 'bg-gradient-to-r from-red-500 to-red-600',
        linhLucToiDa: 'bg-gradient-to-r from-blue-500 to-cyan-500',
        theLucToiDa: 'bg-gradient-to-r from-yellow-500 to-amber-500',
        doNoToiDa: 'bg-gradient-to-r from-orange-500 to-amber-600',
        doNuocToiDa: 'bg-gradient-to-r from-sky-500 to-blue-600',
        default: 'bg-gradient-to-r from-gray-500 to-gray-600',
    };

    const { vitalAttributes, primaryAttributes, informationalAttributes } = useMemo(() => ({
        vitalAttributes: worldContext.customAttributes.filter(attr => attr.type === AttributeType.VITAL),
        primaryAttributes: worldContext.customAttributes.filter(attr => attr.type === AttributeType.PRIMARY),
        informationalAttributes: worldContext.customAttributes.filter(attr => attr.type === AttributeType.INFORMATIONAL),
    }), [worldContext.customAttributes]);

    const formatStatValue = (value: number, attributeId: string): string => {
        if (['chiMang', 'satThuongChiMang', 'giamHoiChieu'].includes(attributeId)) {
            return `${(value * 100).toFixed(0)}%`;
        }
        return String(Math.floor(value));
    };

    return (
        <div className="p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar h-full">
            <Section title="Nhân Vật">
                <div className="flex gap-4">
                    <img src={character.avatarUrl || 'https://via.placeholder.com/80'} alt="Avatar" className="w-20 h-20 rounded-full border-2 border-neutral-600 object-cover flex-shrink-0" />
                    <div className="flex-grow space-y-1">
                        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 font-rajdhani truncate" title={character.name}>{character.name}</h2>
                        {playerTitle && <p className="text-xs text-yellow-300 font-semibold truncate" title={playerTitle}>{playerTitle}</p>}
                        <p className="text-xs text-neutral-400">Tuổi: {character.age} | {genderString}</p>
                        <p className="text-sm"><span className="font-semibold text-neutral-300">Tính cách:</span> {character.personality || 'Chưa xác định'}</p>
                    </div>
                </div>
            </Section>

            <Section title="Tài Nguyên">
                <div className="space-y-3">
                    {vitalAttributes.map(attr => {
                        const currentStatKey = attr.id.replace('ToiDa', '');
                        const currentValue = (coreStats as any)[currentStatKey] ?? 0;
                        const maxValue = (coreStats as any)[attr.id] ?? 0;
                        return <StatBar key={attr.id} current={currentValue} max={maxValue} barColor={VITAL_BAR_COLORS[attr.id] || VITAL_BAR_COLORS.default} label={attr.name} />;
                    })}
                </div>
            </Section>

            <Section title="Tu Luyện">
                <p className="text-lg font-bold text-purple-300 text-center">{realmString}</p>
                <StatBar current={cultivation.exp} max={cultivation.expToNextLevel} barColor="bg-gradient-to-r from-purple-500 to-pink-500" label="Kinh nghiệm" />
            </Section>

            <Section title="Chỉ Số Cốt Lõi">
                <div className="grid grid-cols-2 gap-2">
                    {[...primaryAttributes, ...informationalAttributes].map(attr => {
                        const value = (coreStats as any)[attr.id] ?? attr.baseValue;
                        return <StatGridItem key={attr.id} icon={<GetIconComponent name={attr.icon} className="w-full h-full"/>} label={attr.name} value={formatStatValue(value, attr.id)} title={attr.description}/>
                    })}
                </div>
            </Section>
        </div>
    );
};

export default CharacterSheet;

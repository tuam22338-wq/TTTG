import React from 'react';
import { GameState, CharacterStat, StatType } from '../../types';
import { getRealmString } from '../../services/CultivationService';
import { AtkIcon, DefIcon, MDefIcon, AgiIcon, CritIcon, CritDmgIcon, CdrIcon } from '../icons/CombatStatIcons';

interface CharacterSheetProps {
    gameState: GameState;
    onStatClick: (stat: CharacterStat & { name: string }, ownerName: string, ownerType: 'player' | 'npc', ownerId?: string) => void;
    recentlyUpdatedStats: Set<string>;
}

const StatBar: React.FC<{ current: number; max: number; barColor: string; label: string }> = ({ current, max, barColor, label }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-neutral-300">{label}</span>
                <span className="font-mono">{`${Math.floor(current)}/${max}`}</span>
            </div>
            <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-black/50">
                <div className={`${barColor} h-full rounded-full transition-all duration-300`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const CombatStat: React.FC<{ icon: React.ReactNode; label: string; value: string | number; title: string }> = ({ icon, label, value, title }) => (
    <div className="flex items-center gap-2 bg-black/30 p-2 rounded-md" title={title}>
        <div className="w-5 h-5 text-neutral-400">{icon}</div>
        <div className="flex-grow">
            <p className="text-xs text-neutral-400">{label}</p>
            <p className="text-sm font-bold text-white font-mono">{value}</p>
        </div>
    </div>
);

const getStatTheme = (type: StatType) => {
    switch (type) {
        case StatType.GOOD: return { border: 'border-l-green-400', bg: 'bg-green-900/10' };
        case StatType.BAD: return { border: 'border-l-red-400', bg: 'bg-red-900/10' };
        case StatType.INJURY: return { border: 'border-l-orange-400', bg: 'bg-orange-900/10' };
        case StatType.NSFW: return { border: 'border-l-pink-400', bg: 'bg-pink-900/10' };
        case StatType.KNOWLEDGE: return { border: 'border-l-blue-400', bg: 'bg-blue-900/10' };
        default: return { border: 'border-l-gray-500', bg: 'bg-gray-900/20' };
    }
};

const CharacterSheet: React.FC<CharacterSheetProps> = ({ gameState, onStatClick, recentlyUpdatedStats }) => {
    const { playerStats, playerStatOrder, coreStats, cultivation, worldContext } = gameState;
    const realmString = getRealmString(cultivation.level, worldContext);

    const formatPercent = (value: number) => `${(value * 100).toFixed(0)}%`;

    const combatStats = [
        { icon: <AtkIcon />, label: 'Công Kích', value: coreStats.congKich, title: 'Sát thương vật lý cơ bản' },
        { icon: <DefIcon />, label: 'Phòng Ngự', value: coreStats.phongNgu, title: 'Chống chịu sát thương vật lý' },
        { icon: <MDefIcon />, label: 'Kháng Phép', value: coreStats.khangPhep, title: 'Chống chịu sát thương phép' },
        { icon: <AgiIcon />, label: 'Thân Pháp', value: coreStats.thanPhap, title: 'Tốc độ, né tránh' },
        { icon: <CritIcon />, label: 'Tỉ Lệ Chí Mạng', value: formatPercent(coreStats.chiMang), title: 'Cơ hội gây sát thương chí mạng' },
        { icon: <CritDmgIcon />, label: 'ST Chí Mạng', value: formatPercent(coreStats.satThuongChiMang), title: 'Bội số sát thương khi chí mạng' },
        { icon: <CdrIcon />, label: 'Giảm Hồi Chiêu', value: formatPercent(coreStats.giamHoiChieu), title: 'Giảm thời gian hồi kỹ năng' },
    ];
    
    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-4 space-y-6">
            <section>
                <h3 className="text-lg font-bold text-white mb-3">Tài Nguyên</h3>
                <div className="space-y-3">
                    <StatBar current={coreStats.sinhLuc} max={coreStats.sinhLucToiDa} barColor="bg-gradient-to-r from-red-500 to-red-600" label="Sinh Lực" />
                    <StatBar current={coreStats.linhLuc} max={coreStats.linhLucToiDa} barColor="bg-gradient-to-r from-blue-500 to-cyan-500" label="Linh Lực" />
                    <StatBar current={coreStats.theLuc} max={coreStats.theLucToiDa} barColor="bg-gradient-to-r from-yellow-500 to-amber-500" label="Thể Lực" />
                </div>
            </section>

            <section>
                <h3 className="text-lg font-bold text-white mb-3">Chỉ số Chiến Đấu</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {combatStats.map(stat => <CombatStat key={stat.label} {...stat} />)}
                </div>
            </section>

            <section>
                <h3 className="text-lg font-bold text-white mb-3">Trạng Thái & Thuộc Tính</h3>
                {playerStatOrder.length > 0 ? (
                    <div className="space-y-2">
                        {playerStatOrder.map(statName => {
                            const stat = playerStats[statName];
                            if (!stat) return null;
                            const theme = getStatTheme(stat.type);
                            return (
                                <button key={statName} onClick={() => onStatClick({ ...stat, name: statName }, worldContext.character.name, 'player')} className={`w-full text-left p-3 rounded-md border-l-4 transition-colors hover:bg-neutral-700/50 ${theme.border} ${theme.bg}`}>
                                    <p className="font-bold text-white">{statName}</p>
                                    <p className="text-sm text-neutral-400 truncate">{stat.description}</p>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-neutral-500 italic">Không có trạng thái đặc biệt nào.</p>
                )}
            </section>
        </div>
    );
};

export default CharacterSheet;

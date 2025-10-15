import React from 'react';
import { CharacterCoreStats, CultivationState } from '../../types';
import { AtkIcon, DefIcon, AgiIcon, CritIcon, CritDmgIcon, CdrIcon, MDefIcon } from '../icons/CombatStatIcons';


interface DetailedStatsPanelProps {
    stats: CharacterCoreStats | null;
    cultivation: CultivationState | undefined;
}

const StatBar: React.FC<{
    current: number;
    max: number;
    label: string;
    barColor: string;
    borderColor: string;
    showValue?: boolean;
}> = ({ current, max, label, barColor, borderColor, showValue = true }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between items-baseline text-xs mb-1">
                <span className="font-semibold text-neutral-400">{label}</span>
                {showValue && <span className="font-bold text-white font-mono">{`${Math.floor(current)} / ${max}`}</span>}
            </div>
            <div className={`h-2.5 w-full bg-black/50 rounded-full overflow-hidden border ${borderColor}`}>
                <div className={`h-full ${barColor} rounded-full transition-all duration-500 ease-linear`} style={{ width: `${percentage}%` }} title={`${label}: ${Math.floor(current)} / ${max}`}></div>
            </div>
        </div>
    );
};

const StatGridItem: React.FC<{ label: string; value: string; icon: React.ReactNode; title: string; }> = ({ label, value, icon, title }) => (
    <div className="bg-black/20 p-2 rounded-md flex items-center gap-2" title={title}>
        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-neutral-400">{icon}</div>
        <div className="flex-grow flex justify-between items-baseline min-w-0">
            <span className="text-sm font-semibold text-neutral-300 truncate">{label}</span>
            <span className="font-bold text-white font-mono text-sm">{value}</span>
        </div>
    </div>
);


const DetailedStatsPanel: React.FC<DetailedStatsPanelProps> = ({ stats, cultivation }) => {

    if (!stats || !cultivation) {
        return (
            <div className="p-4 text-center text-gray-500">
                Đang tải dữ liệu nhân vật...
            </div>
        );
    }

    const STAT_DEFINITIONS = [
        { key: 'congKich', label: 'Công Kích', icon: <AtkIcon />, title: 'Sát thương vật lý cơ bản' },
        { key: 'phongNgu', label: 'Phòng Ngự', icon: <DefIcon />, title: 'Khả năng chống chịu sát thương vật lý' },
        { key: 'khangPhep', label: 'Kháng Phép', icon: <MDefIcon />, title: 'Khả năng chống chịu sát thương phép' },
        { key: 'thanPhap', label: 'Thân Pháp', icon: <AgiIcon />, title: 'Tốc độ, sự nhanh nhẹn' },
        { key: 'chiMang', label: 'Tỉ Lệ Chí Mạng', icon: <CritIcon />, title: 'Cơ hội gây sát thương chí mạng', isPercent: true },
        { key: 'satThuongChiMang', label: 'ST Chí Mạng', icon: <CritDmgIcon />, title: 'Bội số sát thương khi chí mạng', isPercent: true },
        { key: 'giamHoiChieu', label: 'Giảm Hồi Chiêu', icon: <CdrIcon />, title: 'Tỉ lệ giảm thời gian hồi kỹ năng', isPercent: true },
    ];

    const formatValue = (key: keyof CharacterCoreStats, value: number, isPercent?: boolean) => {
        if (isPercent) {
             return `${(value * 100).toFixed(1)}%`;
        }
        return String(Math.floor(value));
    };

    return (
        <div className="p-3 bg-black/25 flex-shrink-0">
            <div className="space-y-1.5 mb-4">
                <StatBar current={stats.sinhLuc} max={stats.sinhLucToiDa} label="Sinh Lực" barColor="bg-red-500" borderColor="border-neutral-700" />
                <StatBar current={stats.linhLuc} max={stats.linhLucToiDa} label="Linh Lực" barColor="bg-blue-500" borderColor="border-neutral-700" />
                <StatBar current={stats.theLuc} max={stats.theLucToiDa} label="Thể Lực" barColor="bg-green-500" borderColor="border-neutral-700" />
                <StatBar current={stats.doNo} max={stats.doNoToiDa} label="Độ No" barColor="bg-orange-500" borderColor="border-neutral-700" />
                <StatBar current={stats.doNuoc} max={stats.doNuocToiDa} label="Độ Nước" barColor="bg-sky-500" borderColor="border-neutral-700" />
            </div>
            
            <div>
                 <h3 className="text-sm font-semibold uppercase text-neutral-500 tracking-wider mb-2 text-center">Chỉ số Chiến đấu</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                    {STAT_DEFINITIONS.map(def => (
                        <StatGridItem
                            key={def.key}
                            label={def.label}
                            value={formatValue(def.key as keyof CharacterCoreStats, stats[def.key as keyof CharacterCoreStats], def.isPercent)}
                            icon={def.icon}
                            title={def.title}
                        />
                    ))}
                 </div>
            </div>
        </div>
    );
};

export default DetailedStatsPanel;
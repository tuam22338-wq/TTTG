import React, { useMemo } from 'react';
import * as CultivationService from '../../services/CultivationService';
import { CharacterCoreStats } from '../../types';

const StatRow: React.FC<{ label: string; value: string | number; title: string }> = ({ label, value, title }) => (
    <div className="flex justify-between items-baseline py-1.5 px-3 rounded bg-black/20" title={title}>
        <span className="text-sm font-semibold text-neutral-400">{label}:</span>
        <span className="text-sm font-bold text-white font-mono">{value}</span>
    </div>
);

const formatPercent = (value: number) => `${(value * 100).toFixed(0)}%`;

const BaseStatsDisplay: React.FC = () => {
    const initialStats = useMemo(() => CultivationService.calculateInitialStats(), []);

    const STAT_DEFINITIONS: { key: keyof CharacterCoreStats; label: string; title: string, isPercent?: boolean }[] = [
        { key: 'sinhLucToiDa', label: 'Sinh Lực', title: 'Điểm sinh mệnh tối đa' },
        { key: 'linhLucToiDa', label: 'Linh Lực', title: 'Điểm năng lượng/phép thuật tối đa' },
        { key: 'theLucToiDa', label: 'Thể Lực', title: 'Điểm thể lực tối đa' },
        { key: 'congKich', label: 'Công Kích', title: 'Sát thương vật lý cơ bản' },
        { key: 'phongNgu', label: 'Phòng Ngự', title: 'Khả năng chống chịu sát thương vật lý' },
        { key: 'khangPhep', label: 'Kháng Phép', title: 'Khả năng chống chịu sát thương phép' },
        { key: 'thanPhap', label: 'Thân Pháp', title: 'Tốc độ, sự nhanh nhẹn' },
        { key: 'chiMang', label: 'Tỉ Lệ Chí Mạng', title: 'Cơ hội gây sát thương chí mạng', isPercent: true },
        { key: 'satThuongChiMang', label: 'ST Chí Mạng', title: 'Bội số sát thương khi chí mạng', isPercent: true },
        { key: 'giamHoiChieu', label: 'Giảm Hồi Chiêu', title: 'Tỉ lệ giảm thời gian hồi kỹ năng', isPercent: true },
    ];


    return (
        <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Các thuộc tính khởi đầu (Cấp 1)</label>
            <div className="p-3 bg-neutral-900/50 rounded-lg border border-neutral-700">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {STAT_DEFINITIONS.map(def => (
                        <StatRow 
                            key={def.key}
                            label={def.label}
                            value={def.isPercent ? formatPercent(initialStats[def.key]) : initialStats[def.key]}
                            title={def.title}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BaseStatsDisplay;
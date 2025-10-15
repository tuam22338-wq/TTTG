import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { CultivationStatBonus, CharacterCoreStats } from '../../types';

interface StatBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBonus: (bonus: CultivationStatBonus) => void;
}

type BonusStatKey = CultivationStatBonus['stat'];

export const STAT_BONUS_OPTIONS: { value: BonusStatKey; label: string }[] = [
    { value: 'sinhLucToiDa', label: 'Sinh Lực Tối đa' },
    { value: 'linhLucToiDa', label: 'Linh Lực Tối đa' },
    { value: 'theLucToiDa', label: 'Thể Lực Tối đa' },
    { value: 'doNoToiDa', label: 'Độ No Tối đa' },
    { value: 'doNuocToiDa', label: 'Độ Nước Tối đa' },
    { value: 'congKich', label: 'Công Kích' },
    { value: 'phongNgu', label: 'Phòng Ngự' },
    { value: 'khangPhep', label: 'Kháng Phép' },
    { value: 'thanPhap', label: 'Thân Pháp' },
];


const StatBonusModal: React.FC<StatBonusModalProps> = ({ isOpen, onClose, onAddBonus }) => {
  const [selectedStat, setSelectedStat] = useState<BonusStatKey>('sinhLucToiDa');
  const [value, setValue] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setSelectedStat('sinhLucToiDa');
      setValue(0);
    }
  }, [isOpen]);

  const handleAdd = () => {
    if (value > 0) {
      onAddBonus({ stat: selectedStat, value });
      onClose();
    }
  };

  const unifiedClass = "w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500";


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm Thuộc Tính">
        <div className="space-y-4">
            <div>
                <label htmlFor="stat-select" className="block text-sm font-medium text-neutral-300 mb-2">Chọn Thuộc Tính</label>
                <select id="stat-select" value={selectedStat} onChange={e => setSelectedStat(e.target.value as BonusStatKey)} className={unifiedClass}>
                    {STAT_BONUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
             <div>
                <label htmlFor="stat-value" className="block text-sm font-medium text-neutral-300 mb-2">Giá trị cộng thêm</label>
                <input
                    id="stat-value"
                    type="number"
                    value={value}
                    onChange={e => setValue(parseInt(e.target.value, 10) || 0)}
                    className={unifiedClass}
                    placeholder="Nhập số"
                />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button onClick={onClose} variant="secondary">Hủy</Button>
                <Button onClick={handleAdd} disabled={value <= 0}>Thêm</Button>
            </div>
        </div>
    </Modal>
  );
};

export default StatBonusModal;

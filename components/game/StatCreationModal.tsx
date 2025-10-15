
import React, { useState, useEffect } from 'react';
import { CharacterStat, StatType } from '../../types';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import TextareaField from '../ui/TextareaField';
import Modal from '../ui/Modal';

interface StatCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newStatData: CharacterStat & { name: string }) => void;
}

const statTypeOptions: { value: StatType; label: string }[] = [
    { value: StatType.GOOD, label: 'Tốt (GOOD)' },
    { value: StatType.BAD, label: 'Xấu (BAD)' },
    { value: StatType.INJURY, label: 'Thương tích (INJURY)' },
    { value: StatType.NEUTRAL, label: 'Trung lập (NEUTRAL)' },
    { value: StatType.NSFW, label: 'Nhạy cảm (NSFW)' },
    { value: StatType.KNOWLEDGE, label: 'Tri thức (KNOWLEDGE)' },
];


const StatCreationModal: React.FC<StatCreationModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [effect, setEffect] = useState('');
  const [source, setSource] = useState('');
  const [cure, setCure] = useState('');
  const [type, setType] = useState<StatType | ''>('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setName('');
      setDescription('');
      setEffect('');
      setSource('');
      setCure('');
      setType('');
      setDuration('');
    }
  }, [isOpen]);

  const canSubmit = name.trim() !== '' && type !== '';

  const handleSubmit = () => {
    if (!canSubmit) return;
    
    const parsedDuration = parseInt(duration, 10);
    const newStatData: CharacterStat & { name: string } = {
        name: name.trim(),
        description: description.trim(),
        effect: effect.trim(),
        source: source.trim(),
        cure: cure.trim(),
        type: type as StatType, // We know it's not empty because of canSubmit
        duration: duration.trim() === '' || isNaN(parsedDuration) ? undefined : parsedDuration,
    };

    onSubmit(newStatData);
  };

  const unifiedClass = "w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo Thuộc Tính Mới">
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
            <p className="text-sm text-gray-400 pb-2">Tạo ra một trạng thái, hiệu ứng, hoặc tri thức mới cho nhân vật. Thuộc tính sẽ được AI ghi nhận và sử dụng trong các lượt truyện tiếp theo.</p>
            <InputField id="create-stat-name" label="Tên Trạng thái (*)" value={name} onChange={e => setName(e.target.value)} placeholder="VD: Lời nguyền Huyết Ảnh" />
            <div>
                <label htmlFor="create-stat-type" className="block text-sm font-medium text-neutral-400 mb-2">Loại Trạng thái (*)</label>
                <select
                    id="create-stat-type"
                    value={type}
                    onChange={e => setType(e.target.value as StatType | '')}
                    className={unifiedClass}
                >
                    <option value="" disabled>-- Chọn một loại --</option>
                    {statTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
            <TextareaField id="create-stat-desc" label="Mô tả" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Mô tả bản chất của trạng thái này."/>
            <TextareaField id="create-stat-effect" label="Ảnh hưởng" value={effect} onChange={e => setEffect(e.target.value)} rows={3} placeholder="Mô tả hiệu ứng cụ thể lên nhân vật."/>
            <TextareaField id="create-stat-source" label="Nguồn gốc" value={source} onChange={e => setSource(e.target.value)} rows={2} placeholder="Trạng thái này đến từ đâu?"/>
            <TextareaField id="create-stat-cure" label="Cách chữa trị" value={cure} onChange={e => setCure(e.target.value)} rows={2} placeholder="Làm thế nào để loại bỏ trạng thái này?"/>
            <InputField id="create-stat-duration" label="Thời gian (phút, trống = vĩnh viễn)" type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="VD: 60" />
        </div>
        <div className="flex flex-col sm:flex-row-reverse gap-4 pt-6">
            <Button onClick={handleSubmit} disabled={!canSubmit}>Tạo Thuộc Tính</Button>
            <Button onClick={onClose} variant="secondary">Hủy</Button>
        </div>
         <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #555; border-radius: 10px; }
        `}</style>
    </Modal>
  );
};

export default StatCreationModal;

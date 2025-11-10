import React, { useState, useEffect } from 'react';
import { Trigger, TriggerAction, TriggerActionType, CharacterStat, StatType } from '../../../types';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import InputField from '../../ui/InputField';
import TextareaField from '../../ui/TextareaField';
import ToggleSwitch from '../../ui/ToggleSwitch';
import { allPredefinedItems } from '../../../services/predefinedItems';

interface TriggerEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trigger: Trigger) => void;
  trigger: Trigger | null;
  existingIds: string[];
}

const actionTypeOptions: { value: TriggerActionType; label: string }[] = [
    { value: 'NOTIFY', label: 'Hiển thị Thông báo' },
    { value: 'ADD_STAT', label: 'Thêm/Cập nhật Trạng thái' },
    { value: 'GET_ITEM', label: 'Nhận Vật phẩm' },
];

const statTypeOptions: { value: StatType; label: string }[] = [
    { value: StatType.GOOD, label: 'Tốt' }, { value: StatType.BAD, label: 'Xấu' },
    { value: StatType.INJURY, label: 'Thương tích' }, { value: StatType.NEUTRAL, label: 'Trung lập' },
    { value: StatType.NSFW, label: 'Nhạy cảm' }, { value: StatType.KNOWLEDGE, label: 'Tri thức' },
];

const TriggerEditorModal: React.FC<TriggerEditorModalProps> = ({ isOpen, onClose, onSave, trigger, existingIds }) => {
    const [formData, setFormData] = useState<Partial<Trigger> | null>(null);
    
    useEffect(() => {
        if (isOpen) {
            setFormData(trigger ? { ...trigger } : {
                id: `trigger_${Date.now()}`,
                name: '',
                condition: '',
                isRegex: false,
                action: { type: 'NOTIFY', payload: { message: '' } },
                isEnabled: true,
                isOneTime: false,
            });
        }
    }, [isOpen, trigger]);

    const handleSave = () => {
        if (formData && formData.name && formData.condition) {
            onSave(formData as Trigger);
        } else {
            alert("Vui lòng điền Tên và Điều kiện kích hoạt.");
        }
    };
    
    const handleActionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as TriggerActionType;
        let newPayload: TriggerAction['payload'] = {};
        switch(newType) {
            case 'NOTIFY': newPayload = { message: '' }; break;
            case 'ADD_STAT': newPayload = { stat: { name: '', description: '', type: StatType.NEUTRAL } }; break;
            case 'GET_ITEM': newPayload = { itemId: allPredefinedItems[0]?.id || '' }; break;
        }
        setFormData(prev => prev ? ({ ...prev, action: { type: newType, payload: newPayload } }) : null);
    };

    if (!isOpen || !formData) return null;

    const selectClass = "w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={trigger ? 'Chỉnh Sửa Thiên Cơ Lệnh' : 'Tạo Thiên Cơ Lệnh'}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                <InputField id="trigger-name" label="Tên Lệnh" value={formData.name || ''} onChange={e => setFormData(s => s ? ({...s, name: e.target.value}) : null)} />
                <TextareaField id="trigger-condition" label="Điều kiện Kích hoạt" value={formData.condition || ''} onChange={e => setFormData(s => s ? ({...s, condition: e.target.value}) : null)} rows={2} placeholder="Nhập văn bản hoặc mẫu Regex..."/>
                <div className="flex gap-4">
                    <ToggleSwitch id="trigger-is-regex" label="Chế độ Regex" description="Sử dụng biểu thức chính quy cho điều kiện." enabled={!!formData.isRegex} setEnabled={val => setFormData(s => s ? ({...s, isRegex: val}) : null)} />
                    <ToggleSwitch id="trigger-is-onetime" label="Một lần" description="Lệnh chỉ kích hoạt một lần duy nhất." enabled={!!formData.isOneTime} setEnabled={val => setFormData(s => s ? ({...s, isOneTime: val}) : null)} />
                </div>
                <div>
                    <label htmlFor="trigger-action-type" className="block text-sm font-medium text-neutral-300 mb-2">Hành động</label>
                    <select id="trigger-action-type" value={formData.action?.type} onChange={handleActionTypeChange} className={selectClass}>
                        {actionTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                <div className="p-3 bg-black/20 rounded-lg border border-neutral-700 space-y-3">
                    {formData.action?.type === 'NOTIFY' && (
                        <TextareaField id="payload-message" label="Nội dung Thông báo" value={formData.action.payload.message || ''} onChange={e => setFormData(s => s ? ({...s, action: {...s.action!, payload: { message: e.target.value }}}) : null)} rows={2} />
                    )}
                    {formData.action?.type === 'ADD_STAT' && (
                        <div className="space-y-3">
                            <InputField id="payload-stat-name" label="Tên Trạng thái" value={formData.action.payload.stat?.name || ''} onChange={e => setFormData(s => s ? ({...s, action: {...s.action!, payload: { stat: {...s.action!.payload.stat!, name: e.target.value }}}}) : null)} />
                            <TextareaField id="payload-stat-desc" label="Mô tả" value={formData.action.payload.stat?.description || ''} onChange={e => setFormData(s => s ? ({...s, action: {...s.action!, payload: { stat: {...s.action!.payload.stat!, description: e.target.value }}}}) : null)} rows={2} />
                            <div className="grid grid-cols-2 gap-3">
                                <InputField id="payload-stat-duration" label="Thời gian (phút)" type="number" value={formData.action.payload.stat?.duration || ''} onChange={e => setFormData(s => s ? ({...s, action: {...s.action!, payload: { stat: {...s.action!.payload.stat!, duration: parseInt(e.target.value) || undefined }}}}) : null)} placeholder="Trống = Vĩnh viễn"/>
                                <div>
                                    <label htmlFor="payload-stat-type" className="block text-sm font-medium text-neutral-300 mb-2">Loại</label>
                                    <select id="payload-stat-type" value={formData.action.payload.stat?.type} onChange={e => setFormData(s => s ? ({...s, action: {...s.action!, payload: { stat: {...s.action!.payload.stat!, type: e.target.value as StatType }}}}) : null)} className={selectClass}>
                                        {statTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                     {formData.action?.type === 'GET_ITEM' && (
                        <div>
                            <label htmlFor="payload-item-id" className="block text-sm font-medium text-neutral-300 mb-2">Vật phẩm</label>
                            <select id="payload-item-id" value={formData.action.payload.itemId} onChange={e => setFormData(s => s ? ({...s, action: {...s.action!, payload: { itemId: e.target.value }}}) : null)} className={selectClass}>
                                {allPredefinedItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                            </select>
                             <p className="text-xs text-neutral-500 mt-2">Danh sách này chứa tất cả vật phẩm có trong Bách Khoa toàn thư của thế giới game. Vật phẩm được trao sẽ xuất hiện trong túi đồ của người chơi.</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-end gap-4 pt-6">
                <Button onClick={onClose} variant="secondary">Hủy</Button>
                <Button onClick={handleSave}>Lưu</Button>
            </div>
             <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #555; border-radius: 10px; }
             `}</style>
        </Modal>
    );
};

export default TriggerEditorModal;
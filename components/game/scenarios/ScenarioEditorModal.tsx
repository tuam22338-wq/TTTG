import React, { useState, useEffect } from 'react';
import { CustomScenario, ScenarioCondition, ScenarioAction, ScenarioConditionType, ScenarioActionType, GameState, StatType } from '../../../types';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import InputField from '../../ui/InputField';
import TextareaField from '../../ui/TextareaField';
import { PlusIcon } from '../../icons/PlusIcon';
import { TrashIcon } from '../../icons/TrashIcon';
import { allPredefinedItems } from '../../../services/predefinedItems';

interface ScenarioEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scenario: CustomScenario) => void;
  scenario: CustomScenario | null;
  existingIds: string[];
  gameState: GameState;
}

const conditionTypes: { value: ScenarioConditionType, label: string }[] = [
    { value: 'PLAYER_HAS_ITEM', label: 'Người chơi có Vật phẩm' },
    { value: 'PLAYER_STAT_EXISTS', label: 'Người chơi có Trạng thái' },
    { value: 'NPC_STAT_EXISTS', label: 'NPC có Trạng thái' },
    { value: 'TURN_COUNT_GREATER_THAN', label: 'Số lượt >' },
];

const actionTypes: { value: ScenarioActionType, label: string }[] = [
    { value: 'SHOW_NOTIFICATION', label: 'Hiển thị Thông báo' },
    { value: 'GIVE_ITEM', label: 'Trao Vật phẩm' },
    { value: 'UPDATE_PLAYER_STAT', label: 'Cập nhật Trạng thái Player' },
    { value: 'UPDATE_NPC_STAT', label: 'Cập nhật Trạng thái NPC' },
    { value: 'UPDATE_CORE_STAT', label: 'Cập nhật Chỉ số Cốt lõi Player' },
];

const ScenarioEditorModal: React.FC<ScenarioEditorModalProps> = ({ isOpen, onClose, onSave, scenario, existingIds, gameState }) => {
    const [formData, setFormData] = useState<Partial<CustomScenario>>({});
    const [idError, setIdError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData(scenario ? { ...scenario } : {
                id: '',
                name: '',
                conditions: [],
                actions: [],
            });
            setIdError('');
        }
    }, [isOpen, scenario]);

    const handleSave = () => {
        if (!formData.name?.trim() || !formData.id?.trim() || idError) {
            alert("Vui lòng điền Tên và ID (duy nhất).");
            return;
        }
        onSave(formData as CustomScenario);
    };

    const handleIdChange = (value: string) => {
        const newId = value.trim().replace(/\s+/g, '_');
        if (newId !== scenario?.id && existingIds.includes(newId)) {
            setIdError('ID này đã tồn tại.');
        } else {
            setIdError('');
        }
        setFormData(s => ({ ...s, id: newId }));
    };
    
    // --- Condition Handlers ---
    const handleAddCondition = () => setFormData(s => ({ ...s, conditions: [...(s?.conditions || []), { type: 'PLAYER_HAS_ITEM', payload: {} }] }));
    const handleRemoveCondition = (index: number) => setFormData(s => ({ ...s, conditions: s?.conditions?.filter((_, i) => i !== index) }));
    const handleConditionChange = (index: number, newCondition: ScenarioCondition) => setFormData(s => ({...s, conditions: s?.conditions?.map((c, i) => i === index ? newCondition : c) }));

    // --- Action Handlers ---
    const handleAddAction = () => setFormData(s => ({ ...s, actions: [...(s?.actions || []), { type: 'SHOW_NOTIFICATION', payload: {} }] }));
    const handleRemoveAction = (index: number) => setFormData(s => ({...s, actions: s?.actions?.filter((_, i) => i !== index)}));
    const handleActionChange = (index: number, newAction: ScenarioAction) => setFormData(s => ({...s, actions: s?.actions?.map((a, i) => i === index ? newAction : a) }));

    if (!isOpen || !formData) return null;

    const selectClass = "w-full px-2 py-2 bg-black/40 border border-white/10 rounded-md text-white text-sm";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={scenario ? 'Chỉnh Sửa Kịch Bản' : 'Tạo Kịch Bản Mới'} size="2xl">
            <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField id="scenario-name" label="Tên Kịch Bản" value={formData.name || ''} onChange={e => setFormData(s => ({...s, name: e.target.value}))} />
                    <div>
                        <InputField id="scenario-id" label="ID (Mã định danh)" value={formData.id || ''} onChange={e => handleIdChange(e.target.value)} />
                        {idError && <p className="text-red-400 text-xs mt-1">{idError}</p>}
                    </div>
                </div>

                {/* Conditions */}
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">Điều Kiện (AND)</h3>
                    {formData.conditions?.map((cond, index) => (
                        <div key={index} className="p-3 bg-black/20 rounded-lg border border-neutral-700 flex gap-2">
                            <div className="flex-grow space-y-2">
                                <select value={cond.type} onChange={e => handleConditionChange(index, { type: e.target.value as ScenarioConditionType, payload: {} })} className={selectClass}>
                                    {conditionTypes.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                                {cond.type === 'PLAYER_HAS_ITEM' && <select value={cond.payload.itemId} onChange={e => handleConditionChange(index, { ...cond, payload: { itemId: e.target.value } })} className={selectClass}><option>-- Chọn vật phẩm --</option>{allPredefinedItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select>}
                                {cond.type === 'PLAYER_STAT_EXISTS' && <InputField id={`cond-stat-${index}`} value={cond.payload.statName || ''} onChange={e => handleConditionChange(index, { ...cond, payload: { statName: e.target.value } })} placeholder="Tên trạng thái" className="!py-2 !text-sm"/>}
                                {cond.type === 'TURN_COUNT_GREATER_THAN' && <InputField id={`cond-turn-${index}`} type="number" value={cond.payload.turnCount || 0} onChange={e => handleConditionChange(index, { ...cond, payload: { turnCount: parseInt(e.target.value) } })} className="!py-2 !text-sm"/>}
                            </div>
                            <button onClick={() => handleRemoveCondition(index)} className="p-2 text-red-400 self-center"><TrashIcon /></button>
                        </div>
                    ))}
                    <Button onClick={handleAddCondition} variant="secondary" className="w-full !text-sm !py-1.5 flex items-center justify-center gap-1"><PlusIcon /> Thêm Điều Kiện</Button>
                </div>
                
                {/* Actions */}
                 <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">Hành Động</h3>
                    {formData.actions?.map((act, index) => (
                         <div key={index} className="p-3 bg-black/20 rounded-lg border border-neutral-700 flex gap-2">
                            <div className="flex-grow space-y-2">
                                <select value={act.type} onChange={e => handleActionChange(index, { type: e.target.value as ScenarioActionType, payload: {} })} className={selectClass}>
                                    {actionTypes.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                                {act.type === 'SHOW_NOTIFICATION' && <InputField id={`act-msg-${index}`} value={act.payload.message || ''} onChange={e => handleActionChange(index, { ...act, payload: { message: e.target.value } })} placeholder="Nội dung thông báo" className="!py-2 !text-sm"/>}
                                {act.type === 'GIVE_ITEM' && (
                                    <div>
                                        <select value={act.payload.itemId} onChange={e => handleActionChange(index, { ...act, payload: { itemId: e.target.value } })} className={selectClass}>
                                            <option>-- Chọn vật phẩm --</option>
                                            {allPredefinedItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                        </select>
                                        <p className="text-xs text-neutral-500 mt-2">Danh sách này chứa tất cả vật phẩm có trong Bách Khoa toàn thư của thế giới game. Vật phẩm được trao sẽ xuất hiện trong túi đồ của người chơi.</p>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => handleRemoveAction(index)} className="p-2 text-red-400 self-center"><TrashIcon /></button>
                        </div>
                    ))}
                    <Button onClick={handleAddAction} variant="secondary" className="w-full !text-sm !py-1.5 flex items-center justify-center gap-1"><PlusIcon /> Thêm Hành Động</Button>
                </div>
            </div>
            <div className="flex justify-end gap-4 pt-6">
                <Button onClick={onClose} variant="secondary">Hủy</Button>
                <Button onClick={handleSave}>Lưu Kịch Bản</Button>
            </div>
             <style>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; }`}</style>
        </Modal>
    );
};

export default ScenarioEditorModal;
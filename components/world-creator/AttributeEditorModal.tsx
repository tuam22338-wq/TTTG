import React, { useState, useEffect, useRef } from 'react';
import { CustomAttributeDefinition, AttributeType, CustomAttributeLink, CoreStatLinkTarget } from '../../types';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import TextareaField from '../ui/TextareaField';
import Modal from '../ui/Modal';
import { GetIconComponent, iconList } from '../icons/AttributeIcons';


const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);
// --- Attribute Editor Modal Component ---
interface AttributeEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (attribute: CustomAttributeDefinition) => void;
    attribute: CustomAttributeDefinition | null; // null for creating new
    existingIds: string[];
}

const attributeTypeOptions: { value: AttributeType; label: string }[] = [
    { value: AttributeType.VITAL, label: 'Sinh tồn (VD: Máu, Mana)' },
    { value: AttributeType.PRIMARY, label: 'Chính (VD: Công, Thủ)' },
    { value: AttributeType.INFORMATIONAL, label: 'Thông tin (VD: Tiền, Danh vọng)' },
    { value: AttributeType.HIDDEN, label: 'Ẩn (VD: Nghiệp báo)' },
];

const CORE_STAT_LINK_OPTIONS: { value: CoreStatLinkTarget; label: string }[] = [
    { value: 'sinhLucToiDa', label: 'Sinh Lực Tối đa' },
    { value: 'linhLucToiDa', label: 'Linh Lực Tối đa' },
    { value: 'theLucToiDa', label: 'Thể Lực Tối đa' },
    { value: 'congKich', label: 'Công Kích' },
    { value: 'phongNgu', label: 'Phòng Ngự' },
    { value: 'khangPhep', label: 'Kháng Phép' },
    { value: 'thanPhap', label: 'Thân Pháp' },
    { value: 'chiMang', label: 'Tỉ lệ Chí mạng' },
    { value: 'satThuongChiMang', label: 'ST Chí mạng' },
    { value: 'giamHoiChieu', label: 'Giảm Hồi chiêu' },
];

const AttributeEditorModal: React.FC<AttributeEditorModalProps> = ({ isOpen, onClose, onSave, attribute, existingIds }) => {
    const [formData, setFormData] = useState<CustomAttributeDefinition | null>(null);
    const [idError, setIdError] = useState('');
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const iconPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (iconPickerRef.current && !iconPickerRef.current.contains(event.target as Node)) {
                setIsIconPickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (attribute) {
                setFormData({ ...attribute });
            } else {
                setFormData({
                    id: '', name: '', description: '', 
                    type: AttributeType.INFORMATIONAL, icon: 'question', baseValue: 0, isDefault: false, links: []
                });
            }
            setIdError('');
            setIsIconPickerOpen(false);
        }
    }, [isOpen, attribute]);

    const handleChange = (field: keyof Omit<CustomAttributeDefinition, 'links' | 'icon'>, value: any) => {
        if (!formData) return;
        let newFormData = { ...formData, [field]: value };
        if (field === 'id') {
            const newId = value.trim().toLowerCase().replace(/\s+/g, '_');
            newFormData = { ...newFormData, id: newId };
            if (newId !== attribute?.id && existingIds.includes(newId)) {
                setIdError('ID này đã tồn tại. Vui lòng chọn một ID khác.');
            } else {
                setIdError('');
            }
        }
        setFormData(newFormData);
    };

    const handleIconSelect = (iconName: string) => {
        if (!formData) return;
        setFormData({ ...formData, icon: iconName });
        setIsIconPickerOpen(false);
    };
    
    const handleLinkChange = (index: number, field: keyof CustomAttributeLink, value: any) => {
        if (!formData) return;
        const newLinks = [...(formData.links || [])];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setFormData({ ...formData, links: newLinks });
    };

    const handleAddLink = () => {
        if (!formData) return;
        const newLink: CustomAttributeLink = {
            targetStat: 'congKich',
            effectType: 'FLAT',
            ratio: 1,
            value: 1
        };
        setFormData({ ...formData, links: [...(formData.links || []), newLink] });
    };

    const handleRemoveLink = (index: number) => {
        if (!formData) return;
        const newLinks = (formData.links || []).filter((_, i) => i !== index);
        setFormData({ ...formData, links: newLinks });
    };

    const handleSave = () => {
        if (!formData || !formData.name.trim() || !formData.id.trim() || idError) {
            alert("Vui lòng điền Tên và ID (duy nhất).");
            return;
        }
        onSave(formData);
    };
    
    if (!formData) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={attribute ? 'Chỉnh Sửa Thuộc Tính' : 'Tạo Thuộc Tính Mới'}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                <InputField id="attr-name" label="Tên Thuộc Tính" value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="VD: Linh Thạch, Điểm Danh Vọng"/>
                <div>
                    <InputField id="attr-id" label="ID (Mã định danh)" value={formData.id} onChange={e => handleChange('id', e.target.value)} placeholder="VD: spirit_stones, reputation_points" disabled={formData.isDefault} />
                    {idError && <p className="text-red-400 text-xs mt-1">{idError}</p>}
                    <p className="text-xs text-gray-400 mt-1">ID là mã định danh duy nhất, không dấu, không khoảng trắng. Không thể thay đổi đối với thuộc tính mặc định.</p>
                </div>
                <TextareaField id="attr-desc" label="Mô Tả" value={formData.description} onChange={e => handleChange('description', e.target.value)} rows={3} placeholder="Giải thích ý nghĩa và cách hoạt động của thuộc tính này."/>
                <div>
                    <label htmlFor="attr-type" className="block text-sm font-medium text-neutral-400 mb-2">Loại Thuộc Tính</label>
                    <select id="attr-type" value={formData.type} onChange={e => handleChange('type', e.target.value)} className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                        {attributeTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
                    <InputField id="attr-baseValue" label="Giá Trị Cơ Bản" type="number" value={formData.baseValue} onChange={e => handleChange('baseValue', parseInt(e.target.value) || 0)} />
                    <div className="relative" ref={iconPickerRef}>
                        <label className="block text-sm font-medium text-neutral-400 mb-2">Icon</label>
                        <button 
                            type="button"
                            onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
                            className="w-16 h-[46px] bg-black/20 border border-white/10 rounded-lg flex items-center justify-center hover:border-pink-500 transition-colors"
                        >
                           <GetIconComponent name={formData.icon} className="h-7 w-7 text-white" />
                        </button>
                        {isIconPickerOpen && (
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-80 bg-neutral-800 border border-white/10 rounded-lg shadow-2xl p-2 z-20">
                                <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto custom-scrollbar">
                                    {iconList.map(iconName => (
                                        <button 
                                            key={iconName}
                                            onClick={() => handleIconSelect(iconName)}
                                            className="w-full aspect-square flex items-center justify-center rounded-md hover:bg-pink-500/30 transition-colors"
                                            title={iconName}
                                        >
                                            <GetIconComponent name={iconName} className="h-6 w-6 text-neutral-300" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- NEW: Stat Links Section --- */}
                <div className="pt-4 border-t border-neutral-700">
                    <h4 className="text-lg font-semibold text-white mb-2">Liên kết Chỉ số Cốt lõi</h4>
                    <p className="text-xs text-gray-400 mb-3">Tùy chọn: Cho phép thuộc tính này ảnh hưởng đến các chỉ số chiến đấu cơ bản của nhân vật.</p>
                    <div className="space-y-3">
                        {formData.links?.map((link, index) => (
                             <div key={index} className="p-3 bg-black/20 rounded-lg border border-neutral-700 space-y-3">
                                <div className="flex justify-between items-center">
                                     <p className="text-sm font-bold text-neutral-300">Liên kết #{index + 1}</p>
                                     <button onClick={() => handleRemoveLink(index)} className="p-1 text-red-400 hover:bg-red-500/20 rounded-full"><TrashIcon/></button>
                                </div>
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-neutral-400">Chỉ số Bị ảnh hưởng</label>
                                        <select value={link.targetStat} onChange={e => handleLinkChange(index, 'targetStat', e.target.value)} className="w-full text-sm mt-1 px-2 py-2 bg-black/20 border border-white/10 rounded-md">
                                            {CORE_STAT_LINK_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-neutral-400">Loại Ảnh hưởng</label>
                                        <select value={link.effectType} onChange={e => handleLinkChange(index, 'effectType', e.target.value)} className="w-full text-sm mt-1 px-2 py-2 bg-black/20 border border-white/10 rounded-md">
                                            <option value="FLAT">Tăng điểm cố định</option>
                                            <option value="PERCENT">Tăng theo %</option>
                                        </select>
                                    </div>
                               </div>
                               <div>
                                   <label className="text-xs font-medium text-neutral-400">Tỷ lệ Chuyển đổi</label>
                                   <div className="flex items-center gap-2 text-sm text-neutral-300 mt-1 flex-wrap">
                                        <span>Cứ mỗi</span>
                                        <input type="number" value={link.ratio} onChange={e => handleLinkChange(index, 'ratio', Math.max(1, parseInt(e.target.value) || 1))} className="w-16 text-center bg-black/20 border border-white/10 rounded-md px-1 py-1"/>
                                        <span>điểm,</span>
                                        <input type="number" step="0.01" value={link.value} onChange={e => handleLinkChange(index, 'value', parseFloat(e.target.value) || 0)} className="w-16 text-center bg-black/20 border border-white/10 rounded-md px-1 py-1"/>
                                        <span>{link.effectType === 'FLAT' ? 'điểm' : '%'} được cộng vào.</span>
                                   </div>
                               </div>
                            </div>
                        ))}
                         <button onClick={handleAddLink} className="w-full rounded-lg transition-colors duration-200 ease-in-out py-1.5 text-sm border-2 border-dashed border-neutral-600 text-neutral-400 hover:bg-neutral-700/50 hover:text-white hover:border-neutral-500 hover:border-solid font-semibold">+ Thêm Liên kết</button>
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-4 pt-6">
                <Button onClick={onClose} variant="secondary">Hủy</Button>
                <Button onClick={handleSave} disabled={!!idError || !formData.name.trim() || !formData.id.trim()}>Lưu</Button>
            </div>
             <style>{`
                 .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                 .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                 .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #555; border-radius: 10px; }
            `}</style>
        </Modal>
    );
};

export default AttributeEditorModal;

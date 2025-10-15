import React, { useState, useEffect } from 'react';
import { WorldCreationState, CustomAttributeDefinition, AttributeType, CustomAttributeLink, LinkEffectType, CoreStatLinkTarget } from '../../types';
import FormSection from './FormSection';
import InputField from '../ui/InputField';
import TextareaField from '../ui/TextareaField';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import AttributeTemplateModal from './AttributeTemplateModal';
import { AttributeTemplate, classicXianxiaTemplate } from '../../services/attributeTemplates';
import ConfirmationModal from '../ui/ConfirmationModal';


const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const PencilIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
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

    useEffect(() => {
        if (isOpen) {
            if (attribute) {
                setFormData({ ...attribute });
            } else {
                setFormData({
                    id: '', name: '', description: '', 
                    type: AttributeType.INFORMATIONAL, icon: '❓', baseValue: 0, isDefault: false, links: []
                });
            }
            setIdError('');
        }
    }, [isOpen, attribute]);

    const handleChange = (field: keyof Omit<CustomAttributeDefinition, 'links'>, value: any) => {
        if (!formData) return;
        setFormData({ ...formData, [field]: value });
        if (field === 'id') {
            const newId = value.trim().toLowerCase().replace(/\s+/g, '_');
            setFormData(prev => prev ? ({ ...prev, id: newId }) : null);
            if (newId !== attribute?.id && existingIds.includes(newId)) {
                setIdError('ID này đã tồn tại. Vui lòng chọn một ID khác.');
            } else {
                setIdError('');
            }
        }
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
                    <select id="attr-type" value={formData.type} onChange={e => handleChange('type', e.target.value)} className="w-full px-4 py-3 bg-neutral-800 border-t border-neutral-900 rounded-lg text-neutral-200 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6)] focus:outline-none focus:ring-2 focus:ring-white focus:bg-neutral-900">
                        {attributeTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <InputField id="attr-icon" label="Icon" value={formData.icon} onChange={e => handleChange('icon', e.target.value)} placeholder="Dán emoji vào đây"/>
                    <InputField id="attr-baseValue" label="Giá Trị Cơ Bản" type="number" value={formData.baseValue} onChange={e => handleChange('baseValue', parseInt(e.target.value) || 0)} />
                </div>

                {/* --- NEW: Stat Links Section --- */}
                <div className="pt-4 border-t border-neutral-700">
                    <h4 className="text-lg font-semibold text-white mb-2">Liên kết Chỉ số Cốt lõi</h4>
                    <p className="text-xs text-gray-400 mb-3">Tùy chọn: Cho phép thuộc tính này ảnh hưởng đến các chỉ số chiến đấu cơ bản của nhân vật.</p>
                    <div className="space-y-3">
                        {formData.links?.map((link, index) => (
                             <div key={index} className="p-3 bg-neutral-900/50 rounded-lg border border-neutral-700 space-y-3">
                                <div className="flex justify-between items-center">
                                     <p className="text-sm font-bold text-neutral-300">Liên kết #{index + 1}</p>
                                     <button onClick={() => handleRemoveLink(index)} className="p-1 text-red-400 hover:bg-red-500/20 rounded-full"><TrashIcon/></button>
                                </div>
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-neutral-400">Chỉ số Bị ảnh hưởng</label>
                                        <select value={link.targetStat} onChange={e => handleLinkChange(index, 'targetStat', e.target.value)} className="w-full text-sm mt-1 px-2 py-2 bg-neutral-800 border border-neutral-600 rounded-md">
                                            {CORE_STAT_LINK_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-neutral-400">Loại Ảnh hưởng</label>
                                        <select value={link.effectType} onChange={e => handleLinkChange(index, 'effectType', e.target.value)} className="w-full text-sm mt-1 px-2 py-2 bg-neutral-800 border border-neutral-600 rounded-md">
                                            <option value="FLAT">Tăng điểm cố định</option>
                                            <option value="PERCENT">Tăng theo %</option>
                                        </select>
                                    </div>
                               </div>
                               <div>
                                   <label className="text-xs font-medium text-neutral-400">Tỷ lệ Chuyển đổi</label>
                                   <div className="flex items-center gap-2 text-sm text-neutral-300 mt-1">
                                        <span>Cứ mỗi</span>
                                        <input type="number" value={link.ratio} onChange={e => handleLinkChange(index, 'ratio', Math.max(1, parseInt(e.target.value) || 1))} className="w-16 text-center bg-neutral-800 border border-neutral-600 rounded-md px-1 py-1"/>
                                        <span>điểm,</span>
                                        <input type="number" step="0.01" value={link.value} onChange={e => handleLinkChange(index, 'value', parseFloat(e.target.value) || 0)} className="w-16 text-center bg-neutral-800 border border-neutral-600 rounded-md px-1 py-1"/>
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
        </Modal>
    );
};


// --- Main Attribute System Form Component ---
interface AttributeSystemFormProps {
    state: WorldCreationState;
    setState: React.Dispatch<React.SetStateAction<WorldCreationState>>;
}

const AttributeSystemForm: React.FC<AttributeSystemFormProps> = ({ state, setState }) => {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState<CustomAttributeDefinition | null>(null);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [templateToLoad, setTemplateToLoad] = useState<AttributeTemplate | null>(null);


    const handleAddAttribute = () => {
        setEditingAttribute(null);
        setIsEditorOpen(true);
    };

    const handleEditAttribute = (attribute: CustomAttributeDefinition) => {
        setEditingAttribute(attribute);
        setIsEditorOpen(true);
    };
    
    const handleRemoveAttribute = (id: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa thuộc tính này không?")) {
            setState(s => ({ ...s, customAttributes: s.customAttributes.filter(a => a.id !== id) }));
        }
    };

    const handleSaveAttribute = (attributeToSave: CustomAttributeDefinition) => {
        // Sanitize ID
        attributeToSave.id = attributeToSave.id.trim().toLowerCase().replace(/\s+/g, '_');

        if (editingAttribute) { // Editing existing
             setState(s => ({
                ...s,
                customAttributes: s.customAttributes.map(attr => attr.id === editingAttribute.id ? attributeToSave : attr)
            }));
        } else { // Creating new
             setState(s => ({
                ...s,
                customAttributes: [...s.customAttributes, attributeToSave]
            }));
        }
        setIsEditorOpen(false);
    };

    const handleSelectTemplate = (template: AttributeTemplate) => {
        setIsTemplateModalOpen(false);
        setTemplateToLoad(template);
    };

    const handleConfirmLoadTemplate = () => {
        if (!templateToLoad) return;
        setState(s => ({ ...s, customAttributes: templateToLoad.attributes }));
        setTemplateToLoad(null);
    };
    
    const handleResetToDefault = () => {
        setTemplateToLoad(classicXianxiaTemplate);
    };


    return (
        <>
            <FormSection title="Hệ Thống Thuộc Tính" description="Định nghĩa các thuộc tính, chỉ số, hoặc tài nguyên đặc biệt cho thế giới của bạn. AI sẽ sử dụng các thuộc tính này để theo dõi tiến trình.">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <Button onClick={handleAddAttribute} variant="primary" className="flex-1 !py-2.5">Tạo Mới</Button>
                    <Button onClick={() => setIsTemplateModalOpen(true)} variant="secondary" className="flex-1 !py-2.5">Tải Mẫu</Button>
                    <Button onClick={handleResetToDefault} variant="secondary" className="flex-1 !py-2.5">Đặt Lại Mặc Định</Button>
                </div>

                <div className="space-y-2">
                    {state.customAttributes.map(attr => (
                        <div key={attr.id} className="bg-neutral-900/50 rounded-lg border border-neutral-700/50 flex items-center p-3 gap-3">
                            <span className="text-2xl flex-shrink-0 w-8 text-center">{attr.icon}</span>
                            <div className="flex-grow min-w-0">
                                <p className="font-bold text-white truncate">{attr.name}</p>
                                <p className="text-xs text-gray-400 font-mono truncate">{attr.id}</p>
                            </div>
                            <span className="text-xs font-semibold bg-neutral-700 text-neutral-300 px-2 py-0.5 rounded-full flex-shrink-0">{attr.type}</span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button onClick={() => handleEditAttribute(attr)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Chỉnh sửa"><PencilIcon /></button>
                                {!attr.isDefault && (
                                    <button onClick={() => handleRemoveAttribute(attr.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors" title="Xóa"><TrashIcon /></button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </FormSection>
             <AttributeEditorModal 
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onSave={handleSaveAttribute}
                attribute={editingAttribute}
                existingIds={state.customAttributes.map(a => a.id)}
            />
            <AttributeTemplateModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                onSelectTemplate={handleSelectTemplate}
            />
            <ConfirmationModal
                isOpen={!!templateToLoad}
                onClose={() => setTemplateToLoad(null)}
                onConfirm={handleConfirmLoadTemplate}
                title="Xác nhận Tải Mẫu"
                confirmText="Tải"
            >
                <p>Hành động này sẽ <strong className="text-red-400">ghi đè và thay thế</strong> toàn bộ các thuộc tính tùy chỉnh hiện tại của bạn.</p>
                <p className="font-bold mt-2">Bạn có chắc chắn muốn tiếp tục không?</p>
            </ConfirmationModal>
        </>
    );
};

export default AttributeSystemForm;
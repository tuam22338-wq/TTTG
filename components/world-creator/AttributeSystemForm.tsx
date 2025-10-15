import React, { useState, useMemo } from 'react';
import { WorldCreationState, CustomAttributeDefinition } from '../../types';
import FormSection from './FormSection';
import Button from '../ui/Button';
import AttributeEditorModal from './AttributeEditorModal';
import { AttributeTemplate, allAttributeTemplates } from '../../services/attributeTemplates';
import { GetIconComponent } from '../icons/AttributeIcons';


const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const PencilIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

const detectTemplate = (attributes: CustomAttributeDefinition[]): string => {
    const currentIds = new Set(attributes.map(a => a.id));
    for (const template of allAttributeTemplates) {
        const templateIds = new Set(template.attributes.map(a => a.id));
        if (currentIds.size === templateIds.size && [...currentIds].every(id => templateIds.has(id))) {
            return template.id;
        }
    }
    return 'custom';
};


// --- Main Attribute System Form Component ---
interface AttributeSystemFormProps {
    state: WorldCreationState;
    setState: React.Dispatch<React.SetStateAction<WorldCreationState>>;
}

const AttributeSystemForm: React.FC<AttributeSystemFormProps> = ({ state, setState }) => {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState<CustomAttributeDefinition | null>(null);

    const currentTemplateId = useMemo(() => detectTemplate(state.customAttributes), [state.customAttributes]);

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
    
    const handleSelectTemplate = (templateId: string) => {
        const template = allAttributeTemplates.find(t => t.id === templateId);
        if (template) {
            setState(s => ({ ...s, customAttributes: template.attributes }));
        }
    };


    return (
        <>
            <FormSection title="Hệ Thống Thuộc Tính" description="Định nghĩa các thuộc tính, chỉ số, hoặc tài nguyên đặc biệt cho thế giới của bạn. AI sẽ sử dụng các thuộc tính này để theo dõi tiến trình.">
                 <div className="bg-black/25 p-4 rounded-xl border border-neutral-700/80 mb-6">
                    <label htmlFor="template-select" className="block text-sm font-medium text-neutral-400 mb-2">
                        Mẫu Hệ Thống
                    </label>
                    <select 
                        id="template-select" 
                        onChange={e => handleSelectTemplate(e.target.value)} 
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        value={currentTemplateId}
                    >
                        <option value="custom" disabled>-- Tự định nghĩa --</option>
                        {allAttributeTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {state.customAttributes.map(attr => (
                        <div key={attr.id} className="bg-black/20 rounded-lg border border-white/10 flex items-center p-2 gap-3">
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-black/30 rounded" title={attr.type}>
                                <GetIconComponent name={attr.icon} className="h-5 w-5 text-neutral-300"/>
                            </div>
                            <div className="flex-grow min-w-0">
                                <p className="font-bold text-white truncate text-sm">{attr.name}</p>
                                <p className="text-xs text-gray-400 font-mono truncate">{attr.id}</p>
                            </div>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                                <button onClick={() => handleEditAttribute(attr)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Chỉnh sửa"><PencilIcon /></button>
                                {!attr.isDefault && (
                                    <button onClick={() => handleRemoveAttribute(attr.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors" title="Xóa"><TrashIcon /></button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="mt-4">
                    <button onClick={handleAddAttribute} className="w-full rounded-lg transition-colors duration-200 ease-in-out py-2.5 text-sm border-2 border-dashed border-neutral-600 text-neutral-400 hover:bg-white/5 hover:text-white hover:border-white/10 hover:border-solid font-semibold">+ Tạo Thuộc Tính Mới</button>
                </div>
            </FormSection>
             <AttributeEditorModal 
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onSave={handleSaveAttribute}
                attribute={editingAttribute}
                existingIds={state.customAttributes.map(a => a.id)}
            />
        </>
    );
};

export default AttributeSystemForm;
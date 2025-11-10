import React, { useState, useMemo, useRef } from 'react';
import { WorldCreationState, CustomAttributeDefinition, CultivationSystemSettings } from '../../types';
import Button from '../ui/Button';
import AttributeEditorModal from './AttributeEditorModal';
import { allAttributeTemplates } from '../../services/attributeTemplates';
import { GetIconComponent, iconList } from '../icons/AttributeIcons';
import { PlusIcon } from '../icons/PlusIcon';
import * as PresetFileService from '../../services/PresetFileService';
import { DownloadIcon } from '../icons/DownloadIcon';
import { UploadIcon } from '../icons/UploadIcon';


const TrashIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const PencilIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} viewBox="0 0 20 20" fill="currentColor">
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
    const fileInputRef = useRef<HTMLInputElement>(null);


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
    
    const handleExport = () => {
        PresetFileService.saveDataToFile(state.customAttributes, 'BMS_TG_Attributes_Preset.json');
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const attributes = await PresetFileService.loadDataFromFile(
                    file,
                    PresetFileService.isAttributeSystem,
                    "File không phải là một mẫu hệ thống thuộc tính hợp lệ."
                );
                setState(s => ({ ...s, customAttributes: attributes }));
            } catch (error: any) {
                alert(error.message);
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        }
    };


    return (
        <>
            <div className="space-y-5">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                 <div className="neumorphic-inset p-4 rounded-xl mb-6">
                    <label htmlFor="template-select" className="block text-sm font-medium text-neutral-300 mb-2">
                        Mẫu Hệ Thống
                    </label>
                    <select 
                        id="template-select" 
                        onChange={e => handleSelectTemplate(e.target.value)} 
                        className="w-full px-4 py-3 bg-transparent border-none rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/80 neumorphic-concave"
                        value={currentTemplateId}
                    >
                        <option value="custom" disabled>-- Tự định nghĩa --</option>
                        {allAttributeTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button onClick={handleExport} variant="secondary" className="flex items-center justify-center gap-2 !py-2 !text-sm">
                        <DownloadIcon className="h-5 w-5" /> Xuất Mẫu
                    </Button>
                     <Button onClick={handleImportClick} variant="secondary" className="flex items-center justify-center gap-2 !py-2 !text-sm">
                        <UploadIcon className="h-5 w-5" /> Nhập Mẫu
                    </Button>
                </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {state.customAttributes.map(attr => (
                        <div key={attr.id} className="neumorphic-concave rounded-lg flex items-center p-2 gap-3">
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-black/30 rounded" title={attr.type}>
                                <GetIconComponent name={attr.icon} className="h-5 w-5 text-neutral-300"/>
                            </div>
                            <div className="flex-grow min-w-0">
                                <p className="font-bold text-white truncate text-sm">{attr.name}</p>
                                <p className="text-xs text-gray-400 font-mono truncate">{attr.id}</p>
                            </div>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                                <button onClick={() => handleEditAttribute(attr)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Chỉnh sửa"><PencilIcon className="h-4 w-4" /></button>
                                {!attr.isDefault && (
                                    <button onClick={() => handleRemoveAttribute(attr.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors" title="Xóa"><TrashIcon className="h-4 w-4" /></button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="mt-4">
                     <button onClick={handleAddAttribute} className="flex items-center justify-center gap-2 w-full rounded-xl transition-all duration-200 ease-in-out py-2.5 text-sm bg-white/5 text-neutral-200 hover:bg-white/10 hover:text-white font-semibold neumorphic-convex active:shadow-[inset_2px_2px_4px_#141414,_inset_-2px_-2px_4px_#202020]">
                        <PlusIcon />
                        <span>Tạo Thuộc Tính Mới</span>
                    </button>
                </div>
            </div>
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

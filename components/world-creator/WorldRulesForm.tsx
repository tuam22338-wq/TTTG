import React, { useState } from 'react';
import { WorldCreationState, WorldRule } from '../../types';
import FormSection from './FormSection';
import InputField from '../ui/InputField';
import TextareaField from '../ui/TextareaField';
import ChevronIcon from '../icons/ChevronIcon';

interface WorldRulesFormProps {
    state: WorldCreationState;
    setState: React.Dispatch<React.SetStateAction<WorldCreationState>>;
}

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

interface RuleListEditorProps {
    title: string;
    description: string;
    rules: WorldRule[];
    onAdd: () => void;
    onUpdate: (id: string, field: 'name' | 'content', value: string) => void;
    onRemove: (id: string) => void;
}

const RuleListEditor: React.FC<RuleListEditorProps> = ({ title, description, rules, onAdd, onUpdate, onRemove }) => {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-neutral-100">{title}</h3>
            <p className="text-sm text-neutral-400 mb-3">{description}</p>
            <div className="space-y-3">
                {rules.map(rule => {
                    const isExpanded = expandedIds.has(rule.id);
                    return (
                        <div key={rule.id} className="bg-black/20 rounded-lg border border-white/10 overflow-hidden transition-all">
                            <div className="flex items-center p-3">
                                <div className="flex-grow min-w-0">
                                    <InputField value={rule.name} onChange={e => onUpdate(rule.id, 'name', e.target.value)} id={`rule-name-${rule.id}`} placeholder="Tên quy luật" className="!py-1 !px-2 text-base font-semibold" />
                                </div>
                                <div className="flex items-center gap-1 ml-2">
                                    <button onClick={() => onRemove(rule.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"><TrashIcon /></button>
                                    <button onClick={() => toggleExpand(rule.id)} className="p-1.5 text-gray-400 hover:text-white rounded-full transition-colors"><ChevronIcon isExpanded={isExpanded} /></button>
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="p-3 border-t border-white/10 animate-fade-in-fast">
                                    <TextareaField
                                        label="Nội dung quy luật"
                                        id={`rule-content-${rule.id}`}
                                        value={rule.content}
                                        onChange={e => onUpdate(rule.id, 'content', e.target.value)}
                                        rows={3}
                                        placeholder="Mô tả chi tiết quy luật..."
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
                <button onClick={onAdd} className="w-full rounded-lg transition-colors duration-200 ease-in-out py-2 text-sm border-2 border-dashed border-neutral-600 text-neutral-400 hover:bg-white/5 hover:text-white hover:border-white/10 hover:border-solid font-semibold">+ Thêm Quy Luật</button>
            </div>
             <style>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-fast {
                    animation: fade-in-fast 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};


const WorldRulesForm: React.FC<WorldRulesFormProps> = ({ state, setState }) => {
    
    // Handlers for Special Rules
    const handleAddSpecialRule = () => {
        const newRule: WorldRule = { id: `srule_${Date.now()}`, name: '', content: '' };
        setState(s => ({ ...s, specialRules: [...s.specialRules, newRule] }));
    };
    const handleUpdateSpecialRule = (id: string, field: 'name' | 'content', value: string) => {
        setState(s => ({ ...s, specialRules: s.specialRules.map(r => r.id === id ? { ...r, [field]: value } : r) }));
    };
    const handleRemoveSpecialRule = (id: string) => {
        setState(s => ({ ...s, specialRules: s.specialRules.filter(r => r.id !== id) }));
    };

    // Handlers for Initial Lore
    const handleAddInitialLore = () => {
        const newLore: WorldRule = { id: `lore_${Date.now()}`, name: '', content: '' };
        setState(s => ({ ...s, initialLore: [...s.initialLore, newLore] }));
    };
    const handleUpdateInitialLore = (id: string, field: 'name' | 'content', value: string) => {
        setState(s => ({ ...s, initialLore: s.initialLore.map(l => l.id === id ? { ...l, [field]: value } : l) }));
    };
    const handleRemoveInitialLore = (id: string) => {
        setState(s => ({ ...s, initialLore: s.initialLore.filter(l => l.id !== id) }));
    };

    return (
        <FormSection title="Quy Luật Thế Giới" description="Thiết lập các định luật và thông tin nền tảng mà AI phải tuân thủ.">
            <RuleListEditor
                title="Luật Lệ Đặc Biệt Của Thế Giới"
                description="Các quy tắc vật lý, phép thuật, xã hội riêng mà AI phải tuân thủ một cách nghiêm ngặt. VD: Không thể sử dụng phép thuật lửa vào ban đêm."
                rules={state.specialRules}
                onAdd={handleAddSpecialRule}
                onUpdate={handleUpdateSpecialRule}
                onRemove={handleRemoveSpecialRule}
            />
            <div className="mt-6 pt-6 border-t border-white/10">
                <RuleListEditor
                    title="Luật Lệ/Lore Ban Đầu Của Thế Giới"
                    description="Mô tả các quy tắc, lịch sử, hoặc yếu tố đặc biệt của thế giới game. AI sẽ cố gắng tích hợp những thông tin này vào câu chuyện."
                    rules={state.initialLore}
                    onAdd={handleAddInitialLore}
                    onUpdate={handleUpdateInitialLore}
                    onRemove={handleRemoveInitialLore}
                />
            </div>
        </FormSection>
    );
};

export default WorldRulesForm;
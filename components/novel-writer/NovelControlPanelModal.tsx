import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ToggleSwitch from '../ui/ToggleSwitch';
import InputField from '../ui/InputField';
import TextareaField from '../ui/TextareaField';
import RangeSlider from '../ui/RangeSlider';
import { NovelWriterSettings, NovelWritingRule } from '../../types';

interface NovelControlPanelModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: NovelWriterSettings;
    onSettingsChange: React.Dispatch<React.SetStateAction<NovelWriterSettings>>;
}

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="p-4 bg-black/20 rounded-lg border border-neutral-700">
        <h3 className="text-base font-bold text-white mb-3 uppercase tracking-wider">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const PACING_OPTIONS: NovelWriterSettings['pacing'][] = ['rất chậm', 'chậm', 'cân bằng', 'nhanh', 'siêu nhanh'];
const TIME_OPTIONS = ['1 tiếng', '5 tiếng', '10 tiếng', '15 tiếng', '1 ngày', '2 ngày', '3 ngày', 'Tùy chỉnh'];

const NovelControlPanelModal: React.FC<NovelControlPanelModalProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
    const [customTime, setCustomTime] = useState('');
    const [newRuleName, setNewRuleName] = useState('');
    const [newRuleContent, setNewRuleContent] = useState('');

    const handleUpdate = <K extends keyof NovelWriterSettings>(key: K, value: NovelWriterSettings[K]) => {
        onSettingsChange(prev => ({ ...prev, [key]: value }));
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value !== 'Tùy chỉnh') {
            handleUpdate('timePerChapter', value);
        } else {
            handleUpdate('timePerChapter', customTime || '1 tiếng');
        }
    };

    const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCustomTime(value);
        handleUpdate('timePerChapter', value);
    };
    
    const handleAddRule = () => {
        if (!newRuleName.trim() || !newRuleContent.trim()) return;
        const newRule: NovelWritingRule = {
            id: `rule_${Date.now()}`,
            name: newRuleName.trim(),
            content: newRuleContent.trim(),
        };
        handleUpdate('writingRules', [...settings.writingRules, newRule]);
        setNewRuleName('');
        setNewRuleContent('');
    };
    
    const handleRemoveRule = (id: string) => {
        handleUpdate('writingRules', settings.writingRules.filter(rule => rule.id !== id));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Bảng Điều Khiển Viết Tiểu Thuyết">
            <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2 -mr-2">
                <Section title="Nhịp độ truyện">
                    <div className="flex gap-1 rounded-lg bg-black/30 p-1">
                        {PACING_OPTIONS.map(pacing => (
                            <button
                                key={pacing}
                                onClick={() => handleUpdate('pacing', pacing)}
                                className={`flex-1 py-2 text-xs rounded-md font-semibold capitalize transition-colors ${settings.pacing === pacing ? 'bg-pink-600 text-white' : 'hover:bg-white/10 text-neutral-300'}`}
                            >
                                {pacing}
                            </button>
                        ))}
                    </div>
                </Section>
                
                <Section title="Thời gian & Độ dài">
                    <RangeSlider
                        label="Độ dài chương"
                        id="chapter-length"
                        min={500}
                        max={7000}
                        step={100}
                        value={settings.chapterLength}
                        onChange={e => handleUpdate('chapterLength', parseInt(e.target.value, 10))}
                        unit=" từ"
                    />
                    <ToggleSwitch
                        id="allow-timeskip"
                        label="Cho phép AI Timeskip"
                        description="AI có thể tự tạo bước nhảy thời gian lớn nếu cần thiết."
                        enabled={settings.allowAiTimeskip}
                        setEnabled={val => handleUpdate('allowAiTimeskip', val)}
                    />
                     <div>
                        <label htmlFor="time-per-chapter" className="block text-sm font-medium text-neutral-300 mb-1">Thời gian trôi qua / chương</label>
                        <div className="flex gap-2">
                            <select 
                                id="time-per-chapter"
                                onChange={handleTimeChange}
                                value={TIME_OPTIONS.includes(settings.timePerChapter) ? settings.timePerChapter : 'Tùy chỉnh'}
                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white"
                            >
                                {TIME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            {(!TIME_OPTIONS.includes(settings.timePerChapter) || settings.timePerChapter === 'Tùy chỉnh' || customTime) && (
                                <InputField 
                                    id="custom-time"
                                    value={customTime}
                                    onChange={handleCustomTimeChange}
                                    placeholder="VD: 1 tuần"
                                    className="!w-40"
                                />
                            )}
                        </div>
                    </div>
                </Section>

                <Section title="Quy tắc hành văn">
                     <p className="text-xs text-neutral-400 -mt-2">Thêm các quy tắc để AI tuân thủ. VD: 'Luôn mô tả nội tâm của nhân vật A', 'Tập trung vào đối thoại', 'Không mô tả thời tiết'.</p>
                    <div className="space-y-2">
                        {settings.writingRules.map(rule => (
                             <div key={rule.id} className="p-2 bg-black/30 rounded-md flex justify-between items-start gap-2">
                                <div className="flex-grow">
                                    <p className="font-semibold text-sm text-pink-300">{rule.name}</p>
                                    <p className="text-xs text-neutral-300">{rule.content}</p>
                                </div>
                                <button onClick={() => handleRemoveRule(rule.id)} className="p-2 text-neutral-500 hover:text-red-400 rounded-full flex-shrink-0">
                                    <TrashIcon />
                                </button>
                             </div>
                        ))}
                    </div>
                    <div className="p-2 bg-black/40 rounded-lg border border-neutral-600 space-y-2">
                        <InputField id="new-rule-name" placeholder="Tên quy tắc (VD: Nội tâm nhân vật)" value={newRuleName} onChange={e => setNewRuleName(e.target.value)} className="!py-2 text-sm" />
                        <TextareaField id="new-rule-content" placeholder="Nội dung quy tắc..." value={newRuleContent} onChange={e => setNewRuleContent(e.target.value)} rows={2} className="text-sm" />
                        <Button onClick={handleAddRule} variant="secondary" className="w-full !py-1.5 !text-xs">+ Thêm quy tắc</Button>
                    </div>
                </Section>
            </div>
            <div className="mt-4">
                 <Button onClick={onClose} variant="secondary" className="w-full">Đóng</Button>
            </div>
             <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #555; border-radius: 10px; }
            `}</style>
        </Modal>
    );
};

export default NovelControlPanelModal;

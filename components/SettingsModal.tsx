import React, { useState } from 'react';
import { Settings, ApiKeySource, GeminiModel, SafetyLevel, NarrativePerspective } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import ToggleSwitch from './ui/ToggleSwitch';
import InputField from './ui/InputField';
import { useSettings } from '../hooks/useSettings';


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settingsHook: ReturnType<typeof useSettings>;
}

type Tab = 'interface' | 'audio' | 'ai_model' | 'safety' | 'advanced';

const MODEL_OPTIONS: { id: GeminiModel; name: string }[] = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Mặc định)' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
    { id: 'gemini-flash-lite-latest', name: 'Gemini Flash Lite Latest' },
    { id: 'gemini-flash-latest', name: 'Gemini Flash Latest' },
];

const SAFETY_LEVELS: { id: SafetyLevel; name: string; description: string }[] = [
    { id: 'BLOCK_NONE', name: 'Không Chặn', description: 'Cho phép tất cả nội dung. (Khuyến khích cho trải nghiệm đầy đủ)' },
    { id: 'BLOCK_ONLY_HIGH', name: 'Chặn Mức Cao', description: 'Chặn nội dung có hại ở mức độ rõ ràng nhất.' },
    { id: 'BLOCK_MEDIUM_AND_ABOVE', name: 'Chặn Trung Bình trở lên', description: 'Cân bằng giữa an toàn và cho phép.' },
    { id: 'BLOCK_MOST', name: 'Chặn Hầu hết', description: 'Chặn phần lớn nội dung có thể gây hại.' },
];

const perspectiveDescriptions: Record<NarrativePerspective, { title: string; text: string; special?: string }> = {
  'Nhãn Quan Toàn Tri': { title: 'Nhãn Quan Toàn Tri', text: 'Theo chân nhân vật chính, nhưng đôi khi AI sẽ hé lộ những "cảnh cắt" đặc biệt.', special: 'Hiển thị trong khung riêng với biểu tượng con mắt.' },
  'Ngôi thứ ba Giới hạn': { title: 'Ngôi thứ ba Giới hạn', text: 'Câu chuyện được kể qua góc nhìn của nhân vật chính. Trải nghiệm nhập vai cổ điển.' },
  'Ngôi thứ hai': { title: 'Ngôi thứ hai', text: 'AI sẽ kể chuyện trực tiếp với bạn, sử dụng đại từ "Bạn".' },
  'Ngôi thứ ba Toàn tri': { title: 'Ngôi thứ ba Toàn tri (Cũ)', text: 'Người kể chuyện biết mọi thứ, mô tả suy nghĩ và hành động của bất kỳ ai.' },
};

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const RangeSlider: React.FC<{ label: string; id: string; min: number; max: number; step: number; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; unit?: string }> = ({ label, id, min, max, step, value, onChange, unit }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-neutral-300 mb-1">{label}</label>
        <div className="flex items-center gap-4">
            <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer" />
            <span className="text-sm font-mono text-white w-16 text-center">{value}{unit}</span>
        </div>
    </div>
);


const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settingsHook }) => {
    const [activeTab, setActiveTab] = useState<Tab>('ai_model');
    const { settings, setSettings, setApiKeySource, setCustomApiKeys, updateAiModelSetting, updateAudioSetting, updateSafetySetting, isKeyConfigured, resetSettings } = settingsHook;

    const handleAddKey = () => setCustomApiKeys([...settings.customApiKeys, '']);
    const handleKeyChange = (index: number, value: string) => {
        const newKeys = [...settings.customApiKeys];
        newKeys[index] = value;
        setCustomApiKeys(newKeys);
    };
    const handleRemoveKey = (index: number) => setCustomApiKeys(settings.customApiKeys.filter((_, i) => i !== index));

    const TabButton: React.FC<{ tabId: Tab; children: React.ReactNode }> = ({ tabId, children }) => {
        const isActive = activeTab === tabId;
        return <button onClick={() => setActiveTab(tabId)} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none ${isActive ? 'text-white bg-[#e02585] shadow-[0_0_8px_rgba(224,37,133,0.5)]' : 'text-[#a08cb6] bg-black/20 hover:bg-white/10'}`}>{children}</button>
    };

    const currentPerspectiveDescription = perspectiveDescriptions[settings.narrativePerspective];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Thiết Lập">
            <div className="flex flex-col h-[75vh]">
                <div className="flex-shrink-0 flex overflow-hidden rounded-t-lg border-b-2 border-[#e02585]">
                    <TabButton tabId="interface">Giao diện</TabButton>
                    <TabButton tabId="audio">Âm Thanh</TabButton>
                    <TabButton tabId="ai_model">AI & Model</TabButton>
                    <TabButton tabId="safety">An Toàn</TabButton>
                    <TabButton tabId="advanced">Nâng Cao</TabButton>
                </div>

                <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                    {activeTab === 'interface' && (
                        <div className="space-y-6">
                            <ToggleSwitch id="auto-hide-panel" label="Tự động ẩn Bảng Hành Động" description="Tự động thu gọn bảng lựa chọn sau khi bạn gửi đi một hành động." enabled={settings.autoHideActionPanel} setEnabled={val => setSettings({ ...settings, autoHideActionPanel: val })} />
                            <div>
                                <label htmlFor="narrative-perspective-ingame" className="block text-sm font-medium text-neutral-300 mb-2">Ngôi kể</label>
                                <select id="narrative-perspective-ingame" value={settings.narrativePerspective} onChange={e => setSettings({ ...settings, narrativePerspective: e.target.value as NarrativePerspective })} className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                                    {Object.keys(perspectiveDescriptions).map(p => <option key={p} value={p}>{perspectiveDescriptions[p as NarrativePerspective].title}</option>)}
                                </select>
                                <div className="mt-2 p-2 bg-black/20 rounded-md border border-neutral-700">
                                    <p className="text-xs text-gray-300">{currentPerspectiveDescription.text}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'audio' && (
                         <div className="space-y-6">
                            <ToggleSwitch id="audio-enabled" label="Kích hoạt Âm thanh" description="Bật/tắt tất cả các hiệu ứng âm thanh trong game (chức năng tương lai)." enabled={settings.audio.enabled} setEnabled={val => updateAudioSetting('enabled', val)} />
                             <RangeSlider label="Âm lượng" id="audio-volume" min={0} max={1} step={0.01} value={settings.audio.volume} onChange={(e) => updateAudioSetting('volume', parseFloat(e.target.value))} />
                        </div>
                    )}
                    {activeTab === 'ai_model' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Nguồn Khóa API</h3>
                                <div className="flex gap-2 rounded-lg bg-black/30 p-1">
                                    <button onClick={() => setApiKeySource(ApiKeySource.DEFAULT)} className={`flex-1 py-2 text-sm rounded ${settings.apiKeySource === ApiKeySource.DEFAULT ? 'bg-white/10 font-semibold' : 'hover:bg-white/5'}`}>Mặc định</button>
                                    <button onClick={() => setApiKeySource(ApiKeySource.CUSTOM)} className={`flex-1 py-2 text-sm rounded ${settings.apiKeySource === ApiKeySource.CUSTOM ? 'bg-white/10 font-semibold' : 'hover:bg-white/5'}`}>Tùy chỉnh</button>
                                </div>
                            </div>
                             <div className={`space-y-3 transition-opacity ${settings.apiKeySource === ApiKeySource.CUSTOM ? 'opacity-100' : 'opacity-50'}`}>
                                <h3 className="text-lg font-bold text-white">Danh sách khóa API tùy chỉnh</h3>
                                {settings.customApiKeys.map((key, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input type="password" placeholder="Nhập khóa API..." value={key} onChange={(e) => handleKeyChange(index, e.target.value)} disabled={settings.apiKeySource !== ApiKeySource.CUSTOM} className="flex-grow px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"/>
                                        <button onClick={() => handleRemoveKey(index)} disabled={settings.apiKeySource !== ApiKeySource.CUSTOM} className="p-2 text-neutral-400 hover:text-red-500 rounded-full"><TrashIcon /></button>
                                    </div>
                                ))}
                                <Button onClick={handleAddKey} variant="secondary" disabled={settings.apiKeySource !== ApiKeySource.CUSTOM}>+ Thêm khóa</Button>
                            </div>
                             <div>
                                <h3 className="text-lg font-bold text-white mb-2">Cấu hình Model</h3>
                                 <label htmlFor="model-select" className="text-sm font-medium text-neutral-300">Model Tường thuật</label>
                                 <select id="model-select" value={settings.aiModelSettings.model} onChange={e => updateAiModelSetting('model', e.target.value as GeminiModel)} className="w-full mt-1 px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                                     {MODEL_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                 </select>
                            </div>
                             <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white">Tinh chỉnh Tham số</h3>
                                <RangeSlider label="Temperature (Sáng tạo)" id="temp-slider" min={0} max={1} step={0.05} value={settings.aiModelSettings.temperature} onChange={e => updateAiModelSetting('temperature', parseFloat(e.target.value))} />
                                <RangeSlider label="Top-P" id="topp-slider" min={0} max={1} step={0.05} value={settings.aiModelSettings.topP} onChange={e => updateAiModelSetting('topP', parseFloat(e.target.value))} />
                                <div>
                                    <label htmlFor="topk-input" className="block text-sm font-medium text-neutral-300 mb-1">Top-K</label>
                                    <InputField id="topk-input" type="number" value={settings.aiModelSettings.topK} onChange={e => updateAiModelSetting('topK', parseInt(e.target.value) || 0)} />
                                </div>
                                <RangeSlider label="Độ dài Phản hồi Tối đa" id="tokens-slider" min={100} max={5000} step={100} value={settings.aiModelSettings.maxOutputTokens} onChange={e => updateAiModelSetting('maxOutputTokens', parseInt(e.target.value))} unit=" tokens" />
                                <RangeSlider label="Thinking Budget" id="thinking-slider" min={0} max={16000} step={100} value={settings.aiModelSettings.thinkingBudget} onChange={e => updateAiModelSetting('thinkingBudget', parseInt(e.target.value))} unit=" tokens" />
                            </div>
                        </div>
                    )}
                    {activeTab === 'safety' && (
                        <div className="space-y-4">
                             <h3 className="text-lg font-bold text-white mb-2">Lọc Nội dung An toàn</h3>
                             <p className="text-sm text-neutral-400">Điều chỉnh mức độ lọc nội dung của Gemini. "Không Chặn" được khuyến khích cho các câu chuyện NSFW.</p>
                             <div className="space-y-2">
                                 {SAFETY_LEVELS.map(level => (
                                     <label key={level.id} className={`flex items-start p-3 bg-black/20 rounded-lg cursor-pointer border-2 transition-colors ${settings.safety.level === level.id ? 'border-pink-500' : 'border-transparent hover:border-white/10'}`}>
                                         <input type="radio" name="safetyLevel" value={level.id} checked={settings.safety.level === level.id} onChange={() => updateSafetySetting('level', level.id)} className="h-5 w-5 mt-0.5 text-pink-500 bg-neutral-900 border-neutral-700 focus:ring-pink-500"/>
                                         <span className="ml-3">
                                             <span className="font-semibold text-white">{level.name}</span>
                                             <p className="text-xs text-neutral-400">{level.description}</p>
                                         </span>
                                     </label>
                                 ))}
                             </div>
                        </div>
                    )}
                    {activeTab === 'advanced' && (
                         <div className="space-y-6">
                             <div>
                                <h3 className="text-lg font-bold text-red-400 mb-2">Khu vực Nguy hiểm</h3>
                                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                                    <p className="text-sm text-red-200 mb-3">Hành động này sẽ xóa tất cả các cài đặt tùy chỉnh của bạn và khôi phục về trạng thái mặc định.</p>
                                    <Button onClick={resetSettings} variant="secondary">Đặt Lại Toàn Bộ Cài Đặt</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-shrink-0 p-4 border-t border-white/10">
                     {!isKeyConfigured && (
                        <div className="text-yellow-300 text-sm text-center bg-yellow-500/10 p-2 rounded-md mb-3">
                            Chưa có khóa API nào được cấu hình.
                        </div>
                    )}
                    <Button onClick={onClose} variant="secondary" className="w-full">Đóng</Button>
                </div>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #555; border-radius: 10px; }
            `}</style>
        </Modal>
    );
};

export default SettingsModal;
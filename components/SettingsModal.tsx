import React, { useState } from 'react';
import { Settings, ApiKeySource, GeminiModel, SafetyLevel, NarrativePerspective, AiProvider, DeepSeekModelSettings } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import ToggleSwitch from './ui/ToggleSwitch';
import InputField from './ui/InputField';
import { useSettings } from '../hooks/useSettings';
import { CogIcon } from './icons/CogIcon';
import { BookIcon } from './icons/BookIcon';
import RangeSlider from './ui/RangeSlider';

// --- Start: Local Icon Definitions ---
const PaintBrushIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);
const SpeakerWaveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);
const ShieldCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.917L12 23l9-2.083c0-3.16-1.5-6.02-3.882-8.082z" />
    </svg>
);
const ExclamationTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);
// --- End: Local Icon Definitions ---

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settingsHook: ReturnType<typeof useSettings>;
}

type SettingsTab = 'interface' | 'audio' | 'ai_model' | 'safety' | 'advanced';

const GEMINI_MODEL_OPTIONS: { id: GeminiModel; name: string }[] = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Mặc định)' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
    { id: 'gemini-flash-lite-latest', name: 'Gemini Flash Lite Latest' },
    { id: 'gemini-flash-latest', name: 'Gemini Flash Latest' },
];

const GEMINI_EMBEDDING_MODELS: { id: string; name: string }[] = [
    { id: 'text-embedding-004', name: 'Text Embedding 004 (Mặc định)' },
];

const DEEPSEEK_MODEL_OPTIONS: { id: DeepSeekModelSettings['model']; name: string }[] = [
    { id: 'deepseek-chat', name: 'DeepSeek Chat (Mặc định)' },
    { id: 'deepseek-coder', name: 'DeepSeek Coder' },
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

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settingsHook }) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('interface');
    const { settings, setSettings, setCustomApiKeys, updateAiModelSetting, updateDeepSeekModelSetting, updateAudioSetting, updateSafetySetting, isKeyConfigured, resetSettings, apiStats } = settingsHook;
    
    const handleAddKey = () => setCustomApiKeys([...settings.customApiKeys, '']);
    const handleKeyChange = (index: number, value: string) => {
        const newKeys = [...settings.customApiKeys];
        newKeys[index] = value;
        setCustomApiKeys(newKeys);
    };
    const handleRemoveKey = (index: number) => setCustomApiKeys(settings.customApiKeys.filter((_, i) => i !== index));

    const settingsTabs = [
        { id: 'interface', label: 'Giao diện', Icon: PaintBrushIcon },
        { id: 'audio', label: 'Âm Thanh', Icon: SpeakerWaveIcon },
        { id: 'ai_model', label: 'Model AI', Icon: CogIcon },
        { id: 'safety', label: 'An Toàn', Icon: ShieldCheckIcon },
        { id: 'advanced', label: 'Nâng Cao', Icon: ExclamationTriangleIcon },
    ];

    const currentPerspectiveDescription = perspectiveDescriptions[settings.narrativePerspective];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Thiết Lập">
            <div className="flex flex-col max-h-[75vh] min-h-[60vh]">
                <div className="flex-shrink-0 border-b border-neutral-700">
                    <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
                        {settingsTabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                                    className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition-colors duration-200 focus:outline-none ${isActive ? 'border-pink-500 text-white' : 'border-transparent text-neutral-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <tab.Icon className={`h-5 w-5 ${isActive ? 'text-pink-400' : ''}`} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
                    {activeTab === 'interface' && (
                        <div className="space-y-6 animate-fade-in-fast">
                            <ToggleSwitch id="auto-hide-panel" label="Tự động ẩn Bảng Hành Động" description="Tự động thu gọn bảng lựa chọn sau khi bạn gửi đi một hành động." enabled={settings.autoHideActionPanel} setEnabled={val => setSettings({ ...settings, autoHideActionPanel: val })} />
                            <RangeSlider 
                                label="Thu phóng Giao diện" 
                                id="zoom-slider" 
                                min={0.5} 
                                max={1.0} 
                                step={0.01} 
                                value={settings.zoomLevel} 
                                onChange={e => setSettings({ ...settings, zoomLevel: parseFloat(e.target.value) })}
                                displayTransform={val => `${Math.round(val * 100)}%`}
                            />
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
                        <div className="space-y-6 animate-fade-in-fast">
                            <ToggleSwitch id="audio-enabled" label="Kích hoạt Âm thanh" description="Bật/tắt tất cả các hiệu ứng âm thanh trong game (chức năng tương lai)." enabled={settings.audio.enabled} setEnabled={val => updateAudioSetting('enabled', val)} />
                            <RangeSlider label="Âm lượng" id="audio-volume" min={0} max={1} step={0.01} value={settings.audio.volume} onChange={(e) => updateAudioSetting('volume', parseFloat(e.target.value))} />
                        </div>
                    )}
                    {activeTab === 'ai_model' && (
                        <div className="space-y-6 animate-fade-in-fast">
                             <div>
                                <h3 className="text-lg font-bold text-white mb-2">AI Provider</h3>
                                <div className="flex gap-2 rounded-lg bg-black/30 p-1">
                                    <button onClick={() => setSettings({ ...settings, aiProvider: AiProvider.GEMINI })} className={`flex-1 py-2 text-sm rounded ${settings.aiProvider === AiProvider.GEMINI ? 'bg-white/10 font-semibold' : 'hover:bg-white/5'}`}>Gemini</button>
                                    <button onClick={() => setSettings({ ...settings, aiProvider: AiProvider.DEEPSEEK })} className={`flex-1 py-2 text-sm rounded ${settings.aiProvider === AiProvider.DEEPSEEK ? 'bg-white/10 font-semibold' : 'hover:bg-white/5'}`}>DeepSeek</button>
                                </div>
                            </div>

                            {settings.aiProvider === AiProvider.GEMINI && (
                                <>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-2">Thống Kê API (Gemini)</h3>
                                        <div className="p-3 bg-black/30 rounded-lg space-y-2 border border-neutral-700">
                                            <div className="flex justify-between text-sm"><span className="text-neutral-400">Tổng Keys / Active:</span> <span className="font-mono font-bold text-cyan-400">{apiStats.totalKeys} / {apiStats.activeKeys}</span></div>
                                            <div className="flex justify-between text-sm"><span className="text-neutral-400">Tổng Usage:</span> <span className="font-mono font-bold">{apiStats.totalUsage}</span></div>
                                            <div className="flex justify-between text-sm"><span className="text-neutral-400">Tổng Lỗi:</span> <span className={`font-mono font-bold ${apiStats.totalErrors > 0 ? 'text-red-400' : 'text-green-400'}`}>{apiStats.totalErrors}</span></div>
                                            <div className="flex justify-between text-sm"><span className="text-neutral-400">Queue / Active:</span> <span className="font-mono font-bold text-yellow-400">{apiStats.activeRequests}</span></div>
                                            <div className="flex justify-between text-sm"><span className="text-neutral-400">Avg. Response Time:</span> <span className="font-mono font-bold text-purple-400">{apiStats.avgResponseTime}ms</span></div>
                                            <Button onClick={apiStats.resetStats} variant="secondary" className="w-full !text-xs !py-1 mt-2">Reset Thống Kê</Button>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-bold text-white">Danh sách khóa API tùy chỉnh</h3>
                                        {settings.customApiKeys.map((key, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <input type="password" placeholder="Nhập khóa API..." value={key} onChange={(e) => handleKeyChange(index, e.target.value)} className="flex-grow px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"/>
                                                <button onClick={() => handleRemoveKey(index)} className="p-2 text-neutral-400 hover:text-red-500 rounded-full"><TrashIcon /></button>
                                            </div>
                                        ))}
                                        <Button onClick={handleAddKey} variant="secondary">+ Thêm khóa</Button>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-bold text-white mb-2">Cấu hình Model</h3>
                                        <div>
                                            <label htmlFor="model-select" className="text-sm font-medium text-neutral-300">Model Tường thuật</label>
                                            <select id="model-select" value={settings.aiModelSettings.model} onChange={e => updateAiModelSetting('model', e.target.value as GeminiModel)} className="w-full mt-1 px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                                                {GEMINI_MODEL_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="embedding-model-select" className="text-sm font-medium text-neutral-300">Model Embedding (Huấn luyện)</label>
                                            <select id="embedding-model-select" value={settings.aiModelSettings.embeddingModel} onChange={e => updateAiModelSetting('embeddingModel', e.target.value)} className="w-full mt-1 px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                                                {GEMINI_EMBEDDING_MODELS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-white">Tinh chỉnh Tham số</h3>
                                        <RangeSlider label="Temperature (Sáng tạo)" id="temp-slider" min={0} max={1} step={0.05} value={settings.aiModelSettings.temperature} onChange={e => updateAiModelSetting('temperature', parseFloat(e.target.value))} />
                                        <RangeSlider label="Top-P" id="topp-slider" min={0} max={1} step={0.05} value={settings.aiModelSettings.topP} onChange={e => updateAiModelSetting('topP', parseFloat(e.target.value))} />
                                        <div>
                                            <label htmlFor="topk-input" className="block text-sm font-medium text-neutral-300 mb-1">Top-K</label>
                                            <InputField id="topk-input" type="number" value={settings.aiModelSettings.topK} onChange={e => updateAiModelSetting('topK', parseInt(e.target.value) || 0)} />
                                        </div>
                                        <RangeSlider
                                            label="Độ dài Phản hồi Tối thiểu"
                                            id="words-slider"
                                            min={100}
                                            max={4000}
                                            step={50}
                                            value={Math.round(settings.aiModelSettings.maxOutputTokens / 1.5)}
                                            onChange={e => updateAiModelSetting('maxOutputTokens', Math.round(parseInt(e.target.value, 10) * 1.5))}
                                            unit=" từ"
                                        />
                                        <div>
                                            <RangeSlider
                                                label="Độ dài Bổ sung cho JSON"
                                                id="json-buffer-slider"
                                                min={0}
                                                max={4000}
                                                step={50}
                                                value={settings.aiModelSettings.jsonBuffer}
                                                onChange={e => updateAiModelSetting('jsonBuffer', parseInt(e.target.value, 10))}
                                                unit=" tokens"
                                            />
                                            <p className="text-xs text-neutral-400 -mt-2 px-1">Thêm token dự phòng để AI có đủ không gian tạo cấu trúc JSON, tránh lỗi parse. Giá trị này sẽ được cộng vào Độ dài Phản hồi Tối thiểu.</p>
                                        </div>
                                        <RangeSlider label="Thinking Budget" id="thinking-slider" min={0} max={16000} step={100} value={settings.aiModelSettings.thinkingBudget} onChange={e => updateAiModelSetting('thinkingBudget', parseInt(e.target.value))} unit=" tokens" />
                                    </div>
                                </>
                            )}
                            {settings.aiProvider === AiProvider.DEEPSEEK && (
                                <div className="space-y-6 animate-fade-in-fast">
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-2">DeepSeek API Key</h3>
                                        <InputField id="deepseek-api-key" type="password" value={settings.deepSeekApiKey} onChange={(e) => setSettings({ ...settings, deepSeekApiKey: e.target.value })} placeholder="Nhập khóa API DeepSeek..."/>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-2">Cấu hình Model</h3>
                                        <label htmlFor="deepseek-model-select" className="text-sm font-medium text-neutral-300">Model</label>
                                        <select id="deepseek-model-select" value={settings.deepSeekModelSettings.model} onChange={e => updateDeepSeekModelSetting('model', e.target.value as DeepSeekModelSettings['model'])} className="w-full mt-1 px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                                            {DEEPSEEK_MODEL_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                        </select>
                                    </div>
                                     <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-white">Tinh chỉnh Tham số</h3>
                                        <RangeSlider label="Temperature (Sáng tạo)" id="deepseek-temp-slider" min={0} max={2} step={0.05} value={settings.deepSeekModelSettings.temperature} onChange={e => updateDeepSeekModelSetting('temperature', parseFloat(e.target.value))} />
                                        <RangeSlider label="Top-P" id="deepseek-topp-slider" min={0} max={1} step={0.05} value={settings.deepSeekModelSettings.topP} onChange={e => updateDeepSeekModelSetting('topP', parseFloat(e.target.value))} />
                                        <RangeSlider
                                            label="Độ dài Phản hồi Tối thiểu"
                                            id="deepseek-words-slider"
                                            min={100}
                                            max={8000}
                                            step={50}
                                            value={Math.round(settings.deepSeekModelSettings.maxOutputTokens / 1.5)}
                                            onChange={e => updateDeepSeekModelSetting('maxOutputTokens', Math.round(parseInt(e.target.value, 10) * 1.5))}
                                            unit=" từ"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'safety' && (
                        <div className="space-y-4 animate-fade-in-fast">
                            <h3 className="text-lg font-bold text-white mb-2">Lọc Nội dung An toàn (Gemini)</h3>
                            <p className="text-sm text-neutral-400">Điều chỉnh mức độ lọc nội dung của Gemini. "Không Chặn" được khuyến khích cho các câu chuyện NSFW. Cài đặt này không ảnh hưởng đến DeepSeek.</p>
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
                        <div className="space-y-6 animate-fade-in-fast">
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

                <div className="flex-shrink-0 p-4 border-t border-neutral-700">
                     {!isKeyConfigured && (
                        <div className="text-yellow-300 text-sm text-center bg-yellow-500/10 p-2 rounded-md mb-3">
                            Chưa có khóa API nào được cấu hình cho provider đã chọn.
                        </div>
                    )}
                    <Button onClick={onClose} variant="secondary" className="w-full">Đóng</Button>
                </div>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #555; border-radius: 10px; }
                @keyframes fade-in-fast {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-fast {
                    animation: fade-in-fast 0.3s ease-out forwards;
                }
            `}</style>
        </Modal>
    );
};

export default SettingsModal;

import React, { useState, useRef, useEffect } from 'react';
import { Settings, GeminiModel, NarrativePerspective, AiProvider, DeepSeekModelSettings } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import ToggleSwitch from './ui/ToggleSwitch';
import InputField from './ui/InputField';
import { useSettings } from '../hooks/useSettings';
import { CogIcon } from './icons/CogIcon';
import RangeSlider from './ui/RangeSlider';
import * as StorageService from '../services/StorageService';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import TextareaField from './ui/TextareaField';


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
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
);
const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
);
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);
// --- End: Local Icon Definitions ---

const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="p-4 bg-black/20 rounded-xl border border-neutral-700/80">
        <h3 className="text-lg font-bold text-white mb-4 font-rajdhani uppercase tracking-wider">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settingsHook: ReturnType<typeof useSettings>;
}

type SettingsView = 'main' | 'interface' | 'audio' | 'ai_model' | 'safety' | 'advanced';

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

const perspectiveDescriptions: Record<NarrativePerspective, { title: string; text: string; special?: string }> = {
  'Nhãn Quan Toàn Tri': { title: 'Nhãn Quan Toàn Tri', text: 'Theo chân nhân vật chính, nhưng đôi khi AI sẽ hé lộ những "cảnh cắt" đặc biệt.', special: 'Hiển thị trong khung riêng với biểu tượng con mắt.' },
  'Ngôi thứ ba Giới hạn': { title: 'Ngôi thứ ba Giới hạn', text: 'Câu chuyện được kể qua góc nhìn của nhân vật chính. Trải nghiệm nhập vai cổ điển.' },
  'Ngôi thứ hai': { title: 'Ngôi thứ hai', text: 'AI sẽ kể chuyện trực tiếp với bạn, sử dụng đại từ "Bạn".' },
  'Ngôi thứ ba Toàn tri': { title: 'Ngôi thứ ba Toàn tri (Cũ)', text: 'Người kể chuyện biết mọi thứ, mô tả suy nghĩ và hành động của bất kỳ ai.' },
};

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settingsHook }) => {
    const [currentView, setCurrentView] = useState<SettingsView>('main');
    const { settings, setSettings, setCustomApiKeys, updateAiModelSetting, updateDeepSeekModelSetting, updateAudioSetting, updateSafetySetting, isKeyConfigured, resetSettings, apiStats } = settingsHook;
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [isKeyPoolEnabled, setIsKeyPoolEnabled] = useState(settings.customApiKeys.length > 1);

    useEffect(() => {
        // Sync the toggle state if the underlying data changes, e.g., after a reset
        setIsKeyPoolEnabled(settings.customApiKeys.length > 1);
    }, [settings.customApiKeys]);

    const settingsCategories = [
        { id: 'interface', label: 'Giao diện', description: 'Tùy chỉnh giao diện, ngôi kể, và chủ đề.', Icon: PaintBrushIcon },
        { id: 'audio', label: 'Âm Thanh', description: 'Quản lý cài đặt âm thanh và âm lượng.', Icon: SpeakerWaveIcon },
        { id: 'ai_model', label: 'Model AI', description: 'Cấu hình khóa API, provider, và các tham số model.', Icon: CogIcon },
        { id: 'safety', label: 'An Toàn', description: 'Thiết lập các bộ lọc nội dung an toàn.', Icon: ShieldCheckIcon },
        { id: 'advanced', label: 'Nâng Cao', description: 'Quản lý dữ liệu game và các cài đặt nguy hiểm.', Icon: ExclamationTriangleIcon },
    ];
    
    const selectedCategory = settingsCategories.find(c => c.id === currentView);

    const handleBackup = async () => {
        alert("Đang chuẩn bị dữ liệu sao lưu...");
        await StorageService.exportAllData();
    };

    const handleImport = () => {
        if (window.confirm("Cảnh báo: Hành động này sẽ GHI ĐÈ toàn bộ dữ liệu hiện tại (lưu game, cài đặt, v.v.) bằng dữ liệu từ file sao lưu. Bạn có chắc chắn muốn tiếp tục không?")) {
            fileInputRef.current?.click();
        }
    };

    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                await StorageService.importAllData(file);
                alert("Nhập dữ liệu thành công! Ứng dụng sẽ được tải lại.");
                window.location.reload();
            } catch (error: any) {
                alert(`Nhập dữ liệu thất bại: ${error.message}`);
            }
        }
    };
    
    const handleDeleteAllData = async () => {
        if (window.confirm("CẢNH BÁO CUỐI CÙNG: Bạn có chắc chắn muốn XÓA TOÀN BỘ DỮ LIỆU GAME không? Hành động này không thể hoàn tác và sẽ xóa tất cả file lưu, cài đặt và dữ liệu huấn luyện của bạn.")) {
            await StorageService.deleteAllData();
            alert("Đã xóa toàn bộ dữ liệu. Ứng dụng sẽ được tải lại.");
            window.location.reload();
        }
    };

    const handleCloseModal = () => {
        setCurrentView('main');
        onClose();
    };

    const currentPerspectiveDescription = perspectiveDescriptions[settings.narrativePerspective];
    const selectClass = "w-full px-4 py-3 bg-transparent border-none rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/80 transition-all neumorphic-concave";
    const modalTitle = currentView === 'main' ? 'Thiết Lập' : selectedCategory?.label || 'Thiết Lập';

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleCloseModal} 
            title=""
            size="2xl"
            hideHeader={true}
        >
            <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json" className="hidden" />
            <div className="flex flex-col max-h-[75vh] min-h-[60vh]">
                <div className="relative flex-shrink-0 flex items-center justify-center p-6 border-b border-white/10">
                    <button 
                        onClick={currentView === 'main' ? handleCloseModal : () => setCurrentView('main')}
                        className="absolute left-4 sm:left-6 p-2 rounded-full text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
                        aria-label="Quay lại"
                    >
                        <ArrowLeftIcon className="h-6 w-6" />
                    </button>
                    <h2 className="text-3xl font-title text-white">
                        {modalTitle}
                    </h2>
                </div>
                
                {currentView === 'main' ? (
                    <div className="p-6 sm:p-8 flex-grow overflow-y-auto custom-scrollbar">
                        <div className="w-full space-y-3">
                            {settingsCategories.map((item, index) => (
                                <button 
                                    key={item.id}
                                    onClick={() => setCurrentView(item.id as SettingsView)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group hover:bg-white/5`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center glassmorphic rounded-lg neumorphic-convex group-hover:shadow-[inset_2px_2px_4px_#141414,_inset_-2px_-2px_4px_#202020] transition-shadow duration-300">
                                            <item.Icon className="h-6 w-6 text-neutral-300 group-hover:text-white transition-colors"/>
                                        </div>
                                        <div className="flex-grow text-left">
                                            <p className="font-bold text-lg text-neutral-100">{item.label}</p>
                                            <p className="text-sm text-neutral-400">{item.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-neutral-500 transition-transform duration-300 group-hover:text-white group-hover:translate-x-1">
                                        <ChevronRightIcon className="h-6 w-6" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
                        {currentView === 'interface' && (
                            <div className="space-y-6 animate-fade-in-fast">
                                <SettingsSection title="Hiển Thị & Bố Cục">
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
                                </SettingsSection>
                                <SettingsSection title="Tường Thuật">
                                    <div>
                                        <label htmlFor="narrative-perspective-ingame" className="block text-sm font-medium text-neutral-300 mb-2">Ngôi kể</label>
                                        <select id="narrative-perspective-ingame" value={settings.narrativePerspective} onChange={e => setSettings({ ...settings, narrativePerspective: e.target.value as NarrativePerspective })} className={selectClass}>
                                            {Object.keys(perspectiveDescriptions).map(p => <option key={p} value={p}>{perspectiveDescriptions[p as NarrativePerspective].title}</option>)}
                                        </select>
                                        <div className="mt-3 p-3 neumorphic-inset rounded-md">
                                            <p className="text-xs text-gray-300">{currentPerspectiveDescription.text}</p>
                                        </div>
                                    </div>
                                </SettingsSection>
                                <SettingsSection title="Giao Diện (Sắp có)">
                                    <div>
                                        <label htmlFor="theme-select" className="block text-sm font-medium text-neutral-300 mb-2">Chủ đề</label>
                                        <select id="theme-select" disabled className={`${selectClass} disabled:opacity-50`}>
                                            <option>Tối (Mặc định)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="font-select" className="block text-sm font-medium text-neutral-300 mb-2">Font chữ</label>
                                        <select id="font-select" disabled className={`${selectClass} disabled:opacity-50`}>
                                            <option>Inter (Mặc định)</option>
                                        </select>
                                    </div>
                                </SettingsSection>
                            </div>
                        )}
                        {currentView === 'audio' && (
                           <div className="space-y-6 animate-fade-in-fast">
                                <SettingsSection title="Điều Khiển Âm Thanh">
                                    <ToggleSwitch id="audio-enabled" label="Kích hoạt Âm thanh" description="Bật/tắt tất cả các hiệu ứng âm thanh trong game (chức năng tương lai)." enabled={settings.audio.enabled} setEnabled={val => updateAudioSetting('enabled', val)} />
                                    <RangeSlider label="Âm lượng" id="audio-volume" min={0} max={1} step={0.01} value={settings.audio.volume} onChange={(e) => updateAudioSetting('volume', parseFloat(e.target.value))} />
                                </SettingsSection>
                            </div>
                        )}
                        {currentView === 'ai_model' && (
                            <div className="space-y-6 animate-fade-in-fast">
                                <SettingsSection title="AI Provider">
                                    <div className="flex gap-2 rounded-lg bg-black/30 p-1 neumorphic-inset">
                                        <button onClick={() => setSettings({ ...settings, aiProvider: AiProvider.GEMINI })} className={`flex-1 py-2 text-sm rounded-md transition-all ${settings.aiProvider === AiProvider.GEMINI ? 'neumorphic-convex font-semibold' : 'hover:bg-white/5'}`}>Gemini</button>
                                        <button onClick={() => setSettings({ ...settings, aiProvider: AiProvider.DEEPSEEK })} className={`flex-1 py-2 text-sm rounded-md transition-all ${settings.aiProvider === AiProvider.DEEPSEEK ? 'neumorphic-convex font-semibold' : 'hover:bg-white/5'}`}>DeepSeek</button>
                                    </div>
                                </SettingsSection>

                                {!isKeyConfigured && (
                                    <div className="text-yellow-300 text-sm text-center bg-yellow-500/10 p-2 rounded-md">
                                        Chưa có khóa API nào được cấu hình cho provider đã chọn.
                                    </div>
                                )}

                                {settings.aiProvider === AiProvider.GEMINI && (
                                    <>
                                        <SettingsSection title="Thống Kê API (Gemini)">
                                            <div className="p-3 neumorphic-inset rounded-lg space-y-2">
                                                <div className="flex justify-between text-sm"><span className="text-neutral-400">Tổng Keys / Active:</span> <span className="font-mono font-bold text-cyan-400">{apiStats.totalKeys} / {apiStats.activeKeys}</span></div>
                                                <div className="flex justify-between text-sm"><span className="text-neutral-400">Tổng Usage:</span> <span className="font-mono font-bold">{apiStats.totalUsage}</span></div>
                                                <div className="flex justify-between text-sm"><span className="text-neutral-400">Tổng Lỗi:</span> <span className={`font-mono font-bold ${apiStats.totalErrors > 0 ? 'text-red-400' : 'text-green-400'}`}>{apiStats.totalErrors}</span></div>
                                                <div className="flex justify-between text-sm"><span className="text-neutral-400">Queue / Active:</span> <span className="font-mono font-bold text-yellow-400">{apiStats.activeRequests}</span></div>
                                                <div className="flex justify-between text-sm"><span className="text-neutral-400">Avg. Response Time:</span> <span className="font-mono font-bold text-purple-400">{apiStats.avgResponseTime}ms</span></div>
                                                <Button onClick={apiStats.resetStats} variant="secondary" className="w-full !text-xs !py-1 mt-2">Reset Thống Kê</Button>
                                            </div>
                                        </SettingsSection>
                                        <SettingsSection title="Nhập API Key">
                                            <ToggleSwitch
                                                id="key-pool-toggle"
                                                label="Kích Hoạt API Key Pool"
                                                description="Sử dụng nhiều API key, mỗi key trên một dòng để tự động xoay vòng."
                                                enabled={isKeyPoolEnabled}
                                                setEnabled={(enabled) => {
                                                    setIsKeyPoolEnabled(enabled);
                                                    if (!enabled && settings.customApiKeys.length > 1) {
                                                        const firstKey = settings.customApiKeys.find(k => k.trim() !== '') || '';
                                                        setCustomApiKeys([firstKey]);
                                                    }
                                                }}
                                            />
                                            {isKeyPoolEnabled ? (
                                                <div className="mt-2">
                                                    <label htmlFor="api-key-pool" className="block text-sm font-medium text-neutral-300 mb-2">
                                                        Danh sách API Keys
                                                    </label>
                                                    <textarea
                                                        id="api-key-pool"
                                                        placeholder="Mỗi API key trên một dòng..."
                                                        value={settings.customApiKeys.join('\n')}
                                                        onChange={(e) => setCustomApiKeys(e.target.value.split('\n'))}
                                                        rows={5}
                                                        className="w-full px-4 py-3 bg-black/40 border-2 border-neutral-700 rounded-xl text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors resize-none font-mono text-sm"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="mt-2">
                                                    <InputField
                                                        id="single-api-key"
                                                        type="password"
                                                        label="API Key Đơn"
                                                        placeholder="Nhập API Key để bắt đầu tạo thế giới..."
                                                        value={settings.customApiKeys[0] || ''}
                                                        onChange={(e) => setCustomApiKeys([e.target.value])}
                                                    />
                                                </div>
                                            )}
                                        </SettingsSection>
                                        <SettingsSection title="Cấu hình Model">
                                            <div className="space-y-4">
                                                <div>
                                                    <label htmlFor="model-select" className="text-sm font-medium text-neutral-300">Model Tường thuật</label>
                                                    <select id="model-select" value={settings.aiModelSettings.model} onChange={e => updateAiModelSetting('model', e.target.value as GeminiModel)} className={`${selectClass} mt-1`}>
                                                        {GEMINI_MODEL_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="embedding-model-select" className="text-sm font-medium text-neutral-300">Model Embedding (Huấn luyện)</label>
                                                    <select id="embedding-model-select" value={settings.aiModelSettings.embeddingModel} onChange={e => updateAiModelSetting('embeddingModel', e.target.value)} className={`${selectClass} mt-1`}>
                                                        {GEMINI_EMBEDDING_MODELS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </SettingsSection>
                                        <SettingsSection title="Tinh chỉnh Tham số">
                                            <RangeSlider label="Temperature (Sáng tạo)" id="temp-slider" min={0} max={1} step={0.05} value={settings.aiModelSettings.temperature} onChange={e => updateAiModelSetting('temperature', parseFloat(e.target.value))} />
                                            <RangeSlider label="Top-P" id="topp-slider" min={0} max={1} step={0.05} value={settings.aiModelSettings.topP} onChange={e => updateAiModelSetting('topP', parseFloat(e.target.value))} />
                                            <InputField id="topk-input" label="Top-K" type="number" value={settings.aiModelSettings.topK} onChange={e => updateAiModelSetting('topK', parseInt(e.target.value) || 0)} />
                                            <div>
                                                <RangeSlider label="Độ dài Tường thuật Tối thiểu" id="min-words-slider" min={100} max={1500} step={50} value={settings.aiModelSettings.minOutputWords} onChange={e => updateAiModelSetting('minOutputWords', parseInt(e.target.value, 10))} unit=" từ" />
                                                 <p className="text-xs text-neutral-400 -mt-2 px-1">Yêu cầu AI viết một đoạn truyện có độ dài tối thiểu. Giúp câu chuyện chi tiết hơn nhưng tốn nhiều token hơn.</p>
                                            </div>
                                            <div>
                                                <RangeSlider label="Độ dài Phản hồi Tối đa" id="tokens-slider" min={1024} max={8192} step={128} value={settings.aiModelSettings.maxOutputTokens} onChange={e => updateAiModelSetting('maxOutputTokens', parseInt(e.target.value, 10))} unit=" tokens" />
                                                <p className="text-xs text-neutral-400 -mt-2 px-1">Giới hạn kỹ thuật về số token tối đa AI có thể tạo ra. Giá trị này bao gồm cả truyện và dữ liệu game. Đặt quá thấp có thể cắt bớt phản hồi.</p>
                                            </div>
                                            <div>
                                                <RangeSlider label="Độ dài Bổ sung cho JSON" id="json-buffer-slider" min={0} max={4000} step={50} value={settings.aiModelSettings.jsonBuffer} onChange={e => updateAiModelSetting('jsonBuffer', parseInt(e.target.value, 10))} unit=" tokens" />
                                                <p className="text-xs text-neutral-400 -mt-2 px-1">Thêm token dự phòng để đảm bảo AI có đủ không gian cho cấu trúc dữ liệu game (JSON), tránh lỗi. Giá trị này sẽ được cộng thêm vào giới hạn token cuối cùng khi gọi AI.</p>
                                            </div>
                                            <div>
                                                <RangeSlider label="Thinking Budget" id="thinking-slider" min={0} max={16000} step={100} value={settings.aiModelSettings.thinkingBudget} onChange={e => updateAiModelSetting('thinkingBudget', parseInt(e.target.value))} unit=" tokens" />
                                                <p className="text-xs text-neutral-400 -mt-2 px-1">Phân bổ token cho AI 'suy nghĩ' trước khi trả lời. Giúp xử lý các yêu cầu phức tạp tốt hơn, nhưng có thể tăng độ trễ và chi phí. (Chỉ cho Flash model).</p>
                                            </div>
                                        </SettingsSection>
                                    </>
                                )}
                                {settings.aiProvider === AiProvider.DEEPSEEK && (
                                    <>
                                        <SettingsSection title="Quản lý API Key">
                                            <InputField id="deepseek-api-key" label="DeepSeek API Key" type="password" value={settings.deepSeekApiKey} onChange={(e) => setSettings({ ...settings, deepSeekApiKey: e.target.value })} placeholder="Nhập khóa API DeepSeek..."/>
                                        </SettingsSection>
                                        <SettingsSection title="Cấu hình Model">
                                            <div>
                                                <label htmlFor="deepseek-model-select" className="text-sm font-medium text-neutral-300">Model</label>
                                                <select id="deepseek-model-select" value={settings.deepSeekModelSettings.model} onChange={e => updateDeepSeekModelSetting('model', e.target.value as DeepSeekModelSettings['model'])} className={`${selectClass} mt-1`}>
                                                    {DEEPSEEK_MODEL_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                                </select>
                                            </div>
                                        </SettingsSection>
                                        <SettingsSection title="Tinh chỉnh Tham số">
                                            <RangeSlider label="Temperature (Sáng tạo)" id="deepseek-temp-slider" min={0} max={2} step={0.05} value={settings.deepSeekModelSettings.temperature} onChange={e => updateDeepSeekModelSetting('temperature', parseFloat(e.target.value))} />
                                            <RangeSlider label="Top-P" id="deepseek-topp-slider" min={0} max={1} step={0.05} value={settings.deepSeekModelSettings.topP} onChange={e => updateDeepSeekModelSetting('topP', parseFloat(e.target.value))} />
                                            <RangeSlider label="Độ dài Phản hồi Tối thiểu" id="deepseek-words-slider" min={100} max={8000} step={50} value={Math.round(settings.deepSeekModelSettings.maxOutputTokens / 1.5)} onChange={e => updateDeepSeekModelSetting('maxOutputTokens', Math.round(parseInt(e.target.value, 10) * 1.5))} unit=" từ" />
                                        </SettingsSection>
                                    </>
                                )}
                            </div>
                        )}
                        {currentView === 'safety' && (
                             <div className="space-y-6 animate-fade-in-fast">
                                <SettingsSection title="Bộ Lọc An Toàn (Gemini)">
                                    <ToggleSwitch
                                        id="master-safety-switch"
                                        label="Bật bộ lọc an toàn"
                                        description="Tắt tùy chọn này sẽ bỏ qua tất cả các bộ lọc an toàn. Chỉ nên tắt nếu bạn hiểu rõ rủi ro."
                                        enabled={settings.masterSafetySwitch}
                                        setEnabled={val => setSettings({ ...settings, masterSafetySwitch: val })}
                                    />
                                </SettingsSection>
                                <div className={`transition-opacity ${!settings.masterSafetySwitch ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <SettingsSection title="Cài đặt Chi tiết">
                                        <ToggleSwitch
                                            id="safety-harassment"
                                            label="Quấy rối"
                                            description="Chặn nội dung quấy rối hoặc bắt nạt."
                                            enabled={settings.safety.blockHarassment}
                                            setEnabled={val => updateSafetySetting('blockHarassment', val)}
                                        />
                                        <ToggleSwitch
                                            id="safety-hate"
                                            label="Ngôn từ kích động thù địch"
                                            description="Chặn phát ngôn thù địch, phân biệt đối xử."
                                            enabled={settings.safety.blockHateSpeech}
                                            setEnabled={val => updateSafetySetting('blockHateSpeech', val)}
                                        />
                                        <ToggleSwitch
                                            id="safety-sexual"
                                            label="Nội dung khiêu dâm"
                                            description="Chặn nội dung khiêu dâm, không phù hợp."
                                            enabled={settings.safety.blockSexuallyExplicit}
                                            setEnabled={val => updateSafetySetting('blockSexuallyExplicit', val)}
                                        />
                                        <ToggleSwitch
                                            id="safety-dangerous"
                                            label="Nội dung nguy hiểm"
                                            description="Chặn nội dung khuyến khích hành vi nguy hiểm."
                                            enabled={settings.safety.blockDangerousContent}
                                            setEnabled={val => updateSafetySetting('blockDangerousContent', val)}
                                        />
                                    </SettingsSection>
                                </div>
                            </div>
                        )}
                        {currentView === 'advanced' && (
                            <div className="space-y-8 animate-fade-in-fast">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">Quản lý Dữ liệu</h3>
                                    <div className="p-4 bg-black/20 border border-neutral-700 rounded-lg space-y-3">
                                        <p className="text-sm text-neutral-400">Sao lưu hoặc khôi phục toàn bộ dữ liệu game (bao gồm file lưu, cài đặt, và dữ liệu huấn luyện).</p>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Button onClick={handleBackup} variant="secondary" className="flex-1 flex items-center justify-center gap-2"><DownloadIcon className="h-5 w-5" /> Sao Lưu</Button>
                                            <Button onClick={handleImport} variant="secondary" className="flex-1 flex items-center justify-center gap-2"><UploadIcon className="h-5 w-5" /> Nhập Dữ liệu</Button>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-red-400 mb-2">Khu vực Nguy hiểm</h3>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                                            <p className="text-sm text-yellow-200 mb-3">Hành động này sẽ xóa tất cả các cài đặt tùy chỉnh của bạn và khôi phục về trạng thái mặc định.</p>
                                            <Button onClick={resetSettings} variant="secondary">Đặt Lại Toàn Bộ Cài Đặt</Button>
                                        </div>
                                        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                                            <p className="text-sm text-red-200 mb-3">Hành động này sẽ xóa vĩnh viễn tất cả các file lưu, cài đặt và dữ liệu huấn luyện của bạn. KHÔNG THỂ HOÀN TÁC.</p>
                                            <Button onClick={handleDeleteAllData} variant="secondary">Xóa Toàn Bộ Dữ Liệu</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                 
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
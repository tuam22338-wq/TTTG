import React, { useState, useEffect, useRef } from 'react';
import { HarmCategory, HarmBlockThreshold } from '@google/genai';
import { useSettings } from '../../hooks/useSettings';
import { ChatMessage, AssistantSession } from '../../types';
import * as StorageService from '../../services/StorageService';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { GAME_MASTER_ASSISTANT_SYSTEM_PROMPT, PACKAGING_KNOWLEDGE_PROMPT, PACKAGING_TEMPLATE_PROMPT } from '../../services/prompt-engineering/corePrompts';
import { marked } from 'https://esm.sh/marked@13.0.2';
import Button from '../ui/Button';
import TextareaField from '../ui/TextareaField';
import * as client from '../../services/gemini/client';
import { PackageIcon } from '../icons/PackageIcon';
import * as schemas from '../../services/gemini/schemas';

const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const SendIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);

const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};


const AssistantChatScreen: React.FC<{ 
    onBackToMenu: () => void; 
    settingsHook: ReturnType<typeof useSettings>;
    onApiKeyInvalid: () => void;
    sessionId: string;
}> = ({ onBackToMenu, settingsHook, onApiKeyInvalid, sessionId }) => {
    const { settings, getApiClient, isKeyConfigured, cycleToNextApiKey, apiStats } = settingsHook;
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPackaging, setIsPackaging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const isSavingRef = useRef(false);
    const [currentSession, setCurrentSession] = useState<AssistantSession | null>(null);

    useEffect(() => {
        const initialize = async () => {
            setIsLoading(true);
            try {
                let loadedSession = await StorageService.loadAssistantSession(sessionId);
                if (!loadedSession) {
                    loadedSession = {
                        id: sessionId,
                        title: '',
                        lastModified: Date.now(),
                        history: [],
                    };
                }
                setCurrentSession(loadedSession);
                setChatHistory(loadedSession.history);
                if (!isKeyConfigured) {
                     setError("Vui lòng cấu hình API key trong phần cài đặt trước khi sử dụng.");
                }
            } catch (e: any) {
                setError(`Lỗi khởi tạo: ${e.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        initialize();
    }, [sessionId, isKeyConfigured]);
    
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    useEffect(() => {
        if (!isLoading && currentSession && !isSavingRef.current && chatHistory.length > 0) {
            isSavingRef.current = true;
            const title = currentSession.title || chatHistory.find(m => m.role === 'user')?.text.substring(0, 50) || 'Phiên mới';

            const sessionToSave: AssistantSession = {
                ...currentSession,
                history: chatHistory,
                lastModified: Date.now(),
                title,
            };
            
            StorageService.saveAssistantSession(sessionToSave).then(() => {
                setCurrentSession(sessionToSave);
            }).finally(() => {
                isSavingRef.current = false;
            });
        }
    }, [chatHistory, isLoading, currentSession]);
    
    const handleSend = async () => {
        if (!userInput.trim() || isLoading || isPackaging) return;
        const apiClientObject: client.ApiClient = { getApiClient, cycleToNextApiKey, apiStats, onApiKeyInvalid };
        if (!apiClientObject.getApiClient()) {
            setError("Dịch vụ AI chưa sẵn sàng.");
            onApiKeyInvalid();
            return;
        }

        const userMessage: ChatMessage = { role: 'user', text: userInput };
        const newChatHistory = [...chatHistory, userMessage];
        setChatHistory(newChatHistory);
        setUserInput('');
        setIsLoading(true);
        setError(null);

        const assistantModelSettings = {
            ...settings.aiModelSettings,
            maxOutputTokens: 8192,
            temperature: 0.7,
        };
        
        const historyForApi = newChatHistory.map(msg => ({
            role: msg.role as 'user' | 'model',
            parts: [{ text: msg.text }]
        }));

        try {
            const stream = await client.callTextAIStream(
                "", // User input is already in the history
                historyForApi,
                apiClientObject,
                assistantModelSettings,
                GAME_MASTER_ASSISTANT_SYSTEM_PROMPT,
                [] // No safety settings for creative assistant
            );

            let modelResponse = '';
            setChatHistory(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setChatHistory(prev => {
                    const newHistory = [...prev];
                    const lastMessage = newHistory[newHistory.length - 1];
                    if (lastMessage && lastMessage.role === 'model') {
                        lastMessage.text = modelResponse;
                    }
                    return newHistory;
                });
            }
        } catch (e: any) {
            const errorMessage = e.message || 'Lỗi không xác định.';
            setError(`Lỗi: ${errorMessage}`);
            setChatHistory(prev => [...prev, { role: 'model', text: `*Đã xảy ra lỗi: ${errorMessage}*` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePackage = async () => {
        if (isPackaging || chatHistory.length === 0) return;
        
        setIsPackaging(true);
        setError(null);
        const apiClientObject: client.ApiClient = { getApiClient, cycleToNextApiKey, apiStats, onApiKeyInvalid };

        try {
            const historyText = chatHistory.map(m => `**${m.role === 'user' ? 'Tác giả' : 'GameMasterAI'}:**\n${m.text}`).join('\n\n---\n\n');
            const sessionTitle = currentSession?.title || 'world';
            const filenameBase = sessionTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();

            // 1. Generate Knowledge File
            const knowledgePrompt = PACKAGING_KNOWLEDGE_PROMPT.replace('{CHAT_HISTORY_PLACEHOLDER}', historyText);
            const knowledgeResponse = await client.callCreativeTextAI(knowledgePrompt, apiClientObject, settings.aiModelSettings, []);
            downloadFile(knowledgeResponse.text, `${filenameBase}_knowledge.txt`, 'text/plain;charset=utf-8');

            // 2. Generate Template File
            const templatePrompt = PACKAGING_TEMPLATE_PROMPT.replace('{CHAT_HISTORY_PLACEHOLDER}', historyText);
            const { parsed: templateJson } = await client.callJsonAI(templatePrompt, schemas.quickAssistSchema, apiClientObject, { ...settings.aiModelSettings, maxOutputTokens: 8192 }, []);
            downloadFile(JSON.stringify(templateJson, null, 2), `${filenameBase}_template.json`, 'application/json;charset=utf-8');
            
            alert("Đã đóng gói và tải về thành công 2 file: knowledge.txt và template.json!");

        } catch(e: any) {
            setError(`Lỗi khi đóng gói: ${e.message}`);
            alert(`Đã xảy ra lỗi khi đóng gói. Vui lòng thử lại. Lỗi: ${e.message}`);
        } finally {
            setIsPackaging(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-neutral-900 text-white">
            <header className="flex-shrink-0 p-4 flex justify-between items-center border-b border-neutral-700 bg-neutral-800/50 z-10">
                <button onClick={onBackToMenu} className="p-2 rounded-full text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors" aria-label="Quay lại">
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-bold text-white font-rajdhani">Huấn Luyện Chat</h1>
                <Button 
                    onClick={handlePackage}
                    disabled={isPackaging || isLoading || chatHistory.length === 0}
                    className="!w-auto !py-2 !px-3 !text-sm !rounded-lg flex items-center gap-2"
                >
                    {isPackaging ? <Spinner /> : <PackageIcon className="w-5 h-5" />}
                    <span>{isPackaging ? 'Đang Đóng Gói...' : 'Đóng Gói'}</span>
                </Button>
            </header>

            <main ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-6">
                     {chatHistory.length === 0 && !isLoading && (
                        <div className="text-center text-neutral-500 pt-20">
                            <p>Bắt đầu cuộc trò chuyện với GameMasterAI.</p>
                            <p className="text-sm">Hãy đưa ra ý tưởng, AI sẽ giúp bạn phát triển nó thành một thế giới hoàn chỉnh.</p>
                        </div>
                    )}
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`p-4 rounded-2xl max-w-2xl prose prose-invert prose-lg leading-relaxed ${
                                    msg.role === 'user' ? 'bg-pink-600/80 text-white rounded-br-lg' : 'bg-neutral-700/80 text-neutral-200 rounded-bl-lg'
                                }`}
                                dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) as string }}
                            ></div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex justify-start">
                            <div className="p-4 rounded-2xl max-w-2xl bg-neutral-700/80 text-neutral-200 rounded-bl-lg">
                               <Spinner />
                            </div>
                        </div>
                    )}
                     {error && (
                        <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200">
                            <strong>Lỗi:</strong> {error}
                        </div>
                     )}
                </div>
            </main>

            <footer className="flex-shrink-0 p-4 bg-neutral-800/50 border-t border-neutral-700">
                <div className="max-w-3xl mx-auto relative">
                    <TextareaField
                        id="assistant-input"
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder={isLoading || isPackaging ? "AI đang làm việc..." : "Nhập ý tưởng hoặc câu hỏi của bạn..."}
                        disabled={isLoading || isPackaging}
                        className="flex-grow bg-neutral-900/50 border border-neutral-600 rounded-2xl focus:ring-pink-500 resize-none py-3 pl-4 pr-16 w-full"
                        rows={1}
                    />
                     <Button
                        onClick={handleSend}
                        disabled={isLoading || isPackaging || !userInput.trim()}
                        className="!absolute !right-2 !bottom-2 !w-auto !rounded-full !p-3"
                    >
                        <SendIcon className="w-5 h-5" />
                    </Button>
                </div>
            </footer>
             <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #555; border-radius: 10px; }
                textarea { max-height: 200px; }
            `}</style>
        </div>
    );
};

export default AssistantChatScreen;
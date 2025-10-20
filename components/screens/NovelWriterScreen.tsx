
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { useSettings } from '../../hooks/useSettings';
import { ChatMessage } from '../../types';
import * as StorageService from '../../services/StorageService';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { NOVEL_WRITER_SYSTEM_PROMPT } from '../../services/prompt-engineering/corePrompts';
import { marked } from 'https://esm.sh/marked@13.0.2';
// FIX: Add missing imports for Button and TextareaField.
import Button from '../ui/Button';
import TextareaField from '../ui/TextareaField';

// Simple loading spinner
const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

// New component for the send button
const SendIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);


const NovelWriterScreen: React.FC<{ 
    onBackToMenu: () => void; 
    settingsHook: ReturnType<typeof useSettings>;
    onApiKeyInvalid: () => void;
}> = ({ onBackToMenu, settingsHook, onApiKeyInvalid }) => {
    const { settings, getApiClient, isKeyConfigured } = settingsHook;
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [chat, setChat] = useState<Chat | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const isSavingRef = useRef(false);
    const [initKey, setInitKey] = useState(0); // Add a key to force re-initialization

    // Initialization
    useEffect(() => {
        const initialize = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const loadedHistory = await StorageService.loadNovelHistory() || [];
                setChatHistory(loadedHistory);

                const geminiService = getApiClient();
                if (geminiService) {
                    const novelModelSettings = {
                        ...settings.aiModelSettings,
                        maxOutputTokens: 8192, // Maximize output for long chapters
                        temperature: 0.75, // Slightly less random for consistency
                    };
                    const newChat = geminiService.chats.create({
                        model: novelModelSettings.model,
                        config: {
                            ...novelModelSettings,
                            systemInstruction: NOVEL_WRITER_SYSTEM_PROMPT,
                        },
                        history: loadedHistory.map(msg => ({
                            role: msg.role,
                            parts: [{ text: msg.text }]
                        }))
                    });
                    setChat(newChat);
                } else {
                     setError("Vui lòng cấu hình API key trong phần cài đặt trước khi sử dụng.");
                }
            } catch (e: any) {
                setError(`Lỗi khởi tạo: ${e.message}`);
                 if (e.message.includes('API key')) {
                    onApiKeyInvalid();
                }
            } finally {
                setIsLoading(false);
            }
        };
        initialize();
    }, [getApiClient, settings.aiModelSettings, initKey]); // Re-run when initKey changes
    
    // Auto-scrolling
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    // Save history
    useEffect(() => {
        // Save only when not loading and there's history to save
        if (!isLoading && chatHistory.length > 0 && !isSavingRef.current) {
            isSavingRef.current = true;
            StorageService.saveNovelHistory(chatHistory).finally(() => {
                isSavingRef.current = false;
            });
        }
    }, [chatHistory, isLoading]);


    const handleSend = async () => {
        if (!userInput.trim() || isLoading) return;

        if (!chat) {
            setError("Phiên trò chuyện chưa được khởi tạo. Đang thử lại...");
            setInitKey(prev => prev + 1); // Attempt to re-initialize
            return;
        }

        const userMessage: ChatMessage = { role: 'user', text: userInput };
        setChatHistory(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);
        setError(null);

        try {
            const stream = await chat.sendMessageStream({ message: userMessage.text });

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
            setError(`Lỗi khi gửi tin nhắn: ${errorMessage}`);
            const errorMsg = `*Đã xảy ra lỗi. Vui lòng thử lại. Lỗi: ${errorMessage}*`;
            setChatHistory(prev => {
                const newHistory = [...prev];
                const lastMessage = newHistory[newHistory.length - 1];
                if (lastMessage && lastMessage.role === 'model' && lastMessage.text === '') {
                    lastMessage.text = errorMsg;
                } else {
                    newHistory.push({ role: 'model', text: errorMsg });
                }
                return newHistory;
            });

            if (errorMessage.includes('API key expired') || errorMessage.includes('Requested entity was not found') || errorMessage.includes('API_KEY_INVALID')) {
                onApiKeyInvalid();
                setChat(null); // Invalidate the chat object to force re-init
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-neutral-900 text-white">
            <header className="flex-shrink-0 p-4 flex items-center border-b border-neutral-700 bg-neutral-800/50 z-10">
                <button onClick={onBackToMenu} className="p-2 rounded-full text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors" aria-label="Quay lại">
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-bold text-white font-rajdhani mx-auto">AI Tiểu Thuyết Gia</h1>
                <div className="w-10"></div>
            </header>

            <main ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-6">
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
                    {isLoading && chatHistory.length > 0 && chatHistory[chatHistory.length - 1]?.role === 'user' && (
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
                <div className="max-w-4xl mx-auto flex items-end gap-2">
                    <TextareaField
                        id="novel-input"
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder={isLoading ? "AI đang viết..." : "Nhập chỉ dẫn cho chương tiếp theo..."}
                        disabled={isLoading}
                        className="flex-grow !py-3 resize-none"
                        rows={1}
                    />
                     <Button
                        onClick={handleSend}
                        disabled={isLoading || !userInput.trim()}
                        className="!w-auto flex-shrink-0 !p-3.5"
                    >
                        <SendIcon className="w-6 h-6" />
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

export default NovelWriterScreen;
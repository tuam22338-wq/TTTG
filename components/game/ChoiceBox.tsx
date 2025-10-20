import React, { useState } from 'react';
import Button from '../ui/Button';
import { AiSettings } from '../../types';
import { BrainIcon } from '../icons/BrainIcon';
import { RewriteIcon } from '../icons/RewriteIcon';
import { CompassIcon } from '../icons/CompassIcon';
import ChevronIcon from '../icons/ChevronIcon';

interface ChoiceBoxProps {
    choices: string[];
    onChoice: (choice: string) => void;
    isLoading: boolean;
    aiSettings: AiSettings;
    customAction: string;
    onCustomActionChange: (action: string) => void;
    onOpenAiControlModal: () => void;
    canRewrite: boolean;
    onRequestRewrite: () => void;
    canCorrect: boolean;
    onRequestCorrection: () => void;
    isNovelMode: boolean;
}

const stripHighlightTags = (text: string): string => {
    return text.replace(/\[HN\]/g, '').replace(/\[\/HN\]/g, '');
};

const ChoiceBox: React.FC<ChoiceBoxProps> = ({
    choices,
    onChoice,
    isLoading,
    aiSettings,
    customAction,
    onCustomActionChange,
    onOpenAiControlModal,
    canRewrite,
    onRequestRewrite,
    canCorrect,
    onRequestCorrection,
    isNovelMode,
}) => {
    const [isChoicesVisible, setIsChoicesVisible] = useState(true);
    const [promptMode, setPromptMode] = useState<'action' | 'speak'>('action');
    
    const handleCustomAction = () => {
        if (!isLoading && customAction.trim()) {
            let finalText = customAction.trim();
            if (promptMode === 'speak' && !isNovelMode) {
                finalText = `Nói: "${finalText}"`;
            }
            onChoice(finalText);
        }
    };

    return (
        <div className="bg-neutral-900/70 backdrop-blur-md border border-white/10 rounded-2xl p-4 transition-all duration-300">
            {isLoading && (choices.length === 0 || isNovelMode) ? (
                 <p className="text-center text-lg text-neutral-400 animate-pulse">{isNovelMode ? 'AI đang sáng tác...' : 'AI đang suy nghĩ...'}</p>
            ) : (
                <div>
                    {!isNovelMode && (
                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isChoicesVisible ? 'max-h-52 visible opacity-100' : 'max-h-0 invisible opacity-0'}`}>
                            <div className="overflow-y-auto pr-2 choice-scroll">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {choices.map((choice, index) => (
                                        <Button
                                            key={index}
                                            onClick={() => onChoice(choice)}
                                            disabled={isLoading}
                                            variant="choice"
                                        >
                                            {stripHighlightTags(choice)}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className={`${!isNovelMode ? (isChoicesVisible ? 'mt-4 pt-4 border-t' : 'mt-0 pt-0 border-t-0') : ''} border-neutral-700/50`}>
                       <div className="flex items-center gap-2">
                           <div className="group relative flex items-center bg-black/20 border border-white/10 rounded-lg transition-all duration-300 flex-grow">
                                {!isNovelMode && (
                                    <>
                                        <div className="flex-shrink-0 flex gap-1 p-1">
                                            <button onClick={() => setPromptMode('action')} className={`px-3 py-1.5 text-xs rounded font-semibold transition-colors ${promptMode === 'action' ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5'}`}>Hành động</button>
                                            <button onClick={() => setPromptMode('speak')} className={`px-3 py-1.5 text-xs rounded font-semibold transition-colors ${promptMode === 'speak' ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5'}`}>Nói</button>
                                        </div>
                                        <div className="w-px h-6 bg-white/10 self-center"></div>
                                    </>
                                )}
                                <input
                                    id="custom-action"
                                    placeholder={isNovelMode ? "Nhập chỉ dẫn cho chương tiếp theo..." : (promptMode === 'action' ? "Nhập hành động..." : "Nhập lời thoại...")}
                                    value={customAction}
                                    onChange={(e) => onCustomActionChange(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleCustomAction(); }}
                                    disabled={isLoading}
                                    className="flex-grow bg-transparent border-0 focus:ring-0 py-2.5 px-4 text-base w-full text-white placeholder:text-neutral-500"
                                />
                                <Button
                                    onClick={handleCustomAction}
                                    disabled={isLoading || !customAction.trim()}
                                    className="!w-auto flex-shrink-0 !py-1.5 !px-4 !text-sm !rounded-md mr-2"
                                >
                                    Gửi
                                </Button>
                            </div>
                            {!isNovelMode && (
                                <button 
                                onClick={() => setIsChoicesVisible(!isChoicesVisible)}
                                disabled={isLoading}
                                className="p-2.5 rounded-lg border border-solid border-white/10 bg-black/20 text-neutral-400 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0" 
                                title={isChoicesVisible ? "Ẩn gợi ý" : "Hiện gợi ý"}>
                                <ChevronIcon isExpanded={!isChoicesVisible} />
                                </button>
                            )}
                           <button 
                               onClick={onRequestCorrection}
                               disabled={isLoading || !canCorrect}
                               className="p-2.5 rounded-lg border border-solid border-white/10 bg-black/20 text-neutral-400 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0" 
                               title="Chỉnh Lối Tường Thuật (Nhắc nhở AI viết tiếp)">
                               <CompassIcon />
                           </button>
                           <button 
                               onClick={onRequestRewrite}
                               disabled={isLoading || !canRewrite}
                               className="p-2.5 rounded-lg border border-solid border-white/10 bg-black/20 text-neutral-400 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0" 
                               title="Viết Lại Lượt Này">
                               <RewriteIcon />
                           </button>
                           <button 
                               onClick={onOpenAiControlModal}
                               disabled={isLoading}
                               className="p-2.5 rounded-lg border border-solid border-white/10 bg-black/20 text-neutral-400 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0" 
                               title="Bảng điều khiển AI">
                               <BrainIcon />
                           </button>
                       </div>
                    </div>
                </div>
            )}
            <style>{`
                .choice-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .choice-scroll::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.1);
                    border-radius: 10px;
                }
                .choice-scroll::-webkit-scrollbar-thumb {
                    background-color: #444;
                    border-radius: 10px;
                }
                .choice-scroll::-webkit-scrollbar-thumb:hover {
                    background-color: #666;
                }
            `}</style>
        </div>
    );
};

export default ChoiceBox;
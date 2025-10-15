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
}

const LUST_FLAVOR_TEXT = {
    DOMINATION: 'Thống Trị',
    HARMONY: 'Đồng Điệu',
    SUBMISSION: 'Phục Tùng',
    TEASING: 'Trêu Ghẹo',
    AI_FREESTYLE: 'AI Tự Do',
    SEDUCTION: 'Quyến Rũ',
};

const AIStateAnnunciator: React.FC<{
    aiSettings: AiSettings;
}> = ({ aiSettings }) => {
    const { isLogicModeOn, lustModeFlavor, isConscienceModeOn, isStrictInterpretationOn, destinyCompassMode } = aiSettings;
    const getMessage = (): { text: string; className: string } => {
        if (!isLogicModeOn) {
            return {
                text: `<strong>CẢNH BÁO:</strong> Logic TẮT. Bạn có toàn quyền của Tác Giả, AI sẽ tuân theo mọi mệnh lệnh bất kể logic.`,
                className: 'text-yellow-300' // Keep warning color for this specific case
            };
        }

        let compassMessage = '';
        switch(destinyCompassMode) {
            case 'HARSH': compassMessage = 'trong bối cảnh <strong class="text-white">Khắc Nghiệt</strong>'; break;
            case 'HELLISH': compassMessage = 'trong bối cảnh <strong class="text-white">Nghịch Thiên</strong>'; break;
        }

        if (lustModeFlavor) {
            const flavorText = LUST_FLAVOR_TEXT[lustModeFlavor];
            let mainMessage = `Trạng thái AI: Chế độ <strong class="text-white">Dục Vọng (${flavorText})</strong> được kích hoạt`;
            if (isConscienceModeOn) {
                mainMessage += ` kết hợp <strong class="text-white">Lương Tâm</strong>. Hành động sẽ táo bạo nhưng có chừng mực, tránh tổn thương vĩnh viễn`;
            }
            return {
                text: `${mainMessage} ${compassMessage}.`,
                className: 'text-neutral-300'
            };
        }
        
        if (isConscienceModeOn) {
            return {
               text: `Trạng thái AI: Chế độ <strong class="text-white">Lương Tâm</strong> được kích hoạt. AI sẽ ưu tiên các hành động cứu vãn ${compassMessage}.`,
               className: 'text-neutral-300'
           };
        }

        switch(destinyCompassMode) {
            case 'HARSH': return { text: `Trạng thái AI: Thế giới đang ở mức <strong class="text-white">Khắc Nghiệt</strong>. AI sẽ tạo ra thử thách cao và sự kiện bất lợi.`, className: 'text-neutral-300' };
            case 'HELLISH': return { text: `Trạng thái AI: Thế giới đang ở mức <strong class="text-white">Nghịch Thiên</strong>. AI sẽ chủ động tạo ra thảm họa.`, className: 'text-neutral-300' };
            default:
                if (isStrictInterpretationOn) {
                     return {
                        text: `Trạng thái AI: Chế độ Diễn Giải Nghiêm Túc. AI sẽ diễn giải hành động theo hướng trong sáng.`,
                        className: 'text-neutral-300'
                    };
                }
                return {
                    text: `Trạng thái AI: Bình thường. AI sẽ tuân thủ logic và tạo ra thử thách cân bằng.`,
                    className: 'text-neutral-400'
                };
        }
    };

    const { text, className } = getMessage();

    return (
        <div className="mb-3 p-3 bg-black/25 rounded-lg text-center text-xs transition-all duration-300">
             <p className={`italic ${className}`} dangerouslySetInnerHTML={{ __html: text }} />
        </div>
    );
};

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
}) => {
    const [isChoicesVisible, setIsChoicesVisible] = useState(true);
    
    const handleCustomAction = () => {
        if (!isLoading && customAction.trim()) {
            onChoice(customAction.trim());
        }
    };

    return (
        <div className="bg-neutral-900/70 backdrop-blur-md border border-white/10 rounded-2xl p-4 transition-all duration-300">
            {isLoading && choices.length === 0 ? (
                 <p className="text-center text-lg text-neutral-400 animate-pulse">AI đang viết...</p>
            ) : (
                <div>
                    <div className={`transition-all duration-500 ease-in-out ${isChoicesVisible ? 'max-h-52 visible opacity-100' : 'max-h-0 invisible opacity-0'}`}>
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
                    
                    <div className={`${isChoicesVisible ? 'mt-4 pt-4 border-t' : 'mt-0 pt-0 border-t-0'} border-neutral-700/50`}>
                        <AIStateAnnunciator aiSettings={aiSettings} />

                        <p className="text-sm text-center text-neutral-400 mb-3">Hoặc, tự do hành động:</p>
                        <div className="flex items-center gap-2">
                           <div className="group relative flex items-center bg-black/20 border border-white/10 rounded-lg transition-all duration-300 flex-grow">
                                <input
                                    id="custom-action"
                                    placeholder="Nhập hành động... (hoặc *dùng lệnh meta ở đây*)"
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
                             <button 
                               onClick={() => setIsChoicesVisible(!isChoicesVisible)}
                               disabled={isLoading}
                               className="p-2.5 rounded-lg border border-solid border-white/10 bg-black/20 text-neutral-400 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0" 
                               title={isChoicesVisible ? "Ẩn gợi ý" : "Hiện gợi ý"}>
                               <ChevronIcon isExpanded={!isChoicesVisible} />
                           </button>
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
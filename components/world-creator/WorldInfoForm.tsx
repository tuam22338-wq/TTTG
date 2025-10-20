import React, { useState } from 'react';
import { WorldCreationState, NarrativePerspective, Settings } from '../../types';
import FormSection from './FormSection';
import InputField from '../ui/InputField';
import TextareaField from '../ui/TextareaField';
import ToggleSwitch from '../ui/ToggleSwitch';
import { SparklesIcon } from '../icons/SparklesIcon';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import Button from '../ui/Button';
import * as client from '../../services/gemini/client';
import { ApiClient } from '../../services/gemini/client';

interface WorldInfoFormProps {
    state: WorldCreationState;
    setState: React.Dispatch<React.SetStateAction<WorldCreationState>>;
    apiClient: ApiClient;
    settings: Settings;
}

const perspectiveDescriptions: Record<NarrativePerspective, { title: string; text: string; special?: string }> = {
  'Nhãn Quan Toàn Tri': {
    title: 'Nhãn Quan Toàn Tri (Khuyến khích)',
    text: 'Bạn sẽ theo chân nhân vật chính (ngôi thứ ba giới hạn), nhưng đôi khi, AI sẽ hé lộ những "cảnh cắt" đặc biệt về các sự kiện, suy nghĩ và bí mật mà nhân vật của bạn không hề hay biết, tạo ra sự kịch tính và chiều sâu cho cốt truyện.',
    special: 'Các "cảnh cắt" này sẽ được hiển thị trong một khung riêng biệt với biểu tượng con mắt (👁️) để bạn dễ dàng nhận ra.',
  },
  'Ngôi thứ ba Giới hạn': {
    title: 'Ngôi thứ ba Giới hạn',
    text: 'Câu chuyện được kể qua góc nhìn của nhân vật chính. Bạn chỉ biết những gì nhân vật của bạn biết, thấy, và cảm nhận. Một trải nghiệm nhập vai cổ điển.',
  },
  'Ngôi thứ hai': {
    title: 'Ngôi thứ hai',
    text: 'AI sẽ kể chuyện trực tiếp với bạn, sử dụng đại từ "Bạn". Đây là lối kể chuyện nhập vai sâu, khiến bạn cảm thấy mình thực sự là nhân vật chính.',
  },
  'Ngôi thứ ba Toàn tri': {
    title: 'Ngôi thứ ba Toàn tri (Cũ)',
    text: 'Người kể chuyện biết mọi thứ. AI có thể mô tả suy nghĩ và hành động của bất kỳ nhân vật nào, ở bất kỳ đâu, và lồng ghép chúng trực tiếp vào dòng tự sự chính.',
  },
};

const WorldInfoForm: React.FC<WorldInfoFormProps> = ({ state, setState, apiClient, settings }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { getApiClient } = apiClient;

    const handleGenerateDescription = async () => {
        if (!getApiClient()) {
            alert("Dịch vụ AI chưa sẵn sàng hoặc chưa cấu hình API Key.");
            apiClient.onApiKeyInvalid();
            return;
        }
        if (!state.genre && !state.description.trim()) {
            alert("Vui lòng nhập Thể loại game hoặc Mô tả Bối Cảnh trước khi tạo.");
            return;
        }

        setIsLoading(true);

        let basePrompt: string;

        if (state.description.trim()) {
            // --- User has provided input, develop it ---
            basePrompt = `Bạn là một AI biên kịch và xây dựng thế giới. Nhiệm vụ của bạn là đọc một ý tưởng ban đầu từ người dùng và phát triển nó thành một bối cảnh thế giới hoàn chỉnh, chi tiết và lôi cuốn.

**Yêu cầu:**
1.  **Tôn trọng ý tưởng gốc:** Giữ lại và làm sâu sắc thêm tất cả các yếu tố cốt lõi mà người dùng đã cung cấp (tên địa danh, nhân vật, sự kiện, khái niệm...).
2.  **Làm phong phú:** Mở rộng các chi tiết, lấp đầy những khoảng trống một cách logic và sáng tạo để tạo ra một bức tranh toàn cảnh sống động.
3.  **Cấu trúc hóa:** Sắp xếp lại thông tin thành một đoạn văn xuôi mạch lạc, có cấu trúc rõ ràng (ví dụ: giới thiệu chung, địa lý, chính trị, văn hóa, các yếu tố đặc trưng...), nhưng CHỈ dựa trên những gì người dùng đã cung cấp hoặc suy luận logic từ đó.
4.  **TUYỆT ĐỐI CẤM:** Không được tự ý thêm vào các khái niệm, yếu tố, hoặc chi tiết hoàn toàn mới mà không có trong hoặc không liên quan trực tiếp đến ý tưởng gốc của người dùng. Mục tiêu là phát triển, không phải thay thế.

**Thể loại tham khảo (nếu có):** "${state.genre || 'Không có'}"
**Ý tưởng ban đầu của người dùng:**
---
${state.description}
---

Hãy bắt đầu phát triển ý tưởng trên thành một bối cảnh thế giới hoàn chỉnh.`;

        } else {
            // --- User has not provided input, generate from scratch based on genre ---
            basePrompt = `Dựa trên thể loại "${state.genre}", hãy xây dựng một thế giới chi tiết. Cần bao gồm:

- Tên thế giới: Một cái tên có ý nghĩa, gợi lên đặc trưng của thế giới.
- Tổng quan: Mô tả khái quát về thế giới (ví dụ: đang ở trong thời kỳ chiến tranh, thịnh vượng, hay suy tàn).
- Cấu trúc xã hội và chính trị: Các thế lực chính, hệ thống cai trị, và mối quan hệ giữa các phe phái.
- Đặc trưng địa lý và văn hóa: Những vùng đất đặc biệt, các chủng tộc sinh sống, và phong tục tập quán nổi bật.
- Yếu tố đặc biệt: Một yếu tố độc đáo của thế giới (ví dụ: một loại ma thuật hiếm, một bí mật cổ xưa).

Hãy viết một đoạn văn mạch lạc, kết hợp các yếu-tố trên để tạo nên một bối cảnh hấp dẫn và có tính sáng tạo.`;
        }

        let prompt = basePrompt;
        if (state.isNsfw) {
            prompt += "\n\nQuan trọng: Vì đây là thế giới 18+, hãy lồng ghép các yếu tố trưởng thành, nhục dục, hoặc bạo lực một cách tự nhiên vào các khía cạnh trên (ví dụ: một xã hội tôn thờ khoái lạc, một phe phái chính trị tàn bạo, các phong tục văn hóa nhạy cảm).";
        }
        
        try {
            const safetySettingsConfig = state.isNsfw ? [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ] : [];

            const response = await client.callCreativeTextAI(prompt, apiClient, settings.aiModelSettings, safetySettingsConfig);
            
            const text = response.text;
            setState(s => ({ ...s, description: text }));
        } catch (error) {
            console.error("Error generating world description:", error);
            alert("Đã xảy ra lỗi khi tạo mô tả. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    }
    
    const currentDescription = perspectiveDescriptions[state.narrativePerspective];

    return (
        <FormSection title="Thế Giới & Cốt Truyện" description="Đặt nền móng cho thế giới mà bạn sắp thống trị.">
            <InputField
                label="Thể loại game"
                id="genre"
                placeholder="VD: Tiên hiệp, Tận thế, Hoan dâm thế giới..."
                value={state.genre}
                onChange={e => setState(s => ({ ...s, genre: e.target.value }))}
            />
            <div>
                <label htmlFor="narrative-perspective" className="block text-sm font-medium text-neutral-400 mb-2">Ngôi kể</label>
                <select
                    id="narrative-perspective"
                    value={state.narrativePerspective}
                    onChange={e => setState(s => ({ ...s, narrativePerspective: e.target.value as NarrativePerspective }))}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                    {Object.keys(perspectiveDescriptions).map(key => (
                        <option key={key} value={key}>{perspectiveDescriptions[key as NarrativePerspective].title}</option>
                    ))}
                </select>
                {currentDescription && (
                    <div className="mt-3 p-3 bg-black/20 rounded-lg border border-white/10 transition-all duration-300 animate-fade-in-fast">
                        <p className="text-sm font-semibold text-white">{currentDescription.title}</p>
                        <p className="text-xs text-neutral-300 mt-1">{currentDescription.text}</p>
                        {currentDescription.special && (
                            <p className="text-xs text-amber-300 mt-2 font-bold">[ĐIỂM ĐẶC BIỆT] {currentDescription.special}</p>
                        )}
                    </div>
                )}
            </div>
            <div>
                 <div className="flex justify-between items-center mb-2">
                    <label htmlFor="description" className="block text-sm font-medium text-neutral-400">Mô tả Bối Cảnh</label>
                    <button
                        onClick={handleGenerateDescription}
                        disabled={isLoading}
                        className="p-2 text-neutral-400 hover:text-white transition-colors rounded-full bg-black/20 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="AI Hỗ trợ Bối cảnh"
                    >
                        <SparklesIcon isLoading={isLoading} />
                    </button>
                </div>
                <TextareaField
                    id="description"
                    placeholder="Mô tả chi tiết về bối cảnh, lịch sử, các thế lực chính... hoặc để AI hỗ trợ."
                    value={state.description}
                    onChange={e => setState(s => ({ ...s, description: e.target.value }))}
                    rows={5}
                />
            </div>
            <ToggleSwitch
                label="Chế độ 18+ (NSFW)"
                id="nsfw-toggle"
                enabled={state.isNsfw}
                setEnabled={enabled => setState(s => ({ ...s, isNsfw: enabled }))}
                description="Cốt truyện sẽ chứa các tình huống và mô tả tình dục không che đậy."
            />
        </FormSection>
    )
}

export default WorldInfoForm;
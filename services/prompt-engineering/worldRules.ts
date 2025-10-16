import { WorldRule } from '../../types';

export function getWorldRulesPrompt(specialRules: WorldRule[], initialLore: WorldRule[]): string {
    if (specialRules.length === 0 && initialLore.length === 0) {
        return '';
    }

    let prompt = `
**QUY LUẬT THẾ GIỚI (WORLD LAWS & LORE)**
Bạn phải tuân thủ và tích hợp các quy tắc sau vào câu chuyện.
`;

    if (specialRules.length > 0) {
        prompt += `
**1. LUẬT LỆ ĐẶC BIỆT (QUY TẮC BẤT BIẾN - ƯU TIÊN TỐI CAO):**
Đây là những định luật vật lý, ma pháp, hoặc xã hội của thế giới này. Bạn BẮT BUỘC phải tuân thủ chúng một cách tuyệt đối, không được bẻ cong hay vi phạm. Chúng có độ ưu tiên cao hơn cả sự sáng tạo của bạn.
`;
        specialRules.forEach(rule => {
            prompt += `- **${rule.name}:** ${rule.content}\n`;
        });
    }

    if (initialLore.length > 0) {
        prompt += `
**2. LORE BAN ĐẦU (THÔNG TIN NỀN):**
Đây là những thông tin về lịch sử, văn hóa, hoặc các sự kiện đã xảy ra. Hãy cố gắng tích hợp những chi tiết này vào câu chuyện một cách tự nhiên để làm thế giới thêm phong phú và nhất quán.
`;
        initialLore.forEach(rule => {
            prompt += `- **${rule.name}:** ${rule.content}\n`;
        });
    }

    return prompt;
}

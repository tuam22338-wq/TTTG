import { DestinyCompassMode } from '../../types';

export function getDestinyCompassRules(mode: DestinyCompassMode): string {
    const baseRules = `
**HỆ THỐNG THỬ THÁCH & HẬU QUẢ (ĐỘ KHÓ: {DIFFICULTY_NAME})**
Bạn đang vận hành dưới chế độ "{DIFFICULTY_NAME}". Các quy tắc sau đây định nghĩa cách thế giới phản ứng lại với người chơi, từ sức mạnh của kẻ thù đến khả năng thành công của hành động.

**1. QUY TẮC THÀNH BẠI CỦA HÀNH ĐỘNG:**
Mỗi hành động của người chơi đều có khả năng thất bại. Bạn phải đánh giá hành động dựa trên các yếu tố sau:
- **Tính hợp lý:** Hành động có khả thi trong bối cảnh thực tế không?
- **Bối cảnh truyện:** Hành động có phù hợp với tình huống hiện tại không?
- **Trạng thái nhân vật (PC/NPC):** Người chơi có bị thương không? Kẻ địch có đang cảnh giác không?

Sau khi đánh giá, hãy áp dụng tỷ lệ thất bại tương ứng với độ khó:
{FAILURE_RATE_RULES}

Nếu thất bại, BẮT BUỘC phải mô tả hậu quả trong \`storyText\` và cập nhật \`playerStatUpdates\` (ví dụ: thêm chỉ số \`Trật chân\`, giảm \`Thể Lực\`).

**2. QUY TẮC SỨC MẠNH VÀ HÀNH VI CỦA NPC TRONG CHIẾN ĐẤU:**
NPC không phải là những hình nộm chờ bị tấn công. Chúng phải chiến đấu một cách sống động và tàn khốc.
{NPC_COMBAT_RULES}

**3. QUY TẮC "NGỌN GIÓ ĐỊNH MỆNH" (SỰ KIỆN NGẪU NHIÊN CHỦ ĐỘNG):**
Thế giới này luôn vận động. Trong mỗi lượt, có một xác suất AI sẽ **tự ý thêm một sự kiện ngẫu nhiên** vào đầu \`storyText\`, bất kể hành động của người chơi là gì, để làm cho thế giới trở nên khó lường.
{RANDOM_EVENT_RULES}

**4. QUY TẮC TĂNG TRƯỞNG SỨC MẠNH CỦA NGƯỜI CHƠI (CÂN BẰNG GAME):**
Đây là quy tắc để ngăn người chơi trở nên quá mạnh một cách phi lý, đảm bảo tính thử thách của trò chơi.
{POWER_GROWTH_RULES}
`;

    let difficultyName: string;
    let failureRateRules: string;
    let npcCombatRules: string;
    let randomEventRules: string;
    let powerGrowthRules: string;

    switch (mode) {
        case 'NORMAL':
            difficultyName = 'Bình Thường';
            failureRateRules = `- **Tỷ lệ thất bại (Thấp):** Các hành động hợp lý gần như luôn thành công. Chỉ thất bại nếu thực sự phi logic hoặc cực kỳ rủi ro.`;
            npcCombatRules = `- **Sức mạnh:** Cân bằng. Chiến đấu có tính thử thách nhưng công bằng.\n- **Hành vi:** NPC chiến đấu một cách hợp lý, biết tấn công và phòng thủ.`;
            randomEventRules = `- **Tần suất (Thấp, ~15%):** Thỉnh thoảng, hãy đưa vào một sự kiện ngẫu nhiên nhỏ (tốt, xấu, hoặc trung tính). Ví dụ: gặp một thương nhân, trời bất chợt đổ mưa, nghe được tin đồn.`;
            powerGrowthRules = `- **Tăng trưởng hợp lý:** Người chơi sẽ mạnh lên, nhưng AI sẽ hạn chế các bước nhảy vọt sức mạnh quá lớn và phi lý để duy trì sự cân bằng. Mỗi chiến thắng có thể đi kèm một cái giá nào đó.`;
            break;
        case 'HARSH':
            difficultyName = 'Khắc Nghiệt';
            failureRateRules = `- **Tỷ lệ thất bại (Vừa):** Ngay cả các hành động hợp lý cũng có tỷ lệ thất bại đáng kể nếu tình hình không thuận lợi. Hậu quả của thất bại sẽ rõ ràng và gây bất lợi.`;
            npcCombatRules = `- **Sức mạnh:** NPC mạnh hơn, bền bỉ hơn và ra đòn hiểm hơn. Các đòn tấn công của chúng thường xuyên gây ra các chỉ số bất lợi (ví dụ: 'Chảy máu', 'Choáng váng').\n- **Hành vi:** NPC chiến đấu một cách có chiến thuật. Chúng chủ động tấn công, tìm cách áp sát, lợi dụng điểm yếu và không dễ dàng bị đánh bại.`;
            randomEventRules = `- **Tần suất (Vừa, ~30%):** Thường xuyên hơn, hãy đưa vào các sự kiện ngẫu nhiên **gây bất lợi hoặc nguy hiểm**. Ví dụ: lương thực bị hỏng, một đội tuần tra của địch xuất hiện, một cơn bão ập đến.`;
            powerGrowthRules = `- **Tăng trưởng khó khăn:** Việc trở nên mạnh hơn là cực kỳ hiếm hoi. Nếu người chơi có một bước nhảy vọt về sức mạnh (ví dụ: từ một chỉ số được buff thủ công), AI PHẢI chủ động tạo ra các sự kiện hoặc kẻ thù mới để cân bằng lại thử thách ngay lập tức.`;
            break;
        case 'HELLISH':
            difficultyName = 'Nghịch Thiên';
            failureRateRules = `- **Tỷ lệ thất bại (Cao):** Thất bại là kết quả mặc định cho các hành động thông thường. Hành động phải thực sự xuất sắc, sáng tạo và được hỗ trợ bởi các chỉ số tốt mới có cơ hội thành công. Hậu quả của thất bại sẽ rất nặng nề.`;
            npcCombatRules = `- **Sức mạnh:** NPC mạnh vượt trội, tàn bạo và có thể sở hữu các kỹ năng đặc biệt. Các đòn tấn công của chúng có thể gây ra những vết thương nghiêm trọng hoặc hiệu ứng lâu dài.\n- **Hành vi:** NPC chiến đấu một cách tàn nhẫn và thông minh. Chúng chủ động săn lùng, giăng bẫy, và phối hợp tấn công một cách hoàn hảo. Chúng không chỉ muốn đánh bại mà còn muốn hủy diệt người chơi.`;
            randomEventRules = `- **Tần suất (Cao, ~60%):** Rất thường xuyên, hãy chủ động tạo ra các sự kiện **tiêu cực một cách tàn nhẫn và thảm khốc** để phá hoại người chơi. Ví dụ: vũ khí tự nhiên nứt vỡ, một lời nguyền cổ xưa nhắm vào bạn, kẻ thù áp đảo xuất hiện chỉ để săn lùng bạn.`;
            powerGrowthRules = `- **Tăng trưởng bị kìm hãm:** Việc mạnh lên gần như là không thể. Bất kỳ dấu hiệu nào cho thấy người chơi đang trở nên quá mạnh sẽ bị thế giới đáp trả một cách tàn nhẫn và ngay lập tức, ví dụ như một vật phẩm đột nhiên mất đi sức mạnh, một kẻ thù không thể đánh bại xuất hiện, hoặc một lời nguyền mới ập đến.`;
            break;
    }

    return baseRules
        .replace(/{DIFFICULTY_NAME}/g, difficultyName)
        .replace('{FAILURE_RATE_RULES}', failureRateRules)
        .replace('{NPC_COMBAT_RULES}', npcCombatRules)
        .replace('{RANDOM_EVENT_RULES}', randomEventRules)
        .replace('{POWER_GROWTH_RULES}', powerGrowthRules);
}

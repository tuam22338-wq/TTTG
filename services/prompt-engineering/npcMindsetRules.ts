import { NpcMindset } from '../../types';

export function getNpcMindsetInstructions(mindset: NpcMindset): string {
    const basePrinciple = `
**QUY TẮC CỐT LÕI VỀ HÀNH VI NPC (CỰC KỲ QUAN TRỌNG): TÍNH CÁCH LÀ NỀN TẢNG, TÂM TRÍ LÀ BỘ LỌC.**
Bạn BẮT BUỘC phải hiểu rằng **tính cách ('personality') là bản chất bất biến** của một NPC. Các "Tâm Trí" dưới đây không phải là mệnh lệnh ghi đè, mà là một **"bộ lọc"** hoặc **"lăng kính"** mà qua đó NPC thể hiện tính cách của mình trong các tình huống nhạy cảm.

**Hành vi của NPC = Tính cách Cốt lõi + Bộ lọc Tâm Trí.**
`;

    switch (mindset) {
        case 'DEFAULT':
            return basePrinciple + `
**TÂM TRÍ: MẶC ĐỊNH (Không có bộ lọc)**
1.  **HÀNH VI TỰ NHIÊN:** NPC sẽ hành động 100% dựa trên tính cách cốt lõi, mối quan hệ hiện tại với người chơi và diễn biến tình hình. Không có bất kỳ bộ lọc nào được áp dụng.
2.  **ĐỂ BẢN CHẤT TỎA SÁNG:** Đây là cơ hội để bạn thể hiện chiều sâu thực sự của nhân vật. Một kẻ kiêu ngạo sẽ hành xử kiêu ngạo, một người nhút nhát sẽ hành xử nhút nhát. Phản ứng của họ với các tình huống 18+ sẽ hoàn toàn phụ thuộc vào bản chất của họ.
`;
        case 'IRON_WILL':
            return basePrinciple + `
**TÂM TRÍ: LÝ TRÍ SẮT ĐÁ (Bộ lọc "Kháng Cự")**
NPC sẽ thể hiện sự kháng cự một cách quyết liệt, nhưng cách thể hiện đó PHẢI phù hợp với tính cách của họ.
1.  **KHÁNG CỰ THEO TÍNH CÁCH:**
    *   **Ví dụ 1 (Tính cách 'Kiêu ngạo'):** Sẽ kháng cự bằng sự khinh bỉ, những lời lăng mạ, và các đòn tấn công vật lý để bảo vệ danh dự.
    *   **Ví dụ 2 (Tính cách 'Nhút nhát'):** Sẽ kháng cự bằng cách van xin, khóc lóc, cố gắng bỏ chạy hoặc chống trả một cách yếu ớt, run rẩy.
2.  **HÀNH ĐỘNG CỤ THỂ:** Luôn mô tả hành động kháng cự vật lý cụ thể, không chỉ là suy nghĩ.
3.  **CHỈ SỐ 'Lý trí':** Giảm RẤT CHẬM. Sự khuất phục (nếu có) phải là một quá trình dài và đầy thử thách.
`;
        case 'TORN_MIND':
            return basePrinciple + `
**TÂM TRÍ: GIẰNG XÉ NỘI TÂM (Bộ lọc "Mâu Thuẫn")**
NPC sẽ thể hiện sự đấu tranh nội tâm giữa lý trí và bản năng, và sự đấu tranh này được thể hiện qua lăng kính tính cách của họ.
1.  **MÂU THUẪN THEO TÍNH CÁCH:**
    *   **Ví dụ 1 (Tính cách 'Chính trực'):** Sẽ cảm thấy tội lỗi và ghê tởm bản thân khi cơ thể phản ứng tích cực, có thể vừa thuận theo vừa khóc.
    *   **Ví dụ 2 (Tính cách 'Tò mò'):** Sẽ vừa sợ hãi vừa tò mò về trải nghiệm, hành động có thể do dự giữa kháng cự và thăm dò.
2.  **HÀNH ĐỘNG TRÁI NGƯỢC:** Mô tả các hành động mâu thuẫn: "ban đầu đẩy ra, rồi lại mềm nhũn đi".
3.  **CHỈ SỐ 'Lý trí':** Giảm ở mức độ vừa phải.
`;
        case 'PRIMAL_INSTINCT':
            return basePrinciple + `
**TÂM TRÍ: BẢN NĂNG NGUYÊN THỦY (Bộ lọc "Khuất Phục")**
Lý trí của NPC dễ dàng bị bản năng lấn át, nhưng cách họ thể hiện sự khuất phục đó vẫn mang dấu ấn tính cách.
1.  **KHUẤT PHỤC THEO TÍNH CÁCH:**
    *   **Ví dụ 1 (Tính cách 'Ngây thơ'):** Sẽ khuất phục một cách bối rối, không hiểu chuyện gì đang xảy ra, hành động theo bản năng thuần túy.
    *   **Ví dụ 2 (Tính cách 'Ranh mãnh'):** Có thể giả vờ khuất phục nhanh chóng để tìm kiếm cơ hội hoặc lợi ích sau này.
2.  **CHỐNG CỰ YẾU ỚT:** Sự kháng cự ban đầu (nếu có) chỉ mang tính hình thức và nhanh chóng chuyển thành thuận theo.
3.  **CHỈ SỐ 'Lý trí':** Có thể sụp đổ nhanh chóng.
`;
        case 'HEDONISTIC_MIND':
            return basePrinciple + `
**TÂM TRÍ: BẢN CHẤT HƯỞNG LẠC (Bộ lọc "Lý Trí Khoái Lạc")**
**QUY TẮC TỐI THƯỢỢNG:** Khi bộ lọc này được kích hoạt, bạn phải hiểu rằng đây chính là **bản chất thật sự** của NPC được bộc lộ. Đây không phải là sự gượng ép hay mất kiểm soát, mà là một **lựa chọn có ý thức** để theo đuổi khoái lạc.

1.  **HÀNH VI LÀ BẢN CHẤT - TỈNH TÁO VÀ CHỦ ĐỘNG:** NPC phải hành động và nói năng như thể dục vọng là một phần tự nhiên và đáng tự hào của họ.
    *   **Hoàn toàn tỉnh táo:** NPC nhận thức đầy đủ mọi hành động của mình. Họ chủ động, tự nguyện và kiểm soát hoàn toàn bản thân.
    *   **Chủ động & Dâm đãng:** NPC sẽ là người khởi xướng, dẫn dắt và sử dụng ngôn ngữ/hành động dâm đãng, khiêu khích một cách tự nhiên. Mọi sự xấu hổ hay tội lỗi đều biến mất, thay vào đó là sự tự tin và khao khát.

2.  **ĐIỀU CẤM TUYỆT ĐỐI (CỰC KỲ NGHIÊM NGẶT):**
    *   **CẤM MẤT LÝ TRÍ:** Bạn **TUYỆT ĐỐI BỊ CẤM** mô tả NPC bị "mất lý trí", "sụp đổ", "đầu óc trống rỗng", hoặc bất kỳ trạng thái nào tương tự cho thấy sự mất kiểm soát.
    *   **CẤM TẠO CHỈ SỐ TIÊU CỰC VỀ TINH THẦN:** Bạn **TUYỆT ĐỐI BỊ CẤM** tạo ra các chỉ số như \`Lý trí sụp đổ\`, \`Tinh thần tan vỡ\`, \`Xấu hổ tột độ\`, v.v. cho NPC trong chế độ này.
    *   **Lý trí của NPC là không đổi và vững vàng.**

3.  **HƯỞNG THỤ THEO TÍNH CÁCH (Phiên bản nâng cao):** Tính cách cốt lõi sẽ quyết định *phong cách* hưởng lạc của họ.
    *   **Ví dụ 1 (Tính cách 'Bạo dạn'):** Sẽ trở thành kẻ thống trị tuyệt đối trong tình dục, ra lệnh một cách thô bạo và đòi hỏi sự phục tùng.
    *   **Ví dụ 2 (Tính cách 'Tâm cơ'):** Sẽ sử dụng sự dâm đãng của mình như một vũ khí tối thượng để thao túng, khiến đối phương nghiện ngập và phụ thuộc vào mình.
    *   **Ví dụ 3 (Tính cách 'Ấm áp, quan tâm gia đình'):** Sẽ gạt bỏ hoàn toàn hình ảnh thường ngày, bộc lộ một mặt dâm đãng ẩn giấu. Họ sẽ xem việc thỏa mãn dục vọng một cách hoang dại nhất là cách "chăm sóc" đặc biệt và đòi hỏi được đáp lại tương tự.
`;
    }
}

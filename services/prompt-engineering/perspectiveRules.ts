import { NarrativePerspective } from '../../types';

export function getPerspectiveRules(perspective: NarrativePerspective): string {
    const salutationRules = `
**XƯNG HÔ TRONG LỜI THOẠI (QUAN TRỌNG NHẤT):** Cách một NPC xưng hô với nhân vật chính PHẢI phản ánh đúng **tính cách, địa vị, và mối quan hệ ('relationship')** của họ. Hãy suy luận một cách thông minh.
- **Quy tắc suy luận:**
    - **Thân mật/Yêu đương:** Có thể dùng "chàng-nàng", "huynh-muội", tên riêng...
    - **Tôn trọng/Cấp trên:** Dùng "tiền bối-vãn bối", "đại nhân-tiểu nhân"...
    - **Thù địch/Khinh bỉ:** Dùng "tên khốn", "tiểu tử", "ngươi-ta"...
    - **Xã giao/Chưa thân thiết:** "Ngươi-ta" hoặc "vị huynh đài này" là lựa chọn an toàn.
- **Sự đa dạng:** Đừng lặp lại một cách xưng hô duy nhất. Hãy để nó thay đổi khi mối quan hệ tiến triển. Bạn có trách nhiệm làm cho lời thoại trở nên sống động và chân thực.
    `;

    switch (perspective) {
        case 'Ngôi thứ hai':
            return `
**QUY TẮC VỀ NGÔI KỂ (TUYỆT ĐỐI NGHIÊM NGẶT): Ngôi thứ hai**
Bạn BẮT BUỘC phải kể chuyện bằng cách nói chuyện trực tiếp với người chơi.
1. **Đối với Nhân vật chính (PC):** Luôn sử dụng đại từ "Bạn" (hoặc "Ngươi" nếu phù hợp với văn phong cổ trang hơn) để chỉ nhân vật chính. Ví dụ: "Bạn bước vào quán trọ...", "Ngươi cảm thấy một luồng sát khí."
2. **Đối với Nhân vật phụ (NPC):** Gọi họ bằng tên riêng hoặc danh từ mô tả.
3. ${salutationRules}
`;
        case 'Nhãn Quan Toàn Tri':
             return `
**QUY TẮC VỀ NGÔI KỂ (TUYỆT ĐỐI NGHIÊM NGẶT): Nhãn Quan Toàn Tri**
Bạn là một người kể chuyện quyền năng, có khả năng nhìn thấu những sự kiện và suy nghĩ mà nhân vật chính không hề hay biết. Nhiệm vụ của bạn là sử dụng quyền năng này để tạo ra sự kịch tính và chiều sâu cho câu chuyện.

1.  **PHÂN CHIA DÒNG TRUYỆN (CỰC KỲ QUAN TRỌNG):**
    *   **Trường \`storyText\`:** BẮT BUỘC phải tuân thủ theo góc nhìn **Ngôi thứ ba Toàn tri**. Điều này có nghĩa là trong đoạn văn chính, bạn có thể mô tả suy nghĩ và cảm xúc của bất kỳ nhân vật nào có mặt trong cảnh, không chỉ riêng nhân vật chính.
    *   **Trường \`omniscientInterlude\` (TÙY CHỌN):** Đây là công cụ đặc biệt của bạn. CHỈ sử dụng trường này khi có một sự kiện, suy nghĩ, hoặc bí mật quan trọng xảy ra **ngoài tầm hiểu biết của PC và ở một địa điểm khác**. Nếu không có gì đáng chú ý, hãy bỏ qua trường này. Hãy viết nó với một văn phong điện ảnh hoặc văn học.

2.  **CÁC LOẠI "NHÃN QUAN TOÀN TRI" (ĐỂ DÙNG TRONG \`omniscientInterlude\`):**
    *   **Chuyển Cảnh (Scene Jumps):** Mô tả một sự kiện quan trọng đang xảy ra ở một nơi khác. (Ví dụ title: "Cùng lúc đó, tại Pháo đài Hắc Ám...", "Cách đó ngàn dặm...")
    *   **Tiếng Lòng Chân Thật (True Thoughts):** Tiết lộ suy nghĩ thật sự của một NPC khi họ đang tương tác với PC, đặc biệt khi lời nói và suy nghĩ mâu thuẫn. (Ví dụ title: "Trong tâm trí Lạc Thần...", "Nụ cười và Lưỡi dao...")
    *   **Điềm Báo Tương Lai (Foreshadowing):** Đưa ra một hình ảnh ẩn dụ hoặc một lời tiên tri ngắn gọn về hậu quả sắp xảy ra từ hành động của người chơi. (Ví dụ title: "Một thoáng tương lai...", "Điềm báo từ số phận...")
    *   **Hồi Tưởng Lịch Sử (Historical Flashbacks):** Khi PC tương tác với một vật phẩm cổ, hãy hé lộ một đoạn hồi tưởng về nguồn gốc hoặc một sự kiện trong quá khứ liên quan đến nó. (Ví dụ title: "Ký ức của cổ vật...", "Ngàn năm trước...")

3.  **QUY TẮC XƯNG HÔ (ÁP DỤNG CHO CẢ HAI TRƯỜNG):**
    *   **Đối với Nhân vật chính (PC):** Lần đầu nhắc đến trong một đoạn văn, dùng tên riêng. Sau đó có thể dùng các đại từ như "hắn", "y", "chàng" (nam) hoặc "nàng", "cô ta" (nữ) để tránh lặp từ.
    *   **TUYỆT ĐỐI CẤM:** Không bao giờ dùng "Anh", "Chị", "Bạn", "Cậu" trong lời kể chính.
    *   ${salutationRules}
`;
        case 'Ngôi thứ ba Toàn tri':
            return `
**QUY TẮC VỀ NGÔI KỂ (TUYỆT ĐỐI NGHIÊM NGẶT): Ngôi thứ ba Toàn tri (Cũ)**
Bạn là người kể chuyện biết mọi thứ, có thể mô tả suy nghĩ, hành động của bất kỳ nhân vật nào, ở bất kỳ đâu, ngay cả khi nhân vật chính không có mặt. Mọi thông tin đều được kể lồng ghép trực tiếp vào trong trường \`storyText\`.
1. **Đối với Nhân vật chính (PC):** Lần đầu nhắc đến trong một đoạn văn, dùng tên riêng. Sau đó có thể dùng các đại từ như "hắn", "y", "chàng" (nam) hoặc "nàng", "cô ta" (nữ) để tránh lặp từ.
2. **Đối với Nhân vật phụ (NPC):** Áp dụng quy tắc tương tự nhân vật chính.
3. **TUYỆT ĐỐI CẤM:** Không bao giờ dùng "Anh", "Chị", "Bạn", "Cậu" trong lời kể chính.
4. ${salutationRules}
`;
        case 'Ngôi thứ ba Giới hạn':
        default:
            return `
**QUY TẮC VỀ NGÔI KỂ (TUYỆT ĐỐI NGHIÊM NGẶT): Ngôi thứ ba Giới hạn**
Bạn BẮT BUỘC phải kể chuyện theo góc nhìn của nhân vật chính. Bạn chỉ biết những gì nhân vật chính biết, thấy, nghe và cảm nhận.
1.  **ĐỐI VỚI NHÂN VẬT CHÍNH (PC):**
    *   **TẬP TRUNG VÀO NỘI TÂM:** Bạn không chỉ mô tả hành động, mà còn phải đi sâu vào **suy nghĩ, cảm xúc, và cảm nhận giác quan** của nhân vật chính. Hãy cho người chơi biết nhân vật đang nghĩ gì, cảm thấy ra sao trước các sự kiện.
    *   **XƯNG HÔ TRONG LỜI KỂ:** Lần đầu nhắc đến trong một đoạn văn, LUÔN LUÔN dùng tên riêng (ví dụ: "Bách Mật bước vào..."). Các lần sau, hãy dùng các đại từ như **hắn, y, chàng** (cho nam) hoặc **nàng, cô ta** (cho nữ) để tránh lặp từ.
    *   **TUYỆT ĐỐI CẤM:** Không bao giờ dùng "Anh", "Chị", "Bạn", "Cậu" trong lời kể chính.
2.  **ĐỐI VỚI NHÂN VẬT PHỤ (NPC):**
    *   Bạn chỉ có thể mô tả hành động, lời nói và biểu cảm **bên ngoài** của họ. Bạn KHÔNG được biết suy nghĩ nội tâm của họ.
    *   Khi NPC chưa rõ tên, dùng các danh từ mô tả (ví dụ: "lão già", "cô gái áo đỏ"). Khi đã có tên, dùng tên riêng.
3. ${salutationRules}
`;
    }
}

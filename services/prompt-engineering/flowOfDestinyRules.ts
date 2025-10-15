export function getFlowOfDestinyRules(shouldTrigger: boolean, choice: string): string {
    if (!shouldTrigger) {
        return '';
    }

    return `
---
**TẦNG 2.5: QUY TẮC DÒNG CHẢY VẬN MỆNH (ĐÃ KÍCH HOẠT)**
**BỐI CẢNH:** Một khoảng thời gian đã trôi qua. Trong khi nhân vật chính hành động, thế giới vẫn tiếp tục vận động. Quy tắc này GHI ĐÈ lên quy trình xử lý hành động thông thường của người chơi.

**NHIỆM VỤ CỦA BẠN (TUYỆT ĐỐI NGHIÊM NGẶT):**

1.  **MÔ PHỎNG SỰ KIỆN "NGOÀI MÀN HÌNH":**
    a.  Phân tích danh sách TOÀN BỘ NPC đã được cung cấp trong TẦNG 3 của bối cảnh.
    b.  Chọn ra 1 hoặc 2 NPC **KHÔNG có mặt** trong cảnh hiện tại.
    c.  Dựa trên tính cách, trạng thái và mục tiêu của họ, hãy mô phỏng một hành động quan trọng mà họ đã thực hiện trong thời gian này. (Ví dụ: một kẻ thù chiếm được một ngôi làng, một đồng minh tìm thấy manh mối...).
    d.  Tạo ra các \`NPCUpdate\` tương ứng để phản ánh những thay đổi logic này (thay đổi \`status\`, \`stats\`...).

2.  **TẠO SỰ KIỆN CAN THIỆP (GHI ĐÈ \`storyText\`):**
    a.  **Hành động của người chơi ("${choice}") đã bị gián đoạn.** Thay vì mô tả kết quả trực tiếp của nó, bạn BẮT BUỘC phải viết một đoạn \`storyText\` mới mô tả cách mà tin tức hoặc hậu quả của sự kiện "ngoài màn hình" **can thiệp trực tiếp** vào tình huống của nhân vật chính.
    b.  **Ví dụ về cách can thiệp:** Một người đưa tin hớt hải chạy vào; một con bồ câu đưa thư bay đến cửa sổ; tiếng chuông báo động của thành phố vang lên; nhân vật chính tình cờ nghe được một cuộc trò chuyện.
    c.  Đoạn văn này phải tạo ra một tình huống khẩn cấp hoặc một ngã rẽ cốt truyện mới.

3.  **TẠO LỰA CHỌN PHẢN ỨNG (GHI ĐÈ \`choices\`):**
    a.  4 lựa chọn trong trường \`choices\` BẮT BUỘC phải là các phản ứng trực tiếp đối với **sự kiện can thiệp** mà bạn vừa viết, KHÔNG phải là các lựa chọn liên quan đến hành động ban đầu của người chơi.
    b.  **Ví dụ:** Nếu tin tức là "một ngôi làng bị tấn công", các lựa chọn phải là: "Lập tức đến ngôi làng đó", "Tìm hiểu thêm thông tin", "Mặc kệ tin tức", v.v.

4.  **GHI LẠI SỰ KIỆN GỐC (\`omniscientInterlude\`):**
    a.  Tóm tắt lại sự kiện gốc "ngoài màn hình" mà bạn đã mô phỏng.
    b.  Đặt tóm tắt này vào trường \`omniscientInterlude\`.
    c.  Tiêu đề (\`title\`) của nó BẮT BUỘC phải là **"Dòng Chảy Vận Mệnh"**.
---
`;
}
import { WorldEvent } from '../../types';

export function getFlowOfDestinyRules(shouldTrigger: boolean, choice: string, worldEvent?: WorldEvent): string {
    if (!shouldTrigger || !worldEvent) {
        return '';
    }

    return `
---
**TẦNG 2.5: QUY TẮC DÒNG CHẢY VẬN MỆNH (ĐÃ KÍCH HOẠT)**
**BỐI CẢNH:** Một sự kiện quan trọng "ngoài màn hình" đã xảy ra và sẽ can thiệp vào hành động của người chơi. Quy tắc này GHI ĐÈ lên quy trình xử lý hành động thông thường.

**SỰ KIỆN CAN THIỆP (TỪ CLIENT):**
**Sự kiện:** ${worldEvent.description}
**Loại:** ${worldEvent.type}
${worldEvent.relatedEntityId ? `**Thực thể liên quan:** ${worldEvent.relatedEntityId}` : ''}

**NHIỆM VỤ CỦA BẠN (TUYỆT ĐỐI NGHIÊM NGẶT):**

1.  **TẠO SỰ KIỆN CAN THIỆP (GHI ĐÈ \`storyText\`):**
    a.  **Hành động của người chơi ("${choice}") đã bị gián đoạn.** Thay vì mô tả kết quả của nó, bạn BẮT BUỘC phải viết một đoạn \`storyText\` mới mô tả cách mà **SỰ KIỆN CAN THIỆP** trên **can thiệp trực tiếp** vào tình huống của nhân vật chính.
    b.  **Ví dụ về cách can thiệp:** Một người đưa tin hớt hải chạy vào và thông báo tin tức; một con bồ câu đưa thư mang theo thông điệp; tiếng chuông báo động vang lên vì sự kiện đó. Hãy sáng tạo nhưng phải hợp lý.
    c.  Đoạn văn này phải tạo ra một tình huống khẩn cấp hoặc một ngã rẽ cốt truyện mới dựa trên sự kiện đã cho.

2.  **TẠO LỰA CHỌN PHẢN ỨNG (GHI ĐÈ \`choices\`):**
    a.  4 lựa chọn trong trường \`choices\` BẮT BUỘC phải là các phản ứng trực tiếp đối với **sự kiện can thiệp** mà bạn vừa viết, KHÔNG phải là các lựa chọn liên quan đến hành động ban đầu của người chơi.
    b.  **Ví dụ:** Nếu sự kiện là "Có tin tức về ${worldEvent.relatedEntityId}: đã chiếm được một ngôi làng", các lựa chọn phải là: "Lập tức đến ngôi làng đó", "Tìm hiểu thêm thông tin", "Mặc kệ tin tức", v.v.

3.  **GHI LẠI SỰ KIỆN GỐC (\`omniscientInterlude\`):**
    a.  Tóm tắt lại **SỰ KIỆN CAN THIỆP** đã cho.
    b.  Đặt tóm tắt này vào trường \`omniscientInterlude\`.
    c.  Tiêu đề (\`title\`) của nó BẮT BUỘC phải là **"Dòng Chảy Vận Mệnh"**.

**QUAN TRỌNG:** Bạn không cần phải tự mô phỏng sự kiện "ngoài màn hình" nữa. Hãy sử dụng sự kiện đã được cung cấp.
---
`;
}

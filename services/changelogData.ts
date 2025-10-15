export interface ChangelogVersion {
  version: string;
  date: string;
  notes: string[];
}

export const LATEST_VERSION_NAME = "Ver 1.2";

export const changelogHistory: ChangelogVersion[] = [
   {version: "Version v1.2",
    date: "30/9",
    notes: [
      "ĐẶC BIỆT:",
      "Cơ chế CHIẾN ĐẤU turnbase và TU LUYỆN giờ đây sẽ hoàn toàn do client đảm nhận 100% không gây trễ xử lí",
      "Trang bị và hiệu ứng của trang bị sẽ do client đảm hiệu và đồng bộ với AI, đảm bảo trang bị được áp dụng đúng 100% cơ chế combat",
      "Thêm hiệu ứng Bộ Trang Bị, có thể đạt được các hiệu ứng đặc biệt nếu full bộ trang bị cùng set",
      "Thêm 225 trang bị khác nhau với các hiệu ứng, chỉ số, cơ chế 100% do client đảm nhiệm khi xuất hiện",
      "Kỹ năng giờ đây sẽ được dữ liệu hóa, đảm bảo AI không 'xàm' khi ứng dụng kỹ năng",
      "DO ĐÃ GIAO GẦN NHƯ 50% CÔNG VIỆC MÀ AI TỪNG ĐẢM NHẬN CHO CLIENT, NÊN ĐÃ TỐI ƯU HÓA ĐƯỢC LƯỢNG TIÊU TỐN SAU MỖI LƯỢT VÀ LOẠI BỎ RẤT NHIỀU ĐỘ TRỄ. GIÚP GIẢI THOÁT AI KHI PHẢI LÀM QUÁ NHIỀU THỨ"
    ]},
   {version: "Version v1.0.1",
    date: "20/9",
    notes: [
      "THÊM & Sửa Đổi Bổ Sung:",
      "Hệ thống giới Cửu giai - Tam tầng",
      "Chức năng luật sáng thế, nhắc nhở AI về tri thức thế giới",
      "Chuyển chức năng thanh TL, xóa bỏ thanh CUM",
      "ĐÃ FIX:",
      "Trạng Thái không đồng nhất với Cảnh Giới nhân vật",
      "Chỉ số không tăng khi lên cấp",
      "Game khởi tạo hai lần gây sai cốt tryện",
      "TỐI ƯU:",
      "Trạng thái nhân vật sẽ cập nhật hoặc biến đổi thay vì tạo mới tương tự"
    ]},
   {version: "Version v1.0",
    date: "17/9",
    notes: [
      "THÊM:",
      "Chỉ Số cơ bản HP MP ATK & bỗ trợ AGI DEF MDEF CDR CRIT CDMG",
      "Chiến đấu Turnbase với giao diện RPG riêng",
      "Hệ thống cảnh giới Tam tầng, với giao diện tu luyện realtime",
      "Ngày, giờ, phút",
      "Sáng tạo thực thể ban đầu:",
      "+ Thế thực khởi đầu: mỗi thực thể sẽ có 9 mục cần thiết lập khác nhau đảm bảo cụ thể mô tả.",
      "+ NPC khởi đầu: mỗi npc sẽ có 9 mục cần thiết lập khác nhau đảm bảo cụ thể mô tả.",
      "Tương tác và phát hiện NPC trong tầm mắt",
      "Mô tả trực quan cho NPC",
      "Thêm giao diện trong bị & túi đồ trực quan",
      "TỐI ƯU:",
      "NSFW trở nên trực quan hơn",
      "Giao diện người dùng thân thiện",
      "Trạng thái nhân vật, tránh tràng tag"
    ]},
];

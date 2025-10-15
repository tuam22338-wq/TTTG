import { CustomAttributeDefinition, AttributeType } from '../types';

export interface AttributeTemplate {
  id: string;
  name: string;
  description: string;
  attributes: CustomAttributeDefinition[];
}

// Stats that are truly universal to almost any character-based game
const trulyCoreStats: CustomAttributeDefinition[] = [
    { id: 'sinhLucToiDa', name: 'Sinh Lực Tối đa', description: 'Điểm sinh mệnh tối đa của nhân vật.', type: AttributeType.VITAL, icon: 'heart', baseValue: 100, isDefault: true, links: [] },
    { id: 'theLucToiDa', name: 'Thể Lực Tối đa', description: 'Năng lượng dùng cho các hành động thể chất.', type: AttributeType.VITAL, icon: 'lightning', baseValue: 100, isDefault: true, links: [] },
    { id: 'doNoToiDa', name: 'Độ No Tối đa', description: 'Mức độ no tối đa mà nhân vật có thể đạt được.', type: AttributeType.VITAL, icon: 'food', baseValue: 100, isDefault: true, links: [] },
    { id: 'doNuocToiDa', name: 'Độ Nước Tối đa', description: 'Mức độ đủ nước tối đa của nhân vật. 100% là đủ, 0% là cực kỳ khát.', type: AttributeType.VITAL, icon: 'water_bottle', baseValue: 100, isDefault: true, links: [] },
    { id: 'congKich', name: 'Công Kích', description: 'Sát thương vật lý cơ bản.', type: AttributeType.PRIMARY, icon: 'sword', baseValue: 10, isDefault: true, links: [] },
    { id: 'phongNgu', name: 'Phòng Ngự', description: 'Khả năng chống chịu sát thương vật lý.', type: AttributeType.PRIMARY, icon: 'shield', baseValue: 5, isDefault: true, links: [] },
    { id: 'khangPhep', name: 'Kháng Phép', description: 'Khả năng chống chịu sát thương phép.', type: AttributeType.PRIMARY, icon: 'magic_shield', baseValue: 5, isDefault: true, links: [] },
    { id: 'thanPhap', name: 'Thân Pháp', description: 'Tốc độ, sự nhanh nhẹn, ảnh hưởng đến thứ tự hành động.', type: AttributeType.PRIMARY, icon: 'wing', baseValue: 10, isDefault: true, links: [] },
    { id: 'chiMang', name: 'Tỉ lệ Chí mạng', description: 'Cơ hội gây sát thương chí mạng (giá trị 0.05 = 5%).', type: AttributeType.PRIMARY, icon: 'target', baseValue: 0.05, isDefault: true, links: [] },
    { id: 'satThuongChiMang', name: 'ST Chí mạng', description: 'Bội số sát thương khi chí mạng (giá trị 1.5 = 150%).', type: AttributeType.PRIMARY, icon: 'explosion', baseValue: 1.5, isDefault: true, links: [] },
    { id: 'giamHoiChieu', name: 'Giảm Hồi chiêu', description: 'Tỉ lệ giảm thời gian hồi kỹ năng (giá trị 0.1 = 10%).', type: AttributeType.PRIMARY, icon: 'hourglass', baseValue: 0, isDefault: true, links: [] },
];

// Stats specific to magic/cultivation systems
const magicCoreStats: CustomAttributeDefinition[] = [
    { id: 'linhLucToiDa', name: 'Linh Lực Tối đa', description: 'Năng lượng dùng để thi triển kỹ năng.', type: AttributeType.VITAL, icon: 'droplet', baseValue: 50, isDefault: true, links: [] },
];

export const genericDefaultTemplate: AttributeTemplate = {
  id: 'generic_default',
  name: 'Mặc Định Chung',
  description: 'Một hệ thống thuộc tính cơ bản và linh hoạt, phù hợp cho mọi loại thế giới.',
  attributes: [
    ...trulyCoreStats,
    { id: 'tien_te', name: 'Tiền Tệ', description: 'Đơn vị tiền tệ chính được sử dụng trong thế giới.', type: AttributeType.INFORMATIONAL, icon: 'money', baseValue: 100, isDefault: false, links: [] },
    { id: 'danh_vong', name: 'Danh Vọng', description: 'Thước đo danh tiếng và uy tín của nhân vật trong mắt người khác.', type: AttributeType.INFORMATIONAL, icon: 'star', baseValue: 0, isDefault: false, links: [] },
    { id: 'toi_ac', name: 'Giá trị Tội ác', description: 'Đo lường các hành vi xấu xa của nhân vật. Càng cao càng dễ bị truy nã.', type: AttributeType.INFORMATIONAL, icon: 'skull', baseValue: 0, isDefault: false, links: [] },
    { id: 'van_khi', name: 'Vận Khí', description: 'Chỉ số ẩn, đại diện cho may mắn và cơ duyên của nhân vật.', type: AttributeType.HIDDEN, icon: 'yin_yang', baseValue: 50, isDefault: false, links: [] },
  ],
};


export const classicXianxiaTemplate: AttributeTemplate = {
  id: 'classic_xianxia',
  name: 'Tu Tiên Cổ Điển',
  description: 'Hệ thống thuộc tính tiêu chuẩn cho thế giới tiên hiệp, tập trung vào tiền tệ, danh vọng và các yếu tố ẩn.',
  attributes: [
    ...trulyCoreStats,
    ...magicCoreStats,
    { id: 'linh_thach', name: 'Linh Thạch', description: 'Đơn vị tiền tệ chính trong giới tu tiên, chứa đựng linh khí tinh thuần.', type: AttributeType.INFORMATIONAL, icon: 'gem', baseValue: 100, isDefault: false, links: [] },
    { id: 'cong_hien', name: 'Điểm Cống Hiến', description: 'Điểm nhận được khi hoàn thành nhiệm vụ cho tông môn, dùng để đổi vật phẩm.', type: AttributeType.INFORMATIONAL, icon: 'scroll', baseValue: 0, isDefault: false, links: [] },
    { id: 'sat_khi', name: 'Sát Khí', description: 'Sát khí toát ra từ nhân vật, ảnh hưởng đến cách người khác phản ứng.', type: AttributeType.INFORMATIONAL, icon: 'aura', baseValue: 0, isDefault: false, links: [] },
    { id: 'thien_co', name: 'Thiên Cơ', description: 'Một chỉ số ẩn, đại diện cho nghiệp lực và sự ưu ái của thiên đạo.', type: AttributeType.HIDDEN, icon: 'yin_yang', baseValue: 0, isDefault: false, links: [] },
  ],
};

export const demonicCultivationTemplate: AttributeTemplate = {
  id: 'demonic_cultivation',
  name: 'Ma Đạo Tu Luyện',
  description: 'Hệ thống thuộc tính dành cho con đường ma tu, tập trung vào sức mạnh hắc ám và sự tàn bạo.',
  attributes: [
    ...trulyCoreStats,
    ...magicCoreStats,
    { id: 'huyet_tinh', name: 'Huyết Tinh', description: 'Nguồn năng lượng thu được từ việc hấp thụ sinh mệnh, dùng để thi triển ma công.', type: AttributeType.INFORMATIONAL, icon: 'blood', baseValue: 0, isDefault: false, links: [] },
    { id: 'oan_khi', name: 'Oán Khí', description: 'Tích tụ từ việc tàn sát sinh linh, càng nhiều càng khiến người khác sợ hãi nhưng dễ bị tâm ma xâm chiếm.', type: AttributeType.INFORMATIONAL, icon: 'ghost', baseValue: 0, isDefault: false, links: [] },
    { id: 'ma_mon_cong_hien', name: 'Ma Môn Cống Hiến', description: 'Điểm cống hiến cho thế lực ma đạo, dùng để đổi lấy ma công và ma khí.', type: AttributeType.INFORMATIONAL, icon: 'demon_gate', baseValue: 0, isDefault: false, links: [] },
    { id: 'hung_danh', name: 'Hung Danh', description: 'Danh tiếng tàn ác trong giang hồ, khiến kẻ yếu khiếp sợ và chính đạo truy lùng.', type: AttributeType.INFORMATIONAL, icon: 'skull', baseValue: 0, isDefault: false, links: [] },
    { id: 'ma_duyen', name: 'Ma Duyên', description: 'Chỉ số ẩn quyết định cơ duyên với các truyền thừa và bảo vật ma đạo.', type: AttributeType.HIDDEN, icon: 'spider_web', baseValue: 0, isDefault: false, links: [] },
  ],
};

export const sectManagementTemplate: AttributeTemplate = {
  id: 'sect_management',
  name: 'Quản Lý Tông Môn',
  description: 'Hệ thống thuộc tính dành cho người lãnh đạo một thế lực, tập trung vào kinh tế và quản lý.',
  attributes: [
    ...trulyCoreStats,
    { id: 'ngan_luong', name: 'Ngân Lượng', description: 'Tiền tệ thông thường trong thế giới phàm tục, dùng để chi trả các hoạt động cơ bản.', type: AttributeType.INFORMATIONAL, icon: 'coin_pouch', baseValue: 1000, isDefault: false, links: [] },
    { id: 'luong_thuc', name: 'Lương Thực', description: 'Tài nguyên cần thiết để duy trì hoạt động của đệ tử và quân đội.', type: AttributeType.INFORMATIONAL, icon: 'grain', baseValue: 500, isDefault: false, links: [] },
    { id: 'binh_luc', name: 'Binh Lực', description: 'Số lượng và sức mạnh của quân đội hoặc đệ tử có thể chiến đấu.', type: AttributeType.INFORMATIONAL, icon: 'barracks', baseValue: 100, isDefault: false, links: [] },
    { id: 'dan_tam', name: 'Dân Tâm', description: 'Sự ủng hộ và trung thành của người dân hoặc thành viên trong thế lực.', type: AttributeType.INFORMATIONAL, icon: 'heart_handshake', baseValue: 50, isDefault: false, links: [] },
    { id: 'uy_tin_hoang_gia', name: 'Uy Tín Hoàng Gia', description: 'Mức độ tín nhiệm và mối quan hệ với triều đình hoặc các thế lực lớn khác.', type: AttributeType.INFORMATIONAL, icon: 'crown', baseValue: 0, isDefault: false, links: [] },
  ],
};

export const postApocalypticTemplate: AttributeTemplate = {
  id: 'post_apocalyptic',
  name: 'Sinh Tồn Tận Thế',
  description: 'Hệ thống thuộc tính cho bối cảnh hậu tận thế, tập trung vào các tài nguyên sinh tồn thiết yếu.',
  attributes: [
    ...trulyCoreStats,
    { id: 'nap_chai', name: 'Nắp Chai', description: 'Đơn vị tiền tệ phổ biến trong các khu định cư.', type: AttributeType.INFORMATIONAL, icon: 'bottle_cap', baseValue: 50, isDefault: false, links: [] },
    { id: 'nhiem_xa', name: 'Mức Độ Nhiễm Xạ', description: 'Chỉ số đo lường lượng phóng xạ trong cơ thể. Càng cao càng nguy hiểm.', type: AttributeType.INFORMATIONAL, icon: 'radiation', baseValue: 0, isDefault: false, links: [] },
    { id: 'phe_lieu', name: 'Phế Liệu', description: 'Vật liệu dùng để chế tạo và sửa chữa trang bị.', type: AttributeType.INFORMATIONAL, icon: 'gears', baseValue: 20, isDefault: false, links: [] },
    { id: 'dan_duoc', name: 'Đạn Dược', description: 'Số lượng đạn dược sở hữu cho các loại vũ khí.', type: AttributeType.INFORMATIONAL, icon: 'bullet', baseValue: 30, isDefault: false, links: [] },
    { id: 'tin_nhiem_phe_phai', name: 'Tín Nhiệm Phe Phái', description: 'Danh tiếng của bạn với một phe phái cụ thể trong vùng đất hoang.', type: AttributeType.INFORMATIONAL, icon: 'handshake', baseValue: 0, isDefault: false, links: [] },
  ],
};

export const urbanFantasyTemplate: AttributeTemplate = {
  id: 'urban_fantasy',
  name: 'Huyền Huyễn Đô Thị',
  description: 'Hệ thống thuộc tính cho bối cảnh hiện đại pha trộn yếu tố siêu nhiên và ma pháp.',
  attributes: [
    ...trulyCoreStats,
    ...magicCoreStats,
    { id: 'tien_te', name: 'Tiền Tệ', description: 'Tiền bạc trong xã hội hiện đại, dùng cho các giao dịch thông thường.', type: AttributeType.INFORMATIONAL, icon: 'money', baseValue: 5000, isDefault: false, links: [] },
    { id: 'linh_luc_do_thi', name: 'Linh Lực Đô Thị', description: 'Năng lượng siêu nhiên hấp thụ từ môi trường thành phố, dùng cho dị năng.', type: AttributeType.INFORMATIONAL, icon: 'cityscape', baseValue: 100, isDefault: false, links: [] },
    { id: 'mang_luoi_quan_he', name: 'Mạng Lưới Quan Hệ', description: 'Mức độ ảnh hưởng và các mối quan hệ với những nhân vật quan trọng trong thành phố.', type: AttributeType.INFORMATIONAL, icon: 'network', baseValue: 0, isDefault: false, links: [] },
    { id: 'danh_tieng_ngam', name: 'Danh Tiếng Ngầm', description: 'Uy tín trong thế giới ngầm của những người sở hữu dị năng.', type: AttributeType.INFORMATIONAL, icon: 'mask', baseValue: 0, isDefault: false, links: [] },
    { id: 'di_nang_chi_so', name: 'Chỉ Số Dị Năng', description: 'Chỉ số ẩn đại diện cho tiềm năng phát triển sức mạnh siêu nhiên của bạn.', type: AttributeType.HIDDEN, icon: 'spark', baseValue: 10, isDefault: false, links: [] },
  ],
};

export const allAttributeTemplates: AttributeTemplate[] = [
  genericDefaultTemplate,
  classicXianxiaTemplate,
  demonicCultivationTemplate,
  sectManagementTemplate,
  postApocalypticTemplate,
  urbanFantasyTemplate,
];
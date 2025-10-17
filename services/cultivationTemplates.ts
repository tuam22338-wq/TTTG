import { CultivationSystemSettings } from '../types';

export interface CultivationTemplate {
  id: string;
  name: string;
  system: CultivationSystemSettings;
}

const subTiers4 = [
    { id: 'sub_1', name: 'Sơ Kỳ', statBonuses: [] },
    { id: 'sub_2', name: 'Trung Kỳ', statBonuses: [] },
    { id: 'sub_3', name: 'Hậu Kỳ', statBonuses: [] },
    { id: 'sub_4', name: 'Đỉnh Phong', statBonuses: [] },
];

export const classicXianxiaTemplate: CultivationTemplate = {
  id: 'classic_xianxia',
  name: 'Tu Tiên Cổ Điển',
  system: {
    systemName: 'Hệ Thống Tu Tiên',
    resourceName: 'Linh Khí',
    unitName: 'năm',
    description: 'Con đường tu tiên cổ điển, hấp thụ linh khí đất trời để trường sinh và đạt được sức mạnh vô thượng.',
    mainTiers: [
        { id: 'main_1', name: 'Luyện Khí', description: 'Giai đoạn đầu tiên, cảm nhận và hấp thụ linh khí.', breakthroughRequirement: 'Tích lũy đủ linh khí để ngưng tụ thành dịch.', subTiers: JSON.parse(JSON.stringify(subTiers4)), statBonuses: [{ stat: 'linhLucToiDa', value: 50 }] },
        { id: 'main_2', name: 'Trúc Cơ', description: 'Xây dựng nền tảng đạo cơ vững chắc.', breakthroughRequirement: 'Đạo cơ viên mãn, kết thành Kim Đan.', subTiers: JSON.parse(JSON.stringify(subTiers4)), statBonuses: [{ stat: 'congKich', value: 10 }, { stat: 'phongNgu', value: 5 }] },
        { id: 'main_3', name: 'Kim Đan', description: 'Ngưng tụ toàn bộ linh khí thành một viên kim đan.', breakthroughRequirement: 'Phá đan thành anh.', subTiers: JSON.parse(JSON.stringify(subTiers4)), statBonuses: [{ stat: 'linhLucToiDa', value: 200 }, { stat: 'khangPhep', value: 10 }] },
        { id: 'main_4', name: 'Nguyên Anh', description: 'Linh hồn và kim đan hợp nhất, tạo ra Nguyên Anh bất diệt.', breakthroughRequirement: 'Nguyên Anh và thân thể hợp nhất, lĩnh ngộ sức mạnh không gian.', subTiers: JSON.parse(JSON.stringify(subTiers4)), statBonuses: [{ stat: 'thanPhap', value: 20 }] },
        { id: 'main_5', name: 'Hóa Thần', description: 'Lĩnh ngộ quy tắc, bắt đầu dung hợp với thiên địa.', breakthroughRequirement: 'Vượt qua thiên kiếp, phi thăng.', subTiers: JSON.parse(JSON.stringify(subTiers4)), statBonuses: [{ stat: 'satThuongChiMang', value: 0.25 }] },
    ]
  }
};

export const demonicCultivationTemplate: CultivationTemplate = {
  id: 'demonic_cultivation',
  name: 'Ma Đạo Tu Luyện',
  system: {
    systemName: 'Hệ Thống Ma Tu',
    resourceName: 'Ma Khí',
    unitName: 'năm',
    description: 'Con đường tu luyện tà đạo, sử dụng ma khí để cường hóa bản thân, sức mạnh tăng tiến nhanh chóng nhưng đầy rẫy nguy hiểm.',
    mainTiers: [
        { id: 'main_1', name: 'Luyện Thể', description: 'Dùng ma khí rèn luyện thân thể.', breakthroughRequirement: 'Thân thể đạt tới giới hạn, ma khí bắt đầu dung hợp.', subTiers: JSON.parse(JSON.stringify(subTiers4)), statBonuses: [{ stat: 'sinhLucToiDa', value: 50 }, { stat: 'phongNgu', value: 5 }] },
        { id: 'main_2', name: 'Ma Thể', description: 'Thân thể được ma hóa, sức mạnh và sức chịu đựng tăng vọt.', breakthroughRequirement: 'Ngưng tụ ma khí thành Ma Đan.', subTiers: JSON.parse(JSON.stringify(subTiers4)), statBonuses: [{ stat: 'congKich', value: 15 }, { stat: 'sinhLucToiDa', value: 100 }] },
        { id: 'main_3', name: 'Ma Đan', description: 'Hạt nhân sức mạnh của ma tu, chứa đựng ma khí tinh thuần.', breakthroughRequirement: 'Phá đan thành ma anh.', subTiers: JSON.parse(JSON.stringify(subTiers4)), statBonuses: [{ stat: 'congKich', value: 25 }] },
        { id: 'main_4', name: 'Ma Anh', description: 'Hình thái linh hồn của ma tu, có thể thoát ly thể xác.', breakthroughRequirement: 'Ma Anh dung hợp với ma khí của trời đất.', subTiers: JSON.parse(JSON.stringify(subTiers4)), statBonuses: [{ stat: 'satThuongChiMang', value: 0.5 }] },
        { id: 'main_5', name: 'Ma Thần', description: 'Trở thành một vị ma thần thực thụ, nắm giữ quy tắc hắc ám.', breakthroughRequirement: 'Trở thành chúa tể của ma giới.', subTiers: JSON.parse(JSON.stringify(subTiers4)), statBonuses: [{ stat: 'congKich', value: 100 }] },
    ]
  }
};

export const bodyTemperingTemplate: CultivationTemplate = {
  id: 'body_tempering',
  name: 'Luyện Thể Phàm Nhân',
  system: {
    systemName: 'Hệ Thống Luyện Thể',
    resourceName: 'Khí Huyết',
    unitName: 'vòng',
    description: 'Con đường của phàm nhân, không dựa vào linh khí mà rèn luyện thân thể đến cực hạn, lấy sức mạnh cơ bắp để đối chọi với thần tiên.',
    mainTiers: [
        { id: 'main_1', name: 'Luyện Bì', description: 'Rèn luyện da thịt để trở nên cứng cáp.', breakthroughRequirement: 'Da cứng như sắt.', subTiers: JSON.parse(JSON.stringify(subTiers4)), statBonuses: [{ stat: 'phongNgu', value: 10 }] },
        { id: 'main_2', name: 'Luyện Nhục', description: 'Phát triển cơ bắp, tăng cường sức mạnh.', breakthroughRequirement: 'Sức mạnh có thể nhấc bổng ngàn cân.', subTiers: JSON.parse(JSON.stringify(subTiers4)), statBonuses: [{ stat: 'congKich', value: 10 }, { stat: 'theLucToiDa', value: 50 }] },
        { id: 'main_3', name: 'Luyện Cốt', description: 'Rèn luyện xương cốt để trở nên cứng như thép.', breakthroughRequirement: 'Xương cốt không thể bị phá hủy.', subTiers: JSON.parse(JSON.stringify(subTiers4)), statBonuses: [{ stat: 'sinhLucToiDa', value: 150 }, { stat: 'phongNgu', value: 15 }] },
        { id: 'main_4', name: 'Luyện Tạng', description: 'Cường hóa nội tạng, tăng cường sức sống.', breakthroughRequirement: 'Nội tạng hoạt động không ngừng nghỉ.', subTiers: JSON.parse(JSON.stringify(subTiers4)), statBonuses: [{ stat: 'sinhLucToiDa', value: 200 }, { stat: 'theLucToiDa', value: 100 }] },
        { id: 'main_5', name: 'Luyện Tủy', description: 'Thay đổi tủy xương, tái sinh và hồi phục cực nhanh.', breakthroughRequirement: 'Đạt tới cảnh giới thân thể bất hoại.', subTiers: JSON.parse(JSON.stringify(subTiers4)), statBonuses: [{ stat: 'sinhLucToiDa', value: 500 }] },
    ]
  }
};

export const spiritMasterTemplate: CultivationTemplate = {
  id: 'spirit_master',
  name: 'Hồn Sư Đại Lục',
  system: {
    systemName: 'Hệ Thống Hồn Sư',
    resourceName: 'Hồn Lực',
    unitName: 'cấp',
    description: 'Hệ thống tu luyện dựa trên việc hấp thụ hồn hoàn từ các hồn thú để nhận được kỹ năng và tăng cấp hồn lực.',
    mainTiers: [
        { id: 'main_1', name: 'Hồn Sĩ', description: 'Cấp bậc khởi đầu của Hồn Sư.', breakthroughRequirement: 'Đạt cấp 10 và hấp thụ Hồn Hoàn đầu tiên.', subTiers: Array.from({ length: 10 }, (_, i) => ({ id: `sub_1_${i}`, name: `Cấp ${i + 1}`, statBonuses: [{ stat: 'linhLucToiDa', value: 5 }] })), statBonuses: [] },
        { id: 'main_2', name: 'Hồn Sư', description: 'Chính thức bước vào con đường Hồn Sư.', breakthroughRequirement: 'Đạt cấp 20 và hấp thụ Hồn Hoàn thứ hai.', subTiers: Array.from({ length: 10 }, (_, i) => ({ id: `sub_2_${i}`, name: `Cấp ${i + 11}`, statBonuses: [{ stat: 'linhLucToiDa', value: 8 }] })), statBonuses: [] },
        { id: 'main_3', name: 'Đại Hồn Sư', description: 'Có được vị thế nhất định trong giới Hồn Sư.', breakthroughRequirement: 'Đạt cấp 30 và hấp thụ Hồn Hoàn thứ ba.', subTiers: Array.from({ length: 10 }, (_, i) => ({ id: `sub_3_${i}`, name: `Cấp ${i + 21}`, statBonuses: [{ stat: 'linhLucToiDa', value: 12 }] })), statBonuses: [{ stat: 'thanPhap', value: 10 }] },
        { id: 'main_4', name: 'Hồn Tông', description: 'Một cường giả được nhiều người kính nể.', breakthroughRequirement: 'Đạt cấp 40 và hấp thụ Hồn Hoàn thứ tư.', subTiers: Array.from({ length: 10 }, (_, i) => ({ id: `sub_4_${i}`, name: `Cấp ${i + 31}`, statBonuses: [{ stat: 'linhLucToiDa', value: 15 }] })), statBonuses: [{ stat: 'congKich', value: 10 }] },
        { id: 'main_5', name: 'Hồn Vương', description: 'Bá chủ một phương, có sức ảnh hưởng lớn.', breakthroughRequirement: 'Đạt cấp 50 và hấp thụ Hồn Hoàn thứ năm.', subTiers: Array.from({ length: 10 }, (_, i) => ({ id: `sub_5_${i}`, name: `Cấp ${i + 41}`, statBonuses: [{ stat: 'linhLucToiDa', value: 20 }] })), statBonuses: [{ stat: 'thanPhap', value: 15 }] },
    ]
  }
};

const subTiers3 = [
    { id: 'sub_1', name: 'Sơ Giai', statBonuses: [] },
    { id: 'sub_2', name: 'Trung Giai', statBonuses: [] },
    { id: 'sub_3', name: 'Hậu Giai', statBonuses: [] },
];

export const martialEmperorTemplate: CultivationTemplate = {
  id: 'martial_emperor',
  name: 'Cửu Thiên Đế Vương (Võ Đạo)',
  system: {
    systemName: 'Hệ Thống Võ Đạo',
    resourceName: 'Nguyên Lực',
    unitName: 'cấp',
    description: 'Con đường võ đạo chí tôn, rèn luyện nguyên lực, vượt qua chín tầng trời để trở thành Đế Vương.',
    mainTiers: [
        { id: 'main_1', name: 'Võ Giả', description: 'Bước đầu võ đạo, rèn luyện khí lực.', breakthroughRequirement: 'Nguyên lực hóa hình.', subTiers: JSON.parse(JSON.stringify(subTiers3)), statBonuses: [{ stat: 'congKich', value: 5 }] },
        { id: 'main_2', name: 'Võ Sư', description: 'Sử dụng nguyên lực thành thạo.', breakthroughRequirement: 'Nguyên lực ngoại phóng.', subTiers: JSON.parse(JSON.stringify(subTiers3)), statBonuses: [{ stat: 'congKich', value: 10 }, { stat: 'phongNgu', value: 5 }] },
        { id: 'main_3', name: 'Võ Vương', description: 'Nguyên lực hóa cánh, có thể phi hành.', breakthroughRequirement: 'Ngưng tụ Võ Hồn.', subTiers: JSON.parse(JSON.stringify(subTiers3)), statBonuses: [{ stat: 'thanPhap', value: 10 }] },
        { id: 'main_4', name: 'Võ Hoàng', description: 'Võ Hồn thực chất, sức mạnh kinh người.', breakthroughRequirement: 'Lĩnh ngộ ý cảnh.', subTiers: JSON.parse(JSON.stringify(subTiers3)), statBonuses: [{ stat: 'congKich', value: 20 }, { stat: 'khangPhep', value: 10 }] },
        { id: 'main_5', name: 'Võ Tông', description: 'Dung hợp ý cảnh, tạo ra lĩnh vực.', breakthroughRequirement: 'Chưởng khống không gian.', subTiers: JSON.parse(JSON.stringify(subTiers3)), statBonuses: [{ stat: 'chiMang', value: 0.05 }] },
        { id: 'main_6', name: 'Võ Tôn', description: 'Chưởng khống không gian, đi lại giữa các vết nứt.', breakthroughRequirement: 'Chạm tới quy tắc.', subTiers: JSON.parse(JSON.stringify(subTiers3)), statBonuses: [{ stat: 'satThuongChiMang', value: 0.1 }] },
        { id: 'main_7', name: 'Võ Thánh', description: 'Lấy quy tắc làm sức mạnh của bản thân.', breakthroughRequirement: 'Thân thể thánh hóa.', subTiers: JSON.parse(JSON.stringify(subTiers3)), statBonuses: [{ stat: 'phongNgu', value: 50 }, { stat: 'khangPhep', value: 50 }] },
        { id: 'main_8', name: 'Võ Đế', description: 'Đỉnh cao võ đạo, một ý niệm có thể hủy diệt tinh辰.', breakthroughRequirement: 'Vấn đỉnh Cửu Thiên.', subTiers: JSON.parse(JSON.stringify(subTiers3)), statBonuses: [{ stat: 'congKich', value: 100 }] },
    ]
  }
};


export const allCultivationTemplates: CultivationTemplate[] = [
  classicXianxiaTemplate,
  demonicCultivationTemplate,
  bodyTemperingTemplate,
  spiritMasterTemplate,
  martialEmperorTemplate,
];

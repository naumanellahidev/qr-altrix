import type { GuideCopy, GuideSlug } from '@/content/schema';

export const guides: Record<GuideSlug, GuideCopy> = {
  'how-to-create-a-qr-code': {
    title: 'Cách tạo mã QR miễn phí – Hướng dẫn từng bước',
    description: 'Tìm hiểu cách tạo mã QR trong chưa đầy một phút: chọn loại, thêm nội dung, thiết kế, thử và in. Miễn phí, mã tĩnh không cần đăng ký.',
    h1: 'Cách tạo mã QR',
    name: 'Cách tạo mã QR',
    intro: 'Tạo một mã QR mất chưa đầy một phút. Tạo một mã luôn quét được, trông đẹp và vẫn hoạt động sau một năm thì cần thêm vài quyết định. Hướng dẫn này nói về cả hai.',
    sections: [
      {
        heading: '1. Quyết định: tĩnh hay động',
        body: [
          'Mã tĩnh lưu nội dung ngay trong họa tiết. Hoạt động mãi mãi và ngoại tuyến, nhưng không thể sửa hay theo dõi. Dùng cho Wi-Fi, thẻ liên hệ và liên kết sẽ không bao giờ thay đổi.',
          'Mã động lưu một liên kết ngắn do bạn kiểm soát. Bạn có thể đổi đích đến sau khi in và xem mọi lượt quét. Dùng cho mọi thứ in số lượng lớn hoặc dùng cho tiếp thị.',
        ],
      },
      {
        heading: '2. Chọn loại',
        body: [
          'Chọn điều sẽ xảy ra khi quét: mở website, kết nối Wi-Fi, lưu liên hệ, hiển thị thực đơn, phát video. Loại phù hợp giúp mọi người nhận đúng thứ họ mong đợi.',
        ],
      },
      {
        heading: '3. Thêm nội dung',
        body: [
          'Nhập liên kết, thông tin mạng hoặc văn bản. Giữ ngắn gọn: ít nội dung hơn nghĩa là họa tiết đơn giản hơn, quét nhanh hơn. Với mã động, họa tiết luôn đơn giản dù đích đến là gì.',
        ],
      },
      {
        heading: '4. Thiết kế',
        body: [
          'Chọn màu sắc, kiểu họa tiết, hình dạng góc, logo và khung có lời kêu gọi như “Quét để xem thực đơn”. Giữ mã tối màu trên nền sáng với độ tương phản mạnh.',
          'Chú ý điểm an toàn khi quét: nó cảnh báo tương phản thấp, logo quá lớn và lề thiếu trước khi bạn in.',
        ],
      },
      {
        heading: '5. Thử và in',
        body: [
          'Quét mã bằng ít nhất hai điện thoại, một iPhone và một Android, từ khoảng cách mọi người sẽ dùng. Tải SVG hoặc PDF để in cho sắc nét ở mọi kích thước.',
        ],
      },
    ],
    faqs: [
      { q: 'Tạo mã QR có miễn phí không?', a: 'Có. Trên QR ALTRIX mọi tính năng đều miễn phí, kể cả mã động và phân tích.' },
      { q: 'Tôi có cần tài khoản không?', a: 'Không với mã tĩnh. Mã động cần tài khoản miễn phí để sửa được và theo dõi được.' },
      { q: 'Nên tải định dạng tệp nào?', a: 'PNG cho màn hình và tài liệu; SVG, PDF hoặc EPS cho in chuyên nghiệp.' },
    ],
  },
  'static-vs-dynamic-qr-codes': {
    title: 'Mã QR tĩnh và động – Khác biệt và khi nào nên dùng',
    description: 'Mã QR tĩnh hay động? Tìm hiểu cách mỗi loại hoạt động, loại nào sửa và theo dõi được, loại nào hết hạn, và loại nào hợp với thực đơn, bao bì, Wi-Fi và quảng cáo.',
    h1: 'Mã QR tĩnh và động',
    name: 'Tĩnh và động',
    intro: 'Mọi mã QR đều là tĩnh hoặc động. Sự khác biệt quyết định bạn có thể đổi mã sau khi in hay không, có đếm được lượt quét hay không, và — trên nhiều nền tảng — mã có ngừng khi hết dùng thử hay không.',
    sections: [
      {
        heading: 'Mã QR tĩnh hoạt động thế nào',
        body: [
          'Nội dung — liên kết, mật khẩu Wi-Fi, liên hệ — được mã hóa trực tiếp vào các ô đen trắng. Khi quét không cần tra cứu gì, nên mã hoạt động ngoại tuyến và mãi mãi.',
          'Nhược điểm: bạn không thể thay đổi và không ai đếm được lượt quét. Một lỗi gõ đồng nghĩa với in lại.',
        ],
      },
      {
        heading: 'Mã QR động hoạt động thế nào',
        body: [
          'Họa tiết chứa một liên kết ngắn. Khi quét, máy chủ liên kết ghi nhận lượt quét và chuyển hướng đến đích bạn đặt. Đổi đích đến và mọi bản in đều đổi theo.',
          'Vì liên kết ngắn, họa tiết luôn đơn giản và dễ quét kể cả khi in nhỏ.',
        ],
      },
      {
        heading: 'Mã QR động có hết hạn không?',
        body: [
          'Lẽ ra là không, nhưng ở nhiều dịch vụ thì có: gói miễn phí thường chỉ cho vài mã động hoặc vô hiệu hóa sau thời gian dùng thử, và mã đã in ngừng hoạt động.',
          'Trên QR ALTRIX, mã động miễn phí, không giới hạn và hoạt động cho đến khi bạn tạm dừng hoặc xóa.',
        ],
      },
      {
        heading: 'Nên dùng loại nào?',
        body: [
          'Tĩnh: Wi-Fi, liên hệ vCard, văn bản thuần và liên kết bạn chắc chắn sẽ không thay đổi.',
          'Động: thực đơn, bao bì, áp phích, danh thiếp, chiến dịch — mọi thứ in số lượng lớn hoặc cần đo lường kết quả.',
        ],
      },
    ],
    faqs: [
      { q: 'Tôi có chuyển mã tĩnh thành mã động được không?', a: 'Không, họa tiết khác nhau. Hãy tạo mã động và thay bản đã in.' },
      { q: 'Mã động có quét chậm hơn không?', a: 'Việc chuyển hướng thêm một phần nhỏ của giây; họa tiết đơn giản hơn thường giúp đọc nhanh hơn.' },
      { q: 'Mã động có thu thập dữ liệu cá nhân không?', a: 'Trên QR ALTRIX, mã ghi nhận quốc gia, thiết bị và thông tin tương tự; địa chỉ IP chỉ được lưu dưới dạng băm có muối.' },
    ],
  },
  'qr-code-size-for-print': {
    title: 'Kích thước mã QR khi in – Kích thước tối thiểu và khoảng cách quét',
    description: 'Mã QR nên lớn cỡ nào? Kích thước tối thiểu cho danh thiếp, tờ rơi, áp phích và biển hiệu, quy tắc 10:1, cùng mẹo về vùng trống và độ phân giải.',
    h1: 'Kích thước mã QR khi in',
    name: 'Hướng dẫn kích thước in',
    intro: 'Mã QR quá nhỏ là nguyên nhân phổ biến nhất khiến bản in thất bại. Kích thước phù hợp phụ thuộc vào khoảng cách quét và lượng dữ liệu trong mã.',
    sections: [
      {
        heading: 'Quy tắc 10:1',
        body: [
          'Điểm khởi đầu tốt: mã nên bằng ít nhất một phần mười khoảng cách quét. Quét từ 30 cm thì làm 3 cm; từ 2 mét thì làm 20 cm.',
        ],
      },
      {
        heading: 'Kích thước tối thiểu theo ấn phẩm',
        body: [
          'Danh thiếp và nhãn: tối thiểu 2 × 2 cm.',
          'Tờ rơi, thực đơn và thẻ để bàn: 3–4 cm.',
          'Áp phích nhìn từ vài mét: 10–20 cm.',
          'Băng rôn và biển tòa nhà: tính theo khoảng cách với quy tắc 10:1.',
        ],
      },
      {
        heading: 'Giữ vùng trống',
        body: [
          'Chừa khoảng trống quanh mã rộng khoảng bốn mô-đun (ô vuông nhỏ). Chữ hoặc hình chạm sát mã là nguyên nhân thường gặp khiến quét lỗi.',
        ],
      },
      {
        heading: 'Dùng tệp vector',
        body: [
          'Tải SVG, PDF hoặc EPS để in. Tệp vector luôn sắc nét hoàn hảo ở mọi kích thước, còn PNG phóng to có thể bị mờ.',
          'Mã động có ít mô-đun hơn, nên vẫn đọc được ở kích thước nhỏ mà liên kết tĩnh dài không thể đạt.',
        ],
      },
    ],
    faqs: [
      { q: 'Mã QR nhỏ nhất còn hoạt động là bao nhiêu?', a: 'Khoảng 2 × 2 cm để quét gần, nếu dữ liệu ít và in sắc nét.' },
      { q: 'Logo có thay đổi kích thước tối thiểu không?', a: 'Logo che một số mô-đun; giữ dưới một phần tư mã và nâng mức sửa lỗi lên Q hoặc H.' },
      { q: 'PNG cần độ phân giải bao nhiêu?', a: 'Khi in, ưu tiên vector. Nếu bắt buộc dùng PNG, xuất ít nhất 1000 px cho bản in nhỏ và lớn hơn cho bản in lớn.' },
    ],
  },
  'qr-code-design-best-practices': {
    title: 'Thực hành tốt nhất khi thiết kế mã QR – Màu sắc, logo và khung',
    description: 'Thiết kế mã QR nổi bật mà vẫn quét được: quy tắc tương phản, kích thước logo, màu sắc và chuyển sắc, khung và lời kêu gọi hành động, cách thử trước khi in.',
    h1: 'Thực hành tốt nhất khi thiết kế mã QR',
    name: 'Thực hành thiết kế tốt nhất',
    intro: 'Mã QR có thương hiệu được quét nhiều hơn mã trơn — miễn là điện thoại vẫn đọc được. Những quy tắc này giữ thiết kế của bạn ở vùng an toàn.',
    sections: [
      {
        heading: 'Tương phản là trên hết',
        body: [
          'Máy quét cần họa tiết tối trên nền sáng. Nhắm đến tỷ lệ tương phản ít nhất 4:1, và tránh mã đảo màu (sáng trên tối) trừ khi đã thử trên nhiều điện thoại.',
        ],
      },
      {
        heading: 'Logo: nhỏ và ở giữa',
        body: [
          'Logo che một phần mã. Cơ chế sửa lỗi của QR có thể khôi phục phần bị thiếu, nhưng có giới hạn: giữ logo dưới khoảng 25% mã và dùng mức sửa lỗi Q hoặc H.',
        ],
      },
      {
        heading: 'Màu sắc và chuyển sắc',
        body: [
          'Màu thương hiệu an toàn nếu đủ tối. Chuyển sắc ổn nếu cả hai đầu đều tối. Họa tiết màu pastel, vàng và xám nhạt là hay lỗi nhất.',
        ],
      },
      {
        heading: 'Thêm khung và lời kêu gọi hành động',
        body: [
          'Cho mọi người biết vì sao nên quét: “Quét để xem thực đơn”, “Nhận giảm 10%”, “Kết nối Wi-Fi của chúng tôi”. Mã có lời kêu gọi rõ ràng được quét nhiều hơn hẳn mã trơn.',
        ],
      },
      {
        heading: 'Thử trước khi in',
        body: [
          'Dùng tính năng kiểm tra an toàn khi quét, rồi quét bản in thử bằng iPhone và Android ở kích thước và khoảng cách thực tế.',
        ],
      },
    ],
    faqs: [
      { q: 'Mã QR có thể có màu bất kỳ không?', a: 'Có, miễn là họa tiết tối hơn rõ rệt so với nền.' },
      { q: 'Họa tiết bo tròn hoặc dạng chấm có quét được không?', a: 'Có, điện thoại hiện đại đọc tốt; hãy giữ các ô vuông góc rõ ràng.' },
      { q: 'Điểm an toàn khi quét là gì?', a: 'Một bước kiểm tra trong trình chỉnh sửa, cảnh báo tương phản thấp, logo quá lớn và các rủi ro khác trước khi bạn tải về.' },
    ],
  },
};

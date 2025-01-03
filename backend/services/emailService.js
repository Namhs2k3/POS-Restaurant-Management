import nodemailer from 'nodemailer';

// Tạo transporter để gửi email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // SMTP của nhà cung cấp
  port: Number(process.env.SMTP_PORT), // Port SMTP, đảm bảo chuyển thành số
  secure: process.env.SMTP_SECURE === 'true', // Chuyển chuỗi thành boolean
  auth: {
    user: process.env.SMTP_USER, // Email
    pass: process.env.SMTP_PASS // Mật khẩu ứng dụng
  }
});

// Hàm gửi email hóa đơn
export const sendInvoiceEmail = async (customerEmail, invoiceDetails) => {
  try {
    const { name, email, finalPrice, discount, cart } = invoiceDetails;

    // Tạo danh sách sản phẩm trong giỏ hàng
    const cartItemsHTML = cart.map((item) => `
    <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">
        ${item.product.name}
        </td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${item.totalPrice.toLocaleString('vi-VN')} đ</td>
    </tr>
    `).join('');

    // Tạo nội dung email
    const emailHTML = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h1 style="color: #4CAF50;">Cảm ơn bạn đã mua hàng!</h1>
        <p>Xin chào <strong>${name}</strong>,</p>
        <p>Chúng tôi rất vui vì bạn đã chọn 6'PS Cousine. Đây là hóa đơn của bạn:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 8px; border: 1px solid #ddd;">Sản phẩm</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Số lượng</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${cartItemsHTML}
          </tbody>
        </table>
        ${discount > 0 ? `
          <p style="margin-top: 20px; font-size: 16px;">
            Giảm giá: <strong>${discount.toLocaleString('vi-VN')} đ</strong>
          </p>
        ` : ''}

        <p style="font-size: 16px;">
          Tổng thanh toán: <strong style="color: #d32f2f;">${finalPrice.toLocaleString('vi-VN')} đ</strong>
        </p>
        <p style="margin-top: 20px;">Nếu bạn có bất kỳ câu hỏi nào, xin vui lòng liên hệ với chúng tôi qua email: <a href="mailto:${process.env.SMTP_USER}" style="color: #4CAF50;">${process.env.SMTP_USER}</a>.</p>
        <p>Xin cảm ơn,</p>
        <p><strong>6'PS Cousine</strong></p>
      </div>
    `;

    const mailOptions = {
      from: `"6'PS Cousine" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: 'Hóa đơn thanh toán của bạn tại 6\'PS Cousine',
      html: emailHTML
    };

    await transporter.sendMail(mailOptions);
    console.log('Email hóa đơn đã được gửi thành công.');
  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
  }
};

export const sendLowStockNotification = async (lowStockIngredients) => {
  try {
    const recipient = process.env.ADMIN_EMAIL || 'hoangtuan06102020@gmail.com';

    const lowStockIngredientsHTML = lowStockIngredients.map((ingredient) => `
    <tr>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
        ${ingredient.name}
        </td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${ingredient.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${ingredient.safeThreshold}</td>
    </tr>
    `).join('');

    const emailHTML = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h1 style="color: #eb1414;">Các nguyên liệu sau đang dưới mức tồn kho an toàn:</h1>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 8px; border: 1px solid #ddd;">Tên nguyên liệu</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Số lượng hiện tại</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Ngưỡng an toàn</th>
            </tr>
          </thead>
          <tbody>
            ${lowStockIngredientsHTML}
          </tbody>
        </table>
      </div>
    `;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: recipient,
      subject: 'Thông báo: Nguyên liệu sắp hết',
      html: emailHTML,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email thông báo nguyên liệu sắp hết đã được gửi thành công.');
  } catch (error) {
    console.error('Lỗi khi gửi email thông báo nguyên liệu:', error);
  }
};
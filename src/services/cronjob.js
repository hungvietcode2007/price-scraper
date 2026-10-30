const cron = require("node-cron");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const { scrapeTiki } = require("./scrapeService");
const { sendMail } = require("./gmailAPI");
const formatMail = (
  productImage,
  productName,
  targetPrice,
  currentPrice,
  productUrl,
  personalProduct,
) => {
  return `<div
  style="
    max-width: 480px;
    margin: 0 auto;
    background-color: #111722;
    border: 1px solid #1e293b;
    border-radius: 16px;
    padding: 24px;
    font-family: Arial, sans-serif;
    color: #e2e8f0;
  "
>
  <table
    width="100%"
    border="0"
    cellpadding="0"
    cellspacing="0"
    style="padding-bottom: 20px"
  >
    <tr>
      <td align="left" valign="middle">
        <a
          href="${process.env.BASE_URL}"
          style="text-decoration: none; display: inline-block"
        >
          <img
            src="https://i.postimg.cc/sf72Vm6G/logo.png"
            alt="logo"
            style="
              height: 28px;
              width: auto;
              vertical-align: middle;
              display: inline-block;
              border: 0;
            "
          />
          <span
            style="
              font-size: 18px;
              font-weight: bold;
              vertical-align: middle;
              padding-left: 6px;
            "
          >
            <span style="color: #ffffff">Cú</span>
            <span style="color: #d4af37">Đêm</span>
          </span>
        </a>
      </td>
      <td align="right" valign="middle">
        <span
          style="
            display: inline-block;
            font-size: 11px;
            font-weight: 700;
            color: #f59e0b;
            background-color: #292116;
            padding: 5px 10px;
            border-radius: 12px;
            border: 1px solid #784f12;
          "
        >
          🔥 GIÁ ĐÃ GIẢM
        </span>
      </td>
    </tr>
  </table>
  <div style="padding-bottom: 20px">
    <table
      width="100%"
      border="0"
      cellpadding="0"
      cellspacing="0"
      style="
        background-color: #182232;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 12px;
      "
    >
      <tr>
        <td width="80" valign="middle" style="padding-right: 14px">
          <img
            src="${productImage}"
            alt="${productName}"
            width="80"
            height="80"
            style="
              width: 80px;
              height: 80px;
              object-fit: cover;
              border-radius: 8px;
              display: block;
            "
          />
        </td>
        <td valign="middle" align="left">
          <div
            style="
              padding-bottom: 6px;
              font-size: 13px;
              font-weight: 600;
              color: #f8fafc;
              line-height: 1.4;
            "
          >
            ${productName}
          </div>
          <div
            style="
              font-size: 16px;
              font-weight: bold;
              color: #f59e0b;
              padding-bottom: 2px;
            "
          >
            ${currentPrice.toLocaleString("vi-VN")}đ
          </div>
          <div style="font-size: 12px; color: #94a3b8">
            (Mục tiêu:
            <span>${targetPrice.toLocaleString("vi-VN")}đ</span>
            )
          </div>
        </td>
      </tr>
    </table>
  </div>
  <div style="padding-bottom: 16px">
    <a
      href="${productUrl}"
      target="_blank"
      style="
        display: block;
        text-align: center;
        background-color: #fab338;
        color: #0b0f17;
        font-weight: bold;
        font-size: 14px;
        padding: 12px;
        border-radius: 10px;
        text-decoration: none;
      "
    >
      👉 Mua Ngay Trên Sàn
    </a>
  </div>
  <div style="text-align: center; font-size: 11px; color: #64748b">
    <a
      href="${process.env.BASE_URL}/product/${access_token}"
      style="color: #94a3b8; text-decoration: underline"
    >
      Quản lý danh sách hoặc Hủy theo dõi
    </a>
  </div>
</div>
<div
  style="
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #334155;
    text-align: center;
    font-size: 15px;
    color: #94a3b8;
    line-height: 1.6;
    font-family: Arial, sans-serif;
  "
>
  <p style="margin: 0 0 4px 0">
    Thư được gửi tự động từ hệ thống theo dõi giá
    <strong style="color: #f59e0b">Cú Đêm</strong>
  </p>
  <p style="margin: 0">
    Nếu có bất kỳ thắc mắc hoặc góp ý nào, vui lòng liên hệ với tác giả
    <a
      href="https://www.facebook.com/hung.ang.959587/"
      style="color: #fab338; font-weight: 600; text-decoration: underline"
    >
      tại đây
    </a>
  </p>
</div>
`;
};
const {
  addPriceToHistory,
  getSubscriptionInfo,
  getAllProductInfo,
  updateNotified,
} = require("./CRUDServices");
const { connection } = require("mysql2");
const startCronjob = () => {
  cron.schedule("0 */6 * * *", async () => {
    console.log("Bắt đầu quét giá các sản phẩm");
    try {
      const products = await getAllProductInfo();
      for (let product of products) {
        try {
          if (product.platform === "tiki") {
            const results = await scrapeTiki(product.url);
            const newPrice = results.price;
            console.log(results.price);
            await addPriceToHistory(product.id, newPrice);
            const results2 = await getSubscriptionInfo(product.id);
            for (let element of results2) {
              if (element.target_price >= newPrice) {
                const mailContent = formatMail(
                  product.image_url,
                  product.name,
                  element.target_price,
                  newPrice,
                  product.url,
                  element.access_token,
                );
                await sendMail(
                  element.email,
                  `🔥 [Cú Đêm] Giá giảm rồi! Sản phẩm đã đạt mức giá mong muốn của bạn`,
                  mailContent,
                );
                console.log(`Đã gửi thư cho ng dùng ${element.email}`);
                await updateNotified(product.id, element.user_id);
                await sleep(2000);
              }
            }
          }
        } catch (error) {
          console.log(`Lỗi khi cào giá của sp ${product.id}: ${error}`);
        }
        await sleep(5000);
      }
      console.log("Đã quét xong 1 lượt sản phẩm");
    } catch (error) {
      console.log("Lỗi Cronjob", error);
    }
  });
};
module.exports = { startCronjob };

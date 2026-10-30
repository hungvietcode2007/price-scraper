const { asyncHandler, validateProductUrl } = require("../utils/catchError");
const crypto = require("crypto");
const { scrapeTiki } = require("../services/scrapeService");
const {
  addProductInfo,
  addPriceToHistory,
  addSubscriptions,
  userWorkflow,
  linkWorkflow,
  getProductInfo,
  getHistoryPrice,
  getProductInfoFromId,
  getAllProductInfo,
  getPersonalProduct,
  deleteSubscription,
  getSubscriptionInfo,
  getUserInfo,
} = require("../services/CRUDServices");
const { sendMail } = require("../services/gmailAPI");
const connection = require("../config/database");
const { send } = require("process");
const { error } = require("console");
const formatText = (text, maxLength = 70) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};
const welcomeMail = (
  productImage,
  productName,
  platform,
  targetPrice,
  access_token,
) => {
  const platformName = platform
    ? platform.charAt(0).toUpperCase() + platform.slice(1)
    : "Tiki";
  return `
      <div
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
  <table style="width: 100%; border-collapse: collapse; border: 0">
    <tr>
      <td
        style="vertical-align: middle; text-align: left; padding-bottom: 20px"
      >
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
      <td
        style="vertical-align: middle; text-align: right; padding-bottom: 20px"
      >
        <span
          style="
            display: inline-block;
            font-size: 11px;
            font-weight: 700;
            color: #10b981;
            background-color: #0d2822;
            padding: 5px 10px;
            border-radius: 12px;
            border: 1px solid #134e3a;
          "
        >
          ✓ ĐANG THEO DÕI
        </span>
      </td>
    </tr>
  </table>
  <div style="padding-bottom: 20px">
    <div
      style="
        font-size: 16px;
        font-weight: bold;
        color: #ffffff;
        padding-bottom: 8px;
      "
    >
      Cảm ơn bạn đã sử dụng dịch vụ của Cú Đêm!
    </div>
    <div style="font-size: 13px; color: #94a3b8; line-height: 1.5">
      Hệ thống đã ghi nhận yêu cầu theo dõi sản phẩm dưới đây. Ngay khi giá giảm
      chạm mức mong muốn, Cú Đêm sẽ lập tức gửi thông báo cho bạn.
    </div>
  </div>
  <div style="padding-bottom: 20px">
    <table
      style="
        width: 100%;
        border-collapse: collapse;
        background-color: #182232;
        border: 1px solid #334155;
        border-radius: 12px;
      "
    >
      <tr>
        <td
          style="
            width: 80px;
            vertical-align: middle;
            padding: 12px 14px 12px 12px;
          "
        >
          <img
            src="${productImage}"
            alt="${productName}"
            style="
              width: 80px;
              height: 80px;
              object-fit: cover;
              border-radius: 8px;
              display: block;
            "
          />
        </td>
        <td
          style="
            vertical-align: middle;
            text-align: left;
            padding: 12px 12px 12px 0;
          "
        >
          <div
            style="
              padding-bottom: 8px;
              font-size: 13px;
              font-weight: 600;
              color: #f8fafc;
              line-height: 1.4;
            "
          >
            ${formatText(productName, 85)}
          </div>
          <div style="padding-bottom: 6px">
            <span
              style="
                display: inline-block;
                font-size: 10px;
                font-weight: bold;
                color: #38bdf8;
                background-color: #0c2a3e;
                border: 1px solid #0284c7;
                padding: 2px 8px;
                border-radius: 6px;
                text-transform: uppercase;
              "
            >
              ${platformName}
            </span>
          </div>
          <div style="font-size: 13px; color: #94a3b8">
            Mục tiêu:
            <span style="font-size: 15px; font-weight: bold; color: #f59e0b">
              ${Number(targetPrice).toLocaleString("vi-VN")}đ
            </span>
          </div>
        </td>
      </tr>
    </table>
  </div>
  <div
    style="
      text-align: center;
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.5;
    "
  >
    Bạn có thể xem những sản phẩm mình đang theo dõi
    <a
      href="${process.env.BASE_URL}/product/${access_token}"
      target="_blank"
      style="color: #fab338; font-weight: bold; text-decoration: underline; cursor:pointer"
    >
      tại đây
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
const getHomePage = async (req, res) => {
  res.render("homePage", { error: null });
};
const scrapeProgress = asyncHandler(async (req, res) => {
  const { url } = req.body;
  const check = validateProductUrl(url);
  if (!check.valid) {
    return res.render("homePage", { error: check.error });
  }
  let results;
  if (url.includes("tiki.vn")) {
    results = await scrapeTiki(url);
  }
  const values = [];
  values.push([
    results.platform,
    results.product_code,
    results.url,
    results.name,
    results.imageUrl,
    results.price,
  ]);
  console.log(values);
  const product_id = await linkWorkflow(values);
  res.redirect(`/product/${results.platform}/${results.product_code}`);
});
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const getProductInfoPage = asyncHandler(async (req, res) => {
  const { platform, product_code } = req.params;
  const results = await getProductInfo(platform, product_code);
  const product = results ? results[0] : "";
  product.current_price = formatNumber(product.current_price);
  const rawDataPrice = await getHistoryPrice(platform, product_code);
  const map = new Map();
  rawDataPrice.forEach((log) => {
    const date = new Date(log.recorded_at);
    const hours = Math.floor(date.getHours() / 6) * 6;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const hourStr = String(hours).padStart(2, "0");
    const timeLabel = `${day}/${month} ${hourStr}:00`;
    map.set(timeLabel, Number(log.price));
  });
  const labels = Array.from(map.keys());
  const prices = Array.from(map.values());
  const minPrice = prices.length > 0 ? Math.min(...prices) : "";
  const maxPrice = prices.length > 0 ? Math.max(...prices) : "";
  res.render("productInfo", { product, labels, prices, minPrice, maxPrice });
});
const userProgress = asyncHandler(async (req, res) => {
  const { email, target_price, product_id } = req.body;
  const access_token = crypto.randomBytes(20).toString("hex");
  await userWorkflow(product_id, email, access_token, target_price);
  const results = await getProductInfoFromId(product_id);
  const product = results ? results[0] : "";
  res.redirect(
    `/product/${product.platform}/${product.product_code}?subscribed=true`,
  );
  const results2 = await getUserInfo(email);
  const trueAccess_token = results2[0].access_token;
  console.log(trueAccess_token);
  const htmlMail = welcomeMail(
    product.image_url,
    product.name,
    product.platform,
    target_price,
    trueAccess_token,
  );
  sendMail(email, "Lời cảm ơn tới từ Cú Đêm", htmlMail);
});
const getDashboard = asyncHandler(async (req, res) => {
  const results = await getAllProductInfo();
  res.render("dashboard", { List: results });
});
const getPersonalProductPage = asyncHandler(async (req, res) => {
  const access_token = req.params.access_token;
  const results = await getPersonalProduct(access_token);
  res.render("personalProduct", { List: results });
});
const unfollowPost = asyncHandler(async (req, res) => {
  const { product_id, user_id } = req.params;
  await deleteSubscription(user_id, product_id);
  const backURL = req.get("Referrer") || "/";
  return res.redirect(backURL);
});
module.exports = {
  getHomePage,
  scrapeProgress,
  getProductInfoPage,
  userProgress,
  getDashboard,
  getPersonalProductPage,
  unfollowPost,
};

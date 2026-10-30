const axios = require("axios");
const scrapeTiki = async (url) => {
  try {
    const platform = "tiki";
    const parentMatch = url.match(/-p(\d+)\.html/)
      ? url.match(/-p(\d+)\.html/)
      : null;
    const parent_id = parentMatch ? parentMatch[1] : null;
    const spidMatch = url.match(/spid=(\d+)/) ? url.match(/spid=(\d+)/) : null;
    const sp_id = spidMatch ? spidMatch[1] : null;
    if (parent_id === null) {
      //xử lí thông báo lỗi ở giao diện sau
      console.log(`không thể track id của link Tiki: ${url}`);
      return;
    }
    let apiUrl;
    if (sp_id) {
      apiUrl = `https://tiki.vn/api/v2/products/${parent_id}?platform=web&spid=${sp_id}&version=3`;
    } else {
      apiUrl = `https://tiki.vn/api/v2/products/${parent_id}?platform=web&version=3`;
    }
    const product_code = sp_id ? `${parent_id}_${sp_id}` : `${parent_id}`;
    const response = await axios.get(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const data = response.data;
    const name = data.name;
    const price = data.price || data.original_price;
    const imageUrl = data.images[0].base_url || null;
    return { platform, product_code, url, name, price, imageUrl };
  } catch (error) {
    console.log(`Lỗi cào dữ liệu Tiki: ${error.message}`);
  }
};
module.exports = { scrapeTiki };

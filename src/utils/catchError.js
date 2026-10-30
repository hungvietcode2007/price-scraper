const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
const validateProductUrl = (url) => {
  const rawUrl = url ? url.trim() : "";

  if (!rawUrl) {
    return { valid: false, error: "Vui lòng nhập đường link sản phẩm!" };
  }

  if (!rawUrl.includes("tiki.vn")) {
    return {
      valid: false,
      error: "Hiện tại Cú Đêm chỉ đang hỗ trợ theo dõi giá trên sàn Tiki!",
    };
  }

  return { valid: true };
};
module.exports = { validateProductUrl, asyncHandler };

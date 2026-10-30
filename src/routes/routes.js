const {
  getHomePage,
  scrapeProgress,
  getProductInfoPage,
  userProgress,
  getDashboard,
  getPersonalProductPage,
  unfollowPost,
} = require("../controllers/homeController");
const path = require("path");
const express = require("express");
const router = express.Router();
router.get("/", getHomePage);
router.post("/", scrapeProgress);
router.post("/userProcess", userProgress);
router.get("/dashboard", getDashboard);
router.get("/product/:access_token", getPersonalProductPage);
router.get("/product/:platform/:product_code", getProductInfoPage);
router.post("/subscription/delete/:user_id/:product_id", unfollowPost);
module.exports = router;

require("dotenv").config();
const { google } = require("googleapis");
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground",
);

oAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
const makeBody = (to, subject, message) => {
  const str = [
    `To: ${to}`,
    `From: "Cu Dem" <${process.env.EMAIL_USER}>`,
    `Subject: =?utf-8?B?${Buffer.from(subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    message,
  ].join("\n");

  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const sendMail = async (to, subject, content) => {
  try {
    const raw = makeBody(to, subject, content);

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    console.log("✅ Gửi mail thành công qua Gmail REST API! ID:", res.data.id);
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi gửi mail qua Gmail REST API:", error);
    throw error;
  }
};
module.exports = { sendMail };

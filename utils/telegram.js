const axios = require("axios");

const BOT_TOKEN = "7683069829:AAFZ46GxiBo92DTtgU_uu0exdDbI8C9h634";
const ADMIN_CHAT_ID = "8062668464";

const sendTelegramMessage = async (text) => {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: ADMIN_CHAT_ID,
      text: text,
      parse_mode: "HTML",
    });
  } catch (error) {
    console.error("❌ Telegram error:", error.response?.data || error.message);
  }
};

module.exports = sendTelegramMessage;

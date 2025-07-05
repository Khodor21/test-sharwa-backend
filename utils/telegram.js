const axios = require("axios");

const BOT_TOKEN = "8050537458:AAFIC8UtkZzVeQOYwm6bmBahySvDrnOEgfg";
const ADMIN_CHAT_ID = "1780939935";

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

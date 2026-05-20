const { Bot, webhookCallback } = require("grammy");
const axios = require("axios");

const bot = new Bot(process.env.TELEGRAM_TOKEN);

bot.on("message:text", async (ctx) => {
    const text = ctx.message.text;
    const actMatch = text.match(/act\.[a-zA-Z0-9\._-]+/);
    const rftMatch = text.match(/rft\.[a-zA-Z0-9\._-]+/);

    if (actMatch) {
        ctx.reply("🔍 جاري التحقق من التوكن...");
        try {
            const token = actMatch[0];
            ctx.reply(`✅ تم استلام التوكن:\n${token}\n\n⚙️ النظام قيد التطوير للفحص التلقائي.`);
        } catch (e) {
            ctx.reply("❌ حدث خطأ أثناء الفحص.");
        }
    } else if (rftMatch) {
        ctx.reply("🔄 تم استلام REFRESH TOKEN بنجاح.");
    }
});

module.exports = webhookCallback(bot, "http");


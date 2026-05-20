const { Bot, webhookCallback } = require("grammy");

const bot = new Bot(process.env.TELEGRAM_TOKEN);

bot.on("message", async (ctx) => {
    const oldMessage = `👑 تم صيد حساب تيك توك حقيقي بنجاح 👑

🔑 ACCESS TOKEN:
${ctx.message.text || "التوكن المستلم"}

🔄 REFRESH TOKEN:
${ctx.message.text || "التوكن المستلم"}`;

    await ctx.reply(oldMessage);
});

module.exports = webhookCallback(bot, "http");

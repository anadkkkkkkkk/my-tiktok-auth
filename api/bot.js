const { Bot, webhookCallback } = require("grammy");

const bot = new Bot(process.env.TELEGRAM_TOKEN);


bot.on("message:text", async (ctx) => {
    const text = ctx.message.text;
    
    // البحث عن توكن الوصول وتوكن التحديث داخل النص
    const actMatch = text.match(/act\.[a-zA-Z0-9\._-]+/);
    const rftMatch = text.match(/rft\.[a-zA-Z0-9\._-]+/);

    if (actMatch || rftMatch) {
        let responseMessage = "👑 **تم تصفية واستخراج التوكنات بنجاح** 👑\n\n";

        if (actMatch) {
            responseMessage += `🔑 **ACCESS TOKEN:**\n\`${actMatch[0]}\`\n\n`;
        } else {
            responseMessage += `🔑 **ACCESS TOKEN:**\n❌ غير موجود في الرسالة\n\n`;
        }

        if (rftMatch) {
            responseMessage += `🔄 **REFRESH TOKEN (المنهي):**\n\`${rftMatch[0]}\`\n`;
        } else {
            responseMessage += `🔄 **REFRESH TOKEN (المنهي):**\n❌ غير موجود في الرسالة\n`;
        }

        // إرسال النتيجة للمستخدم مع ميزة النقر للنسخ (Markdown)
        await ctx.reply(responseMessage, { parse_mode: "Markdown" });
    }
});

module.exports = webhookCallback(bot, "http");


const { Bot, GrammyError, HttpError } = require("grammy");
const { exec } = require("child_process");
const fs = require("fs");

const bot = new Bot(process.env.TELEGRAM_TOKEN);

bot.on("message:audio", async (ctx) => {
  const file = await ctx.getFile();
  const path = `./input.mp3`;
  await file.download(path);

  ctx.reply("🎚️ جاري إضافة الصدى... لحظات.");
  
  // إضافة الصدى
  exec(`ffmpeg -i input.mp3 -af "aecho=0.8:0.9:500:0.4" output.mp3`, (err) => {
    if (err) return ctx.reply("❌ فشلت المعالجة.");
    ctx.replyWithAudio("./output.mp3", { caption: "✅ هذا هو الصوت مع الصدى جاهز!" });
  });
});

module.exports = async (req, res) => {
  await bot.handleUpdate(req.body, res);
};

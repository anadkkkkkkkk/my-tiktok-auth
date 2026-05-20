const { Bot } = require("grammy");
const { execSync } = require("child_process");
const bot = new Bot(process.env.TELEGRAM_TOKEN);

// معالجة الملفات الصوتية مباشرة
bot.on("message:audio", async (ctx) => {
  ctx.reply("🎚️ جارٍ معالجة الصوت وإضافة الصدى...");
  const file = await ctx.getFile();
  await file.download("./input.mp3");

  // إضافة صدى احترافي
  execSync('ffmpeg -i input.mp3 -af "aecho=0.8:0.9:500:0.4" output.mp3');
  
  await ctx.replyWithAudio("./output.mp3", { caption: "✅ تم إضافة الصدى بنجاح!" });
});

module.exports = async (req, res) => {
  await bot.handleUpdate(req.body, res);
};

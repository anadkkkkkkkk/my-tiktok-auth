module.exports = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // 1. مسار التوثيق التلقائي لنطاق تيك توك
  if (url.searchParams.has('tiktok-developers-site-verification') || url.pathname.includes('tiktok-developers-site-verification')) {
    res.setHeader('Content-Type', 'text/plain');
    return res.end('Tiktok-developers-site-verification=X0rbCBz0sv0XGnslTmw9ZyRWVDIdmha5');
  }

  // 2. مسار استقبال والتحقق من معرفات الـ API
  if (url.pathname === '/api/callback' || url.pathname === '/api/auth') {
    const code = url.searchParams.get('code');
    
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      status: "success",
      message: "AWR Engine: Interface Ready",
      received_code: code || "No code provided yet"
    }));
  }

  // 3. المسار الافتراضي
  res.setHeader('Content-Type', 'text/plain');
  res.end('AWR Central Engine Serverless Function');
};

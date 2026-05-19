module.exports = async (req, res) => {
  const url = req.url;
  if (url.includes('tiktok-developers-site-verification')) {
    res.setHeader('Content-Type', 'text/plain');
    return res.end('Tiktok-developers-site-verification=X0rbCBz0sv0XGnslTmw9ZyRWVDIdmha5');
  }
  res.setHeader('Content-Type', 'text/html');
  res.end('<!DOCTYPE html><html><body style="background:#000; color:#fff; text-align:center; padding-top:20%;"><h1>AWR System - Active</h1></body></html>');
};

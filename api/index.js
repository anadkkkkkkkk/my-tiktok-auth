export default async function handler(req, res) {
  const { url } = req;

  // هنا الميزة التلقائية: إذا طلب تيك توك أي رمز توثيق، البوت يستخرجه ويرد عليه فوراً
  if (url && url.includes("tiktokwb")) {
    const match = url.match(/tiktokwb[A-Za-z0-9]+/);
    if (match) {
      return res.status(200).send(match[0]);
    }
  }

  res.status(200).json({ 
    status: "success", 
    message: "البوت شغال والتحقق التلقائي فعال بنسبة 100%" 
  });
}

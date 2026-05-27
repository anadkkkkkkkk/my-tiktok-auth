const puppeteer = require('puppeteer');
(async () => {
  console.log('🤖 بدء تشغيل البوت...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(30000);
  
  console.log('🔍 فحص ملف التحقق...');
  try {
    await page.goto('https://anadkkkkkkkk.github.io/my-tiktok-auth/tiktokEpJjyEMntmzIqxeTAsyQzc1YbaC0sNrA.txt', { waitUntil: 'domcontentloaded' });
    const content = await page.evaluate(() => document.body.innerText);
    if (content.includes('tiktok-developers-site-verification')) console.log('✅ ملف التحقق يعمل!');
    else console.log('⚠️ محتوى غير متوقع:', content);
  } catch (e) { console.log('⚠️ تعذر فحص الملف:', e.message); }
  
  console.log('🔗 فتح بوابة مطوري تيك توك...');
  await page.goto('https://developers.tiktok.com/apps', { waitUntil: 'networkidle0' });
  
  console.log('⏳ الرجاء تسجيل الدخول، اختيار AWR، ثم اضغط Enter...');
  process.stdin.resume();
  await new Promise(resolve => process.stdin.once('data', resolve));
  
  console.log('🤖 جاري تعبئة الحقول...');
  const fields = {
    'input[name="website_url"]': 'https://anadkkkkkkkk.github.io/my-tiktok-auth/',
    'input[name="privacy_policy_url"]': 'https://anadkkkkkkkk.github.io/my-tiktok-auth/privacy.html',
    'input[name="terms_of_service_url"]': 'https://anadkkkkkkkk.github.io/my-tiktok-auth/terms.html',
    'textarea[name="description"]': 'تطبيق AWR هو تطبيق ويب يقدم للمستخدمين إمكانية تسجيل الدخول بسهولة باستخدام حساب تيك توك للوصول إلى محتوى مخصص وتجربة سلسة.',
    'textarea[name="review_explanation"]': 'يستخدم تطبيق AWR منتج Login Kit من تيك توك لمنح المستخدمين طريقة آمنة وسريعة لتسجيل الدخول. عند النقر على زر تسجيل الدخول، يتم توجيه المستخدم إلى صفحة موافقة تيك توك الرسمية. بعد الموافقة، يستلم التطبيق البيانات الأساسية للملف الشخصي (الاسم والصورة الرمزية) لعرض تجربة مخصصة. النطاق المطلوب هو user.info.basic فقط.'
  };
  for (const [selector, value] of Object.entries(fields)) {
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      const element = await page.$(selector);
      if (element) { await element.click({ clickCount: 3 }); await element.type(value, { delay: 30 }); }
    } catch (err) {}
  }
  console.log('✅ تم تعبئة الحقول. اضغط Enter للحفظ...');
  await new Promise(resolve => process.stdin.once('data', resolve));
  try {
    const saveButton = await page.$('button[type="submit"]');
    if (saveButton) { await saveButton.click(); console.log('✅ تم الحفظ!'); }
  } catch (err) {}
  console.log('🎉 انتهى البوت.');
  await browser.close();
})();

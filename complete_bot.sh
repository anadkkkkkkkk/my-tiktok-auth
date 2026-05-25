#!/bin/bash
set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

echo -e "${CYAN}🤖 البوت النهائي لربط تيك توك${NC}"
echo ""

# 1. التأكد من أحدث نشر والحصول على رابط الإنتاج
echo -e "${YELLOW}⏳ جاري النشر والحصول على أحدث رابط...${NC}"
DEPLOY_OUTPUT=$(vercel --prod --yes 2>&1)
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://[^ ]*\.vercel\.app' | head -1)

if [ -z "$DEPLOY_URL" ]; then
    echo "❌ فشل في استخراج رابط النشر."
    exit 1
fi

echo -e "${GREEN}✅ رابط الموقع الحالي: $DEPLOY_URL${NC}"

# 2. تجهيز جميع الروابط
VERIFY_FILE="tiktokEpJjyEMntmzIqxeTAsyQzc1YbaC0sNrA.txt"
VERIFY_URL="${DEPLOY_URL}/${VERIFY_FILE}"
REDIRECT_URI="${DEPLOY_URL}/auth/callback"
PRIVACY_URL="${DEPLOY_URL}/privacy.html"
TERMS_URL="${DEPLOY_URL}/terms.html"

# 3. عرض التعليمات
echo ""
echo -e "${CYAN}📋 الآن، افتح هذا الرابط في متصفحك:${NC}"
echo -e "   ${YELLOW}https://developers.tiktok.com/apps${NC}"
echo ""
echo -e "   اختر تطبيق ${YELLOW}AWR${NC}، ثم اذهب إلى ${YELLOW}Login Kit${NC}"
echo ""
echo -e "   في حقل ${YELLOW}Redirect URI${NC}، امسح أي رابط قديم وألصق هذا الرابط:"
echo -e "   ${GREEN}${REDIRECT_URI}${NC}"
echo ""
echo -e "   ثم اضغط ${YELLOW}Save${NC}."
echo ""
echo -e "${CYAN}بعد الحفظ، ارجع هنا واضغط Enter...${NC}"
read -p ""

# 4. تجربة البوت الآلي
echo ""
echo -e "${GREEN}✅ تم! الآن افتح صفحة البوت لتسجيل الدخول:${NC}"
echo -e "   ${GREEN}${DEPLOY_URL}/tiktok-bot.html${NC}"
echo ""

# محاولة فتحها تلقائيًا إذا أمكن
if command -v termux-open-url &> /dev/null; then
    termux-open-url "${DEPLOY_URL}/tiktok-bot.html"
else
    echo -e "افتح الرابط يدويًا في متصفحك."
fi

echo ""
echo -e "${GREEN}تم كل شيء! اضغط على الزر في الصفحة، وسيتم تسجيل الدخول.${NC}"

#!/bin/bash
set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'

echo -e "${CYAN}🤖 بوت النشر التلقائي لـ Vercel${NC}"

# 1. التأكد من وجود Node.js و npm
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}⏳ تثبيت Node.js و npm...${NC}"
    pkg install nodejs -y
fi

# 2. تثبيت Vercel CLI إذا لزم
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⏳ تثبيت Vercel CLI...${NC}"
    npm install -g vercel
fi

# 3. قراءة الرمز من الملف الآمن
if [ ! -f vercel_token.txt ]; then
    echo -e "${RED}❌ ملف vercel_token.txt غير موجود.${NC}"
    echo -e "استخدم: echo 'رمزك' > vercel_token.txt"
    exit 1
fi
VERCEL_TOKEN=$(cat vercel_token.txt | tr -d '\n\r')

# 4. ربط المشروع (إذا لم يكن مربوطاً)
if [ ! -f .vercel/project.json ]; then
    echo -e "${YELLOW}🔗 ربط المشروع...${NC}"
    vercel link --yes --project my-tiktok-auth --token "$VERCEL_TOKEN"
fi

# 5. النشر إلى الإنتاج
echo -e "${GREEN}🚀 جاري النشر...${NC}"
DEPLOY_OUTPUT=$(vercel deploy --prod --yes --token "$VERCEL_TOKEN" 2>&1)
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://[^ ]*\.vercel\.app' | head -1)

if [ -n "$DEPLOY_URL" ]; then
    echo -e "${CYAN}✅ تم النشر بنجاح!${NC}"
    echo -e "🔗 الرابط النهائي: ${GREEN}$DEPLOY_URL${NC}"
    echo ""
    echo -e "📋 روابط تيك توك:"
    echo -e "   📄 التحقق: ${DEPLOY_URL}/tiktokwbDGMxjLe5luqd9Sc2MfB1uMHZPi6pYcA.txt"
    echo -e "   🔒 الخصوصية: ${DEPLOY_URL}/privacy.html"
    echo -e "   📜 الشروط: ${DEPLOY_URL}/terms.html"
else
    echo -e "${RED}فشل النشر.${NC}"
    echo -e "${YELLOW}مخرجات النشر:${NC}"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

const express = require('express');
const fetch = require('node-fetch');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || `${BASE_URL}/auth/callback`;

if (!CLIENT_KEY || !CLIENT_SECRET) {
    console.error('🚨 مفقود: TIKTOK_CLIENT_KEY و TIKTOK_CLIENT_SECRET في .env');
    process.exit(1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const stateStore = new Map();

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/auth/login', (req, res) => {
    const csrfState = crypto.randomBytes(32).toString('hex');
    stateStore.set(csrfState, Date.now());

    const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
    authUrl.searchParams.set('client_key', CLIENT_KEY);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'user.info.basic');
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('state', csrfState);

    res.redirect(authUrl.toString());
});

app.get('/auth/callback', async (req, res) => {
    const { code, state, error, error_description } = req.query;

    if (error) {
        return res.redirect('/?error=' + encodeURIComponent(error_description || 'لم يتم الموافقة'));
    }
    if (!code || !state) {
        return res.redirect('/?error=' + encodeURIComponent('طلب غير صالح'));
    }
    if (!stateStore.has(state)) {
        return res.redirect('/?error=' + encodeURIComponent('رمز الحالة غير صحيح'));
    }
    stateStore.delete(state);

    try {
        const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_key: CLIENT_KEY,
                client_secret: CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI,
            }).toString(),
        });
        const tokenData = await tokenRes.json();

        if (tokenData.error) {
            console.error('❌ Token error:', tokenData);
            return res.redirect('/?error=' + encodeURIComponent('فشل الحصول على التوكن'));
        }

        const accessToken = tokenData.access_token;

        const userRes = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=display_name,avatar_url', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        const userData = await userRes.json();
        const user = userData.data?.user;

        if (!user) {
            return res.redirect('/?error=' + encodeURIComponent('تعذر جلب البيانات'));
        }

        const params = new URLSearchParams({
            success: 'true',
            name: user.display_name || 'مستخدم',
            handle: user.username || 'user',
            avatar: user.avatar_url || '',
        });
        res.redirect('/?' + params.toString());

    } catch (err) {
        console.error('🚨', err);
        res.redirect('/?error=' + encodeURIComponent('خطأ في السيرفر'));
    }
});

app.listen(PORT, () => {
    console.log(`\n╔══════════════════════════════════╗`);
    console.log(`║   🤖 AWR TikTok Auth Bot v2    ║`);
    console.log(`║   🚀 http://localhost:${PORT}         ║`);
    console.log(`╚══════════════════════════════════╝\n`);
});

const express = require('express');
const fetch = require('node-fetch');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const CLIENT_KEY = process.env.CLIENT_KEY;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const REDIRECT_URI = process.env.REDIRECT_URI || `${BASE_URL}/auth/callback`;

if (!CLIENT_KEY || !CLIENT_SECRET) {
    console.error('❌ مفقود: CLIENT_KEY أو CLIENT_SECRET في .env');
    process.exit(1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const TOKEN_DB_PATH = path.join(__dirname, 'tokens.json');

function loadTokens() {
    try {
        if (fs.existsSync(TOKEN_DB_PATH)) {
            return JSON.parse(fs.readFileSync(TOKEN_DB_PATH, 'utf8'));
        }
    } catch (e) { console.error('فشل تحميل tokens.json:', e.message); }
    return {};
}

function saveTokens(tokens) {
    fs.writeFileSync(TOKEN_DB_PATH, JSON.stringify(tokens, null, 2));
}

let tokenDB = loadTokens();

function base64URLEncode(buffer) {
    return buffer.toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function generatePKCE() {
    const verifier = base64URLEncode(crypto.randomBytes(32));
    const challenge = base64URLEncode(
        crypto.createHash('sha256').update(verifier).digest()
    );
    return { verifier, challenge };
}

const stateStore = new Map();
setInterval(() => {
    const now = Date.now();
    for (const [key, val] of stateStore) {
        if (now - val.time > 600000) stateStore.delete(key);
    }
}, 60000);

async function refreshAccessToken(userId, refreshToken) {
    const params = new URLSearchParams();
    params.set('client_key', CLIENT_KEY);
    params.set('client_secret', CLIENT_SECRET);
    params.set('grant_type', 'refresh_token');
    params.set('refresh_token', refreshToken);

    const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
    });
    const data = await res.json();

    if (data.error) {
        console.error(`❌ فشل تحديث التوكن لـ ${userId}:`, data.error_description || data.error);
        return null;
    }

    if (tokenDB[userId]) {
        tokenDB[userId].access_token = data.access_token;
        tokenDB[userId].refresh_token = data.refresh_token || refreshToken;
        tokenDB[userId].expires_at = Date.now() + (data.expires_in - 60) * 1000;
        tokenDB[userId].refresh_expires_at = data.refresh_expires_in
            ? Date.now() + data.refresh_expires_in * 1000
            : tokenDB[userId].refresh_expires_at;
        saveTokens(tokenDB);
    }

    return data;
}

setInterval(async () => {
    const now = Date.now();
    for (const [userId, tokens] of Object.entries(tokenDB)) {
        if (tokens.expires_at && now > tokens.expires_at - 300000) {
            console.log(`🔄 تجديد تلقائي لتوكن ${userId}...`);
            await refreshAccessToken(userId, tokens.refresh_token);
        }
        if (tokens.refresh_expires_at && now > tokens.refresh_expires_at) {
            console.log(`🗑️ حذف ${userId} — انتهت صلاحية refresh token`);
            delete tokenDB[userId];
            saveTokens(tokenDB);
        }
    }
}, 60000);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now(), users: Object.keys(tokenDB).length });
});

app.get('/api/users', (req, res) => {
    const users = Object.entries(tokenDB).map(([id, t]) => ({
        id, username: t.username, display_name: t.display_name,
        avatar_url: t.avatar_url, expires_at: t.expires_at,
        refresh_expires_at: t.refresh_expires_at,
    }));
    res.json(users);
});

app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    if (tokenDB[id]) {
        delete tokenDB[id];
        saveTokens(tokenDB);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'المستخدم غير موجود' });
    }
});

app.get('/auth/login', (req, res) => {
    const csrfState = crypto.randomBytes(32).toString('hex');
    const { verifier, challenge } = generatePKCE();
    stateStore.set(csrfState, { time: Date.now(), verifier });

    const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
    authUrl.searchParams.set('client_key', CLIENT_KEY);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'user.info.basic');
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('state', csrfState);
    authUrl.searchParams.set('code_challenge', challenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

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

    const stored = stateStore.get(state);
    if (!stored) {
        return res.redirect('/?error=' + encodeURIComponent('رمز الحالة غير صحيح أو منتهي الصلاحية'));
    }
    stateStore.delete(state);

    try {
        const params = new URLSearchParams();
        params.set('client_key', CLIENT_KEY);
        params.set('client_secret', CLIENT_SECRET);
        params.set('code', code);
        params.set('grant_type', 'authorization_code');
        params.set('redirect_uri', REDIRECT_URI);
        params.set('code_verifier', stored.verifier);

        const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
        });
        const tokenData = await tokenRes.json();

        if (tokenData.error) {
            return res.redirect('/?error=' + encodeURIComponent(
                'فشل الحصول على التوكن: ' + (tokenData.error_description || tokenData.error)
            ));
        }

        const userRes = await fetch(
            'https://open.tiktokapis.com/v2/user/info/?fields=display_name,avatar_url,username',
            { headers: { 'Authorization': `Bearer ${tokenData.access_token}` } }
        );
        const userData = await userRes.json();
        const user = userData.data?.user;

        if (!user) {
            return res.redirect('/?error=' + encodeURIComponent('تعذر جلب بيانات المستخدم'));
        }

        const userId = `tiktok_${user.username}`;
        tokenDB[userId] = {
            username: user.username, display_name: user.display_name,
            avatar_url: user.avatar_url || '',
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: Date.now() + (tokenData.expires_in - 60) * 1000,
            refresh_expires_at: tokenData.refresh_expires_in
                ? Date.now() + tokenData.refresh_expires_in * 1000
                : Date.now() + 365 * 24 * 60 * 60 * 1000,
            created_at: Date.now(),
        };
        saveTokens(tokenDB);

        console.log(`✅ ${user.display_name} (@${user.username}) — تم التسجيل والتخزين`);

        const qp = new URLSearchParams({
            success: 'true', name: user.display_name || 'مستخدم',
            handle: user.username || 'user', avatar: user.avatar_url || '',
        });
        res.redirect('/?' + qp.toString());

    } catch (err) {
        console.error('🚨', err);
        res.redirect('/?error=' + encodeURIComponent('خطأ في السيرفر: ' + err.message));
    }
});

app.get('/api/token/:userId', async (req, res) => {
    const user = tokenDB[req.params.userId];
    if (!user) return res.status(404).json({ error: 'مستخدم غير موجود' });

    if (Date.now() > user.expires_at - 600000) {
        const result = await refreshAccessToken(req.params.userId, user.refresh_token);
        if (!result) {
            return res.status(401).json({ error: 'فشل تجديد التوكن' });
        }
        return res.json({ access_token: tokenDB[req.params.userId].access_token });
    }

    res.json({ access_token: user.access_token });
});

app.listen(PORT, () => {
    console.log(`\n╔══════════════════════════════════╗`);
    console.log(`║  🤖 AWR TikTok Auth Bot v3    ║`);
    console.log(`║  🚀 http://localhost:${PORT}    ║`);
    console.log(`╚══════════════════════════════════╝\n`);
    console.log(`🔐 CLIENT_KEY: ${CLIENT_KEY.substring(0, 8)}...`);
    console.log(`🔗 REDIRECT_URI: ${REDIRECT_URI}`);
    console.log(`👥 المستخدمون الحاليون: ${Object.keys(tokenDB).length}`);
});

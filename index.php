<?php
require_once __DIR__ . '/vendor/autoload.php';

// بيانات تطبيقك من TikTok Developers
$clientKey = 'YOUR_CLIENT_KEY';
$clientSecret = 'YOUR_CLIENT_SECRET';
$redirectUri = 'https://your-domain.vercel.app/'; // نفس الرابط اللي حطيته في موقع تيك توك

$api = new \JanStolpe\TikTokApi\TikTokApi($clientKey, $clientSecret, $redirectUri);

// إذا رجع الكود من تيك توك (بعد الموافقة)
if (isset($_GET['code'])) {
    $token = $api->getAccessToken($_GET['code']);
    echo "<h1>تم تسجيل الدخول بنجاح!</h1>";
    echo "<pre>";
    print_r($token); // بيعرض لك الـ Access Token اللي بنستخدمه للسحب
    echo "</pre>";
} else {
    // رابط تسجيل الدخول
    $url = $api->getAuthorizeUrl(['user.info.basic', 'video.list', 'video.upload']);
    echo "<a href='$url' style='padding:20px; background:black; color:white; text-decoration:none;'>الدخول عبر تيك توك (Sandbox Mode)</a>";
}


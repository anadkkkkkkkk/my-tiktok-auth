<?php
require_once __DIR__ . '/../vendor/autoload.php';

$clientKey = 'sbawsdq1bxhkm3b3y';
$clientSecret = 'hddQpiSISFTstFFjEYxlfCWvNdvlfUXa';
$redirectUri = 'https://my-tiktok-auth.vercel.app/'; 

$api = new \JanStolpe\TikTokApi\TikTokApi($clientKey, $clientSecret, $redirectUri);

// Vercel Speed Insights initialization script
$speedInsightsScript = '<script>
  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
</script>
<script defer src="/_vercel/speed-insights/script.js"></script>';

if (isset($_GET['code'])) {
    try {
        $token = $api->getAccessToken($_GET['code']);
        echo '<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تم تسجيل الدخول بنجاح</title>
    ' . $speedInsightsScript . '
</head>
<body>
    <h1>تم تسجيل الدخول بنجاح لـ AWR!</h1>
    <pre>';
        print_r($token); 
        echo '</pre>
</body>
</html>';
    } catch (Exception $e) {
        echo '<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>خطأ</title>
    ' . $speedInsightsScript . '
</head>
<body>
    <p>خطأ: ' . $e->getMessage() . '</p>
</body>
</html>';
    }
} else {
    $url = $api->getAuthorizeUrl(['user.info.basic', 'video.list', 'video.upload']);
    echo '<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AWR Sandbox</title>
    ' . $speedInsightsScript . '
</head>
<body>
    <div style="text-align:center; margin-top:50px;">
        <h2>مرحباً بك في نظام AWR Sandbox</h2>
        <a href="' . $url . '" style="padding:15px 30px; background:#000; color:#fff; text-decoration:none; border-radius:5px;">تسجيل الدخول عبر TikTok</a>
    </div>
</body>
</html>';
}

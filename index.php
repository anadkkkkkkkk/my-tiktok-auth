<?php
// تفعيل إظهار الأخطاء لكشف المشكلة
error_reporting(E_ALL);
ini_set('display_errors', 1);

// التأكد من المسار الصحيح للمكتبة
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
} else {
    die('خطأ: مجلد vendor غير موجود في المسار الصحيح!');
}

$clientKey = 'sbawsdq1bxhkm3b3y';
$clientSecret = 'hddQpiSISFTstFFjEYxlfCWvNdvlfUXa';
$redirectUri = 'https://my-tiktok-auth.vercel.app/'; 

$api = new \JanStolpe\TikTokApi\TikTokApi($clientKey, $clientSecret, $redirectUri);

if (isset($_GET['code'])) {
    try {
        $token = $api->getAccessToken($_GET['code']);
        echo '<h1>تم تسجيل الدخول بنجاح!</h1><pre>';
        print_r($token); 
        echo '</pre>';
    } catch (Exception $e) {
        echo 'خطأ في التوكن: ' . $e->getMessage();
    }
} else {
    $url = $api->getAuthorizeUrl(['user.info.basic', 'video.list', 'video.upload']);
    echo '<div style="text-align:center; margin-top:50px; font-family:Arial;">
          <h2>مرحباً بك في نظام AWR Sandbox</h2>
          <p>إذا كنت ترى هذه الصفحة، فالسيرفر يعمل!</p>
          <a href="' . $url . '" style="padding:15px 30px; background:#000; color:#fff; text-decoration:none; border-radius:5px; display:inline-block; margin-top:20px;">تسجيل الدخول عبر TikTok</a>
          </div>';
}

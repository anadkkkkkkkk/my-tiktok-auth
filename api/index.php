<?php
require_once __DIR__ . '/../vendor/autoload.php';

$clientKey = 'sbawsdq1bxhkm3b3y';
$clientSecret = 'hddQpiSISFTstFFjEYxlfCWvNdvlfUXa';
$redirectUri = 'https://my-tiktok-auth.vercel.app/'; 

$api = new \JanStolpe\TikTokApi\TikTokApi($clientKey, $clientSecret, $redirectUri);
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AWR TikTok Authentication</title>
    <!-- Vercel Web Analytics -->
    <script defer src="https://cdn.vercel-insights.com/v1/script.js"></script>
</head>
<body>
<?php
if (isset($_GET['code'])) {
    try {
        $token = $api->getAccessToken($_GET['code']);
        echo '<h1>تم تسجيل الدخول بنجاح لـ AWR!</h1><pre>';
        print_r($token); 
        echo '</pre>';
    } catch (Exception $e) {
        echo 'خطأ: ' . $e->getMessage();
    }
} else {
    $url = $api->getAuthorizeUrl(['user.info.basic', 'video.list', 'video.upload']);
    echo '<div style="text-align:center; margin-top:50px;">
          <h2>مرحباً بك في نظام AWR Sandbox</h2>
          <a href="' . $url . '" style="padding:15px 30px; background:#000; color:#fff; text-decoration:none; border-radius:5px;">تسجيل الدخول عبر TikTok</a>
          </div>';
}
?>
</body>
</html>

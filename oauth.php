<?php
session_start();

require_once 'includes/OAuth2/Google/autoload.php';
$client = new Google_Client();
$client->setAuthConfigFile('includes/OAuth2/client_secret.json');
//$client->addScope("https://www.googleapis.com/auth/plus.login"); //openid profile email
$client->addScope("openid profile email");
$client->setRedirectUri('http://' . $_SERVER['HTTP_HOST'] . '/kibble/oauth.php');

if (isset($_GET['error'])) {
	echo 'error: ' . $_GET['error'];
	die();
}
if (isset($_GET['code'])) {
	$client->authenticate($_GET['code']);
	$access_token = $client->getAccessToken();
	$_SESSION['access_token'] = $access_token;
	
	$tokeninfo = json_decode($access_token, true);
	$id_token = $tokeninfo['id_token'];

	$access_token = $tokeninfo['access_token'];
	$_SESSION['id_token'] = $id_token;
	$json = file_get_contents('https://www.googleapis.com/oauth2/v1/userinfo?access_token='.$access_token);
	//$json = file_get_contents("https://www.googleapis.com/plus/v1/people/".$access_token);
	$userinfo = json_decode($json, true);
	$_SESSION['user_id'] = $userinfo['id'];
	$_SESSION['user_name'] = $userinfo['name'];
	$_SESSION['first_name'] = $userinfo['given_name'];
	$_SESSION['last_name'] = $userinfo['family_name'];
	$_SESSION['user_email'] = $userinfo['email'];
	$_SESSION['user_picture'] = $userinfo['picture'];
	$_SESSION['user_locale'] = $userinfo['locale'];
	header("Location: http://" . $_SERVER['HTTP_HOST'] . "/kibble");
	die();
}
if (isset($_GET['revoke'])) {
	$client->revokeToken();
	die();
}

$auth_url = $client->createAuthUrl();
header('Location: ' . filter_var($auth_url, FILTER_SANITIZE_URL));

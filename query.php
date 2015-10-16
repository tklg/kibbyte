<?php
session_start();

require_once 'includes/OAuth2/Google/autoload.php';

function checkToken() {
    //check to see if access token is still valid - use this before attempting to save files
    $ch = curl_init('https://www.googleapis.com/oauth2/v1/userinfo?access_token='.$_SESSION['token']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch,CURLOPT_SSL_VERIFYPEER, false);
    $json = curl_exec($ch);
    curl_close($ch);
    $response = json_decode($json);
    if(isset($response->issued_to)) {
    } else if(isset($response->error)) {
        getClient()->refreshToken($_SESSION['refresh_token']);
    }
}
function getClient() {
    $client = new Google_Client();
    //$client->setAuthConfigFile('includes/OAuth2/client_secret.json');
    //$client->setUseObjects(true);
    $client->setAccessToken($_SESSION['access_token']);
    return $client;
}
function getDriveService() {
    return $driveService = new Google_Service_Drive(getClient());
}
function testPrintMeta($service, $fileId) {
  try {
    $file = $service->files->get($fileId);

    print "Title: " . $file->getTitle();
    print "Description: " . $file->getDescription();
    print "MIME type: " . $file->getMimeType();
  } catch (apiException $e) {
    print "An error occurred: " . $e->getMessage();
  }
}
function getFilesInFolder($folder) {
    $params = array(
        'maxResults' => '1000',
        'q' => "'".$folder."' in parents"
    );
    $results = getDriveService()->files->listFiles($params);
    if (count($results->getItems()) == 0) {
      print "No files found.\n";
    } else {
        echo json_encode($results->getItems(), 128);
    }
}
//getFilesInFolder('root');
if (isset($_GET['file'])) {
    getFilesInFolder($_GET['file']);
}
if (isset($_POST['get_folder_contents'])) {
    getFilesInFolder($_POST['get_folder_contents']);
}
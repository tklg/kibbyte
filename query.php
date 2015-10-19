<?php
session_start();

require_once 'includes/OAuth2/Google/autoload.php';

function checkToken() {
    /*//check to see if access token is still valid - use this before attempting to save files
    $ch = curl_init('https://www.googleapis.com/oauth2/v1/userinfo?access_token='.$_SESSION['token']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch,CURLOPT_SSL_VERIFYPEER, false);
    $json = curl_exec($ch);
    curl_close($ch);
    $response = json_decode($json);*/
    /*if(isset($response->issued_to)) {
    } else if(isset($response->error)) {*/
    $client = getClient();
    if ($client->isAccessTokenExpired()) { //so convenient :p
        $client->refreshToken($_SESSION['refresh_token']);
        $access_token = $client->getAccessToken();
        $_SESSION['access_token'] = $access_token;
        $tokeninfo = json_decode($access_token);
        $_SESSION['token'] = $tokeninfo->access_token;
    }
}
function getClient() {
    $client = new Google_Client();
    $client->setAuthConfigFile('includes/OAuth2/client_secret.json');
    $client->setAccessToken($_SESSION['access_token']);
    return $client;
}
function getDriveService() {
    return $driveService = new Google_Service_Drive(getClient());
}
function downloadFile($id) {
    checkToken();
    $service = getDriveService();
    $url = $service->files->get($id)->getDownloadUrl();
    if ($url) {
        $request = new Google_Http_Request($url, 'GET', null, null);
        $http = $service->getClient()->getAuth()->authenticatedRequest($request);
        if ($http->getResponseHttpCode() == 200) {
            return $http->getResponseBody();
        } else {
            // An error occurred
            return null;
        }
    } else {
        // The file doesn't have any content stored on Drive
        return null;
    }
}
function updateFileContent($fileId, $newContent) {
    checkToken();
    $service = getDriveService();
    try {
        // First retrieve the file from the API.
        $file = $service->files->get($fileId);

        // File's new metadata.
        //$file->setTitle($newTitle);
        //$file->setDescription($newDescription);
        //$file->setMimeType($newMimeType);

        // File's new content.
        $data = $newContent;

        $additionalParams = array(
            //'newRevision' => $newRevision,
            //'mimeType' => $newMimeType,
            'data' => $data,
            'uploadType' => 'media'
        );

        // Send the request to the API.
        $updatedFile = $service->files->update($fileId, $file, $additionalParams);
        //return $updatedFile;
        print 'saved ' . $fileId;
    } catch (Exception $e) {
        print "An error occurred: " . $e->getMessage();
    }
}
function getFilesInFolder($folder) {
    checkToken();
    $params = array(
        'maxResults' => '1000',
        'orderBy' => 'title',
        'q' => "'".$folder."' in parents"
    );
    $results = getDriveService()->files->listFiles($params);
    if (count($results->getItems()) == 0) {
      //return "No files found.";
        return file_get_contents('includes/json/filenotfound.json');
    } else {
        return json_encode($results->getItems());
    }
}
//getFilesInFolder('root');
if (isset($_GET['file'])) {
    echo getFilesInFolder($_GET['file']);
}
if (isset($_POST['get_folder_contents'])) {
    echo getFilesInFolder($_POST['get_folder_contents']);
}
if (isset($_POST['get_file_contents'])) {
    echo downloadFile($_POST['get_file_contents']);
}
if (isset($_POST['set_file_contents'])) {
    updateFileContent($_POST['set_file_contents'], $_POST['content']);
}
/*if (isset($_GET['set_file_contents'])) {
    updateFileContent($_GET['set_file_contents'], $_GET['content']);
}*/
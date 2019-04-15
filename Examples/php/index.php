<?php
$authHeader = "authorization:" . $_COOKIE['token'];

$data = "{ authorizeUser(url: \"" . $_COOKIE['url'] . "\") }";
$payload = json_encode( array( "query"=> $data ) );
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://portal.arup.digital/graphql');
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt( $ch, CURLOPT_HTTPHEADER, array(
  'Content-Type:application/json',
  $authHeader
));
curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );

$response = curl_exec($ch);
curl_close($ch);
$result = json_decode($response, true);
$authorized = $result['data']['authorizeUser']['auth'];
?>


<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Test file</title>

    <script
      type="text/javascript"
      src="compiled.js"
    ></script>

  </head>

  <body>

    <div id="container">
      <div
        id="gallery"
        style="min-height:100vh; max-height:100vh;"
      >
      <?php
        if($authorized){
          echo "<div>this is hidden content to authorized users</div>";
        }
      ?>
        <div onclick="enterSite()">click me to set cookie</div>

      </div>
    </div>

    <script type="text/javascript">

      var auth0Options = {
        languageDictionary: {
          title: "My Viewer"
        },
        theme: {
          labeledSubmitButton: false,
          logo: "https://s3-ap-southeast-2.amazonaws.com/arupdigital-assets/logo.png",
          primaryColor: "#27AAE1"
        }
      };

      var authInfo = {
        title:"UUS Viewer",
        clientId:"XsRizzzA1C9i57X7ZupmpOrvD51MpgeL",
        domain:"arupdigital.au.auth0.com",
        options:{auth0Options}
      }

      var auth = new AuthProvider(authInfo)

      function enterSite(){
        document.cookie = 'token=' + auth.token + '; expires=Thu, 2 Aug 2019 20:47:11 UTC; path=/'
        document.cookie = 'url=' + window.location.origin + '; expires=Thu, 2 Aug 2019 20:47:11 UTC; path=/'
      }

    </script>
  </body>
</html>

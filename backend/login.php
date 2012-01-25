<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST') 
{
	session_start();

	$username = $_POST['username'];
	$passwort = $_POST['passwort'];

	$hostname = $_SERVER['HTTP_HOST'];
	$path = dirname($_SERVER['PHP_SELF']);

	// Benutzername und Passwort werden überprüft
	
	global $db;
	//$st = $db->query
	
	
	if ($username == 'benjamin' && $passwort == 'geheim') 
	{
		$_SESSION['userID'] = $username;

		// Weiterleitung zur geschützten Startseite
		if ($_SERVER['SERVER_PROTOCOL'] == 'HTTP/1.1')
		{
			if (php_sapi_name() == 'cgi') 
			{
				header('Status: 303 See Other');
			}
			else 
			{
				header('HTTP/1.1 303 See Other');
			}
		}

		header('Location: http://'.$hostname.($path == '/' ? '' : $path).'/index.php');
		exit;
	}
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="de" lang="de">
 <head>
  <title>Geschützter Bereich</title>
 </head>
 <body>
  <form action="login.php" method="post">
   Username: <input type="text" name="username" /><br />
   Passwort: <input type="password" name="passwort" /><br />
   <input type="submit" value="Anmelden" />
  </form>
 </body>
</html>

<?php

/**
 *	Einfaches Skript zum registrieren von Usern.
 * 	Diente lediglich dem Generieren von Test-Usern.
 *
 *	@author: Benjamin Gelhaar
 */

require_once "../includes/error_reporting.php";

require_once "../includes/config.php";
require_once "../includes/connect.php";

//Daten aus dem POST-Array holen
$username = $_POST['username'];
$pass1 = $_POST['pass1'];
$pass2 = $_POST['pass2'];
if($pass1 != $pass2)
    header('Location: ../../public_html/index.php');
if(strlen($username) > 30)
    header('Location: ../../public_html/index.php');

//hashen des Passworts
$hash = hash('sha256', $pass1);

//Salt erstellen
function createSalt()
{
    $string = md5(uniqid(rand(), true));
    return substr($string, 0, 3);
}

$salt = createSalt();

//Salt hinzufügen und erneut hashen
$hash = hash('sha256', $salt . $hash);

//User in die Datenbank schreiben
$st = $db->prepare("INSERT INTO users ( username, password, salt ) VALUES ( :username , :hash , :salt )");
$st->execute(array('username'=>$username,'hash'=>$hash,'salt'=>$salt));

//redirect auf Startseite
header('Location: ../../public_html/index.php');

?>
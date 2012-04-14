<?php

error_reporting(E_ALL);
ini_set("display_errors",1);

require_once "../includes/config.php";
require_once "../includes/connect.php";

//retrieve our data from POST
$username = $_POST['username'];
$pass1 = $_POST['pass1'];
$pass2 = $_POST['pass2'];
if($pass1 != $pass2)
    header('Location: ../../public_html/index.php');
if(strlen($username) > 30)
    header('Location: ../../public_html/index.php');
    
$hash = hash('sha256', $pass1);

function createSalt()
{
    $string = md5(uniqid(rand(), true));
    return substr($string, 0, 3);
}

$salt = createSalt();

$hash = hash('sha256', $salt . $hash);

$st = $db->prepare("INSERT INTO users ( username, password, salt ) VALUES ( :username , :hash , :salt )");
$st->execute(array('username'=>$username,'hash'=>$hash,'salt'=>$salt));

header('Location: ../../public_html/index.php');

?>
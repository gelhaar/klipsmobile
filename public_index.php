<?php

error_reporting(E_ALL);
ini_set("display_errors",1);

session_start();

require_once "../backend/auth/helpers.php";

if(!isLoggedIn())
{
	$doc = new DOMDocument();
	$doc->loadHTMLFile("../frontend/html/login.html");
	echo $doc->saveHTML();
	die();
}

$doc = new DOMDocument();
$doc->loadHTMLFile("../frontend/html/index.html");
echo $doc->saveHTML();

?>


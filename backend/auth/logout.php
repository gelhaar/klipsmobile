<?php
error_reporting(E_ALL);
ini_set("display_errors",1);

session_start();

$_SESSION = array(); //destroy all of the session variables
session_destroy();

header('Location: /klipsmobile/frontend/');
//exit;
?>
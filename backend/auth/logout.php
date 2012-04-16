<?php
/**
 *	Loggt den Benutzer aus: Leert und löscht die Session.
 *
 *	@author: Benjamin Gelhaar
 */
require_once "../includes/error_reporting.php";

session_start();

$_SESSION = array(); //destroy all of the session variables
session_destroy();

header('Location: ../../frontend/');
//exit;
?>
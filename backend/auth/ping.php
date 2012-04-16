<?php

require_once "../includes/error_reporting.php";
 
// Cookie auf 3 Minuten setzen
$lifetime=300;
session_start();
session_regenerate_id(true);
setcookie(session_name(),session_id(),time()+$lifetime);

?>
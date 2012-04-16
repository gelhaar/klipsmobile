<?php

/**
 *	Dieses Skript wird vom Frontend in einem festgelegten Zeitinterval aufgerufen.
 *	Es sorgt dafür dass der Cookie valide bleibt.
 *	
 *	Im Moment ist die Lebensdauer auf 5 Minuten gesetzt.
 *  
 *	@author: Benjamin Gelhaar
 */

require_once "../includes/error_reporting.php";
 
// Cookie auf 5 Minuten setzen
$lifetime=300;
session_start();
session_regenerate_id(true);
setcookie(session_name(),session_id(),time()+$lifetime);

?>

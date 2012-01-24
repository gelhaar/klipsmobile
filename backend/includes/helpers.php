<?php

/* These are helper functions */

function render($template,$vars = array())
{	
	// This function takes the name of a template and
	// a list of variables, and renders it.
	
	// This will create variables from the array:
	extract($vars);
	
	include "views/$template.php";
	
}

function dateToWeekday($date)
{
	// Konvertiert "YYYYMMDD" in Wochentag(0-6), So=0, Mo=1, ...
	
	$tmp = date("N", mktime(0, 0, 0,
		 (int)substr($date,4,2),
		 (int)substr($date,6,2),
		 (int)substr($date,0,4)));			// mktime: M-d-Y !
	if($tmp == 7)
		return 0;
	else
		return $tmp; 
}

function convertDate($date)
{
	//Konvertiert Monat aus 0-11er in 1-12er Format
	
	return date("Ymd", mktime(0, 0, 0,
		 (int)substr($date,4,2)+1,
		 (int)substr($date,6,2),
		 (int)substr($date,0,4)));
}

function convertToISO($date, $time)
{
	return date("Y-m-d\TH:i:s", mktime(
		 (int)substr($time,0,2), 
		 (int)substr($time,2,2),
		 (int)substr($time,4,2),
		 (int)substr($date,4,2),
		 (int)substr($date,6,2),
		 (int)substr($date,0,4)));		// mktime: H-m-s-M-d-Y
}

?>
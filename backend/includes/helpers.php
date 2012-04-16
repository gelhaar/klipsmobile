<?php

/**
 *	Verschiedene Helper Functions.
 *	@author Jonas Schophaus
 */


/** Nimmt Template-Namen und liste von Variablen und rendert diese*/ 
function render($template,$vars = array())
{	
	extract($vars);
	include "views/$template.php";	
}

/** Konvertiert "YYYYMMDD" in Wochentag(0-6), So=0, Mo=1, ...*/
function dateToWeekday($date)
{	
	$tmp = date("N", mktime(0, 0, 0,
		 (int)substr($date,4,2),
		 (int)substr($date,6,2),
		 (int)substr($date,0,4)));			// mktime: M-d-Y !
	if($tmp == 7)
		return 0;
	else
		return $tmp; 
}

/** Konvertiert Monat aus 0-11er in 1-12er Format */
function convertDate($date)
{	
	return date("Ymd", mktime(0, 0, 0,
		 (int)substr($date,4,2)+1,
		 (int)substr($date,6,2),
		 (int)substr($date,0,4)));
}

/** Konvertiert YYYYMMDD nach YYYY/MM/DD */
function convertDateToYYYYMMDD($date)
{	
	return date("Y/m/d", mktime(0, 0, 0,
		 (int)substr($date,4,2),
		 (int)substr($date,6,2),
		 (int)substr($date,0,4)));
}

/** Konvertiert YYYY/MM/DD to YYYYMMDD */
function dateStripSlashes($date)
{	
	return date("Ymd", mktime(0, 0, 0,
		 (int)substr($date,5,2),
		 (int)substr($date,8,2),
		 (int)substr($date,0,4)));
}

/** Konvertiert HHMMSS to HH.MM */
function convertTime($time)
{
	return substr($time,0,2).".".substr($time,2,2);
}

/** Konvertiert YYYYMMDD to YYYY-MM-DD'T'HH:MM:SS */
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
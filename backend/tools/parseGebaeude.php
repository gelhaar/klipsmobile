<?php

/**	
*	Dieses Skript fordert die unter http://www.uni-koeln.de/uni/gebaeude/liste.html
*	verfügbare Gebäudeliste der Uni Köln an und parst den HTML-Code nach den relevanten 
*	Informationen. Die gewonnenen Adressdaten werden genutzt, um zusätzlich mittels Google Geocoding
*	API den Längen- und Breitengrad zu ermitteln. Anschließend werden die Daten in
*	der gebaeude-Tabelle der Datenbank abgelegt.
*	Benötigt zur einmaligen (bzw. erneut bei Änderungen des Gebaeudeplans) Ermittlung
*	der benötigten Geodaten.
*	Benötigt:
*		min:	erstes Listenelement [int]
*		max:	letztes Listenelement [int]
*	Aus Performance-Gründen sollten die Gebäude in Clustern von maximal 100 verarbeitet werden.
*	Darf auf keinen Fall von außen aufrufbar sein. Direkter Datenbankzugriff!
*
*	@author: Jonas Schophaus
*/

require_once "simple_html_dom.php";
require_once "../includes/config.php";
require_once "../includes/connect.php";

$gebaeude = array();
$z = 0;

$source = file_get_html('http://www.uni-koeln.de/uni/gebaeude/liste.html');

//select relevant table
$table = $source->find('table',1);

//get each row
foreach($table->find('tr') as $row)
{
	//ignore table header
	if($i==0) {
		$i=1;
		continue;
	}
	if($z<$_GET['min']) {				//Werte manipulieren, maximal 100 gleichzeitig, performancebedingt
		$z++;
		continue;
	}
	else if($z>=$_GET['max']) {			//...
		insertDB($gebaeude);
	}
	
	
	//extract infos
	$nr = trim($row->find('td', 0)->plaintext);
	$name = $nr." ".$row->find('td', 2)->plaintext;
	$strasse = $row->find('td',3)->plaintext;
	
	//convert address to google input format
	$strasse_plus = preg_replace('/ /','+',$strasse);
	$replace = array( 'ä' => 'ae', 'ö' => 'oe', 'ü' => 'ue', 'ß' => 'ss');
	$strasse_plus = strtr($strasse_plus, $replace);
	
	//fetch geodata from google API
	$geodata = json_decode(file_get_contents(utf8_encode("http://maps.googleapis.com/maps/api/geocode/json?address=$strasse_plus,Koeln&sensor=false")), true);
	
	//Fehlschläge zählen
	if($geodata["status"] != "OK") $k++;	
	
	//extract data from response object
	$lat = $geodata["results"][0]["geometry"]["location"]["lat"];
	$long = $geodata["results"][0]["geometry"]["location"]["lng"];
	
	$gebaeude[] = array(
		"nr"		=>	$nr,
		"name"		=>  $name,
		"strasse"	=>  $strasse,
		"lat"		=>  $lat,
		"long"		=>	$long
	);
	
	//sleep for 0,2 seconds (Google API)
	usleep(200000);
	$z++;
}


/**
 *	Fügt ein Array von Gebauede Objekten in die Datenbank ein.
 */
function insertDB($gebaeude)
{
	global $db;
	
	foreach($gebaeude as $g)
	{
		extract($g);		
		$db->query(utf8_encode("INSERT INTO gebaeude VALUES ('$nr', '$name', '$strasse', $lat, $long)"));
	}
	exit;
}

?>
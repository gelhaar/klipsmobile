<?php

require_once "simple_html_dom.php";
require_once "../includes/config.php";
require_once "../includes/connect.php";

$gebaeude = array();
$z = 0;

$source = file_get_html('http://www.uni-koeln.de/uni/gebaeude/liste.html');
$table = $source->find('table',1);
foreach($table->find('tr') as $row)
{
	if($i==0) {
		$i=1;
		continue;
	}
	if($z<200) {				//Werte manipulieren, maximal 100 gleichzeitig, performancebedingt
		$z++;
		continue;
	}
	else if($z>=262) {			//...
		insertDB($gebaeude);
		echo $j."\n".$k."\n";
		var_dump($gebaeude);
		exit;
	}
	$nr = trim($row->find('td', 0)->plaintext);
	$name = $nr." ".$row->find('td', 2)->plaintext;
	$strasse = $row->find('td',3)->plaintext;
	$strasse_plus = preg_replace('/ /','+',$strasse);
	$replace = array( 'ä' => 'ae', 'ö' => 'oe', 'ü' => 'ue', 'ß' => 'ss');
	$strasse_plus = strtr($strasse_plus, $replace);
	
	
	//fetching geodata from google API
	$geodata = json_decode(file_get_contents(utf8_encode("http://maps.googleapis.com/maps/api/geocode/json?address=$strasse_plus,Koeln&sensor=false")), true);
	
	if($geodata["status"] != "OK") $k++;	
	$lat = $geodata["results"][0]["geometry"]["location"]["lat"];
	$long = $geodata["results"][0]["geometry"]["location"]["lng"];
	$plz = $geodata["results"][0]["address_components"][10]["long_name"];

	if($lat == NULL) $j++;
	
	$gebaeude[] = array(
		"nr"		=>	$nr,
		"name"		=>  $name,
		"strasse"	=>  $strasse,
		"lat"		=>  $lat,
		"long"		=>	$long
	);
	usleep(200000);
	$z++;
}

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
<?php

/**	
 *	Dieses Skript liest von der Seite des Kölner Studentenwerks die Speiseplan-
 *	Seiten aller Kölner Mensen für die aktuelle Woche ein und parsed die Gerichte
 *	und dazugehörige Preise heraus.
 *	Für jeden Wochentag werden die Gerichte in einer JSON-Datenstruktur als einzelne
 *	Datei im 'data'-Verzeichnis abgelegt.
 *	Dieser Task soll wöchentlich (sonntäglich) ausgeführt werden, sodass dort immer 
 *	die benötigten Daten der aktuellen Woche verfügbar sind.
 *
 *	@author Jonas Schophaus	
 */

require_once "simple_html_dom.php";
require_once "../includes/config.php";
require_once "../includes/connect.php";

//init
$mensen = array();
$departments = array();
$mensaId = 1;

//get source html: Alle Speisepläne
$source = file_get_html('http://www.kstw.de/index.php?option=com_content&view=article&id=182&Itemid=121&lang=de');
$tbody = $source->find('.Liste',0)->firstChild();

//foreach Mensa
foreach($tbody->find('tr') as $row)
{	
	//get link for Mensa
	$mensaName = $row->find('td',0)->find('a',0)->plaintext;
	$dieseWocheLink = $row->find('td',1)->find('a',2)->href;
	//get Mensa html
	$wochenplanSource = file_get_html("http://www.kstw.de".$dieseWocheLink);
	$speiseplan = $wochenplanSource->find('html body #page_margins #page #main #col3 #col3_content div.speiseplan', 0);
	
	//loop init
	$speiseplaene = array();
	$weekday = 1;
	//for each day's table
	foreach($speiseplan->find('table.speiseplan tbody') as $tbody)
	{	
		//loop init
		$departments = array();	
		$currentDepartment = array();
		$currentMeals = array();
				
		$isvalidDepartment = true;
		
		//
		foreach($tbody->find('tr') as $tr)
		{	
			$elementNr = count($tr->children());
						
			if($elementNr==5)
			{
				//table rows with 5 childNodes contain the name of the
				//department (e.g. Mensa Nord) the following meals belong to
				//plus first meal & price
				
				//if not first 
				if(!empty($currentDepartment))
				{
					//push meals to department object
					$currentDepartment["meals"] = $currentMeals;
					
					//push department object
					$departments[] = $currentDepartment;
					
					//reset meals
					$currentMeals = array();
				}
				
				//set current department name
				$currentDepartment["name"] = $tr->first_child()->firstChild()->plaintext;
				
				//replace '*' and footnotes, push to meals array
				$n = preg_replace ('#\(.*?\)#m' , '' , $tr->children(1)->plaintext); 
				$currentMeals[] = array(
					"name" => str_replace("*","",$n),
					"price" => $tr->children(2)->firstChild()->plaintext
				);

				//wenn kein feiertag oder dergleichen
				if(!$currentDepartment["name"] || $currentDepartment["name"] =="" || $currentDepartment["name"] == " ")
				{
					$isvalidDepartment = false;
				}

			} 
			else if($elementNr == 4) 
			{
				//table rows with 4 elements contain one meal & price,
				//belonging to the latest depatment
				
				if($tr->children(1)->firstChild()->plaintext != NULL)
				{
					//replace '*' and Zusatzstoffe footnotes, push to meals array
					$n = preg_replace ('#\(.*?\)#m' , '' , $tr->firstChild()->plaintext);
					$currentMeals[] = array(
						"name" => 	str_replace("*","",$n),
						"price" =>	$tr->children(1)->firstChild()->plaintext
					);
				}
			}
			else {
				$isvalidDepartment = false;
				continue;
			} 
		}
		
		//if valid department
		if($isvalidDepartment) 
		{
			//push last meals to last department 
			$currentDepartment["meals"] = $currentMeals;

			//push last department to array
			$departments[] = $currentDepartment;

			//reset meals
			$currentMeals = array();	
		}
		else {
			$isvalidDepartment = true;
			$currentDepartment = array();
			$currentMeals = array();
		}
				
		//push day's plan to speiseplaene array
		$speiseplaene[] = array(
			"weekday"	=>	$weekday,
			"departments" => $departments
		);
		$weekday++;
	}
	
	//push mensa to mensen array 
	$mensen[] = array(
		//"name"	=>	$mensaName,
		"id"	=>	$mensaId,
		"menus"	=>	$speiseplaene
	);
	
	$mensaId++;
}

/**
 *	Gibt ein als JSON kodiertes Objekt aus, das die Speisen aller Mensen
 *	für einen Wochentag $day (1-6) enthält.  
 */
function printDay($day)
{
	global $mensen;

	$outMensen = array();
	foreach($mensen as $mensa)
	{
		$outMenus = array();
		foreach($mensa['menus'][$day-1]['departments'] as $d)
		{
			$outMenus[] = $d;
		}
		$outMensen[] = array(
			"id" => $mensa['id'],
			"menus" => $outMenus
		);
	}
	return json_encode($outMensen);
}

//write json data for single weekdays to /data/mensa_weekdayX.json
for($i=1; $i<7; $i++)
{
	$handler = fOpen("../data/mensa_weekday$i.json", "w");
	fWrite($handler, printDay($i));
	fClose($handler);
}

?>
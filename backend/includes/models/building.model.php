<?php

/**
 * @author Jonas Schophaus */

class Building{
	
	/**
	 * Die getAll() Funktion ruft alle Datensätze
	 * aus der gebaeude-Tabelle der Datenbank ab,
	 * in denen Veranstaltungen stattfinden, die
	 * vom angemeldeten Benutzer belegt werden
	 * und liefert diese als array von Building-
	 * Objekten zurück.
	 */
	public static function getAll()
	{	
		global $db;
		$user = $_SESSION['username'];
										
		$st = $db->query(
			"SELECT DISTINCT gebaeude.*
			 FROM 	veranstaltung JOIN
					gebaeude JOIN
					userBelegung
			 ON		veranstaltung.gebäudeId = gebaeude.nr AND
					veranstaltung.nr = userBelegung.veranstNr
			 WHERE  `username` LIKE '$user'"
			);
		return $st->fetchAll();		
	}
	
	
	/**
	 * Die format() Funktion konvertiert das
	 * Eingabe-Array von Buildings in die für die
	 * Schnittstelle definierte Datenstruktur und
	 * gibt sie in einem result array zurück. 
	 */
	public static function format($buildings)
	{	
		$fBuildings = array();
		
		foreach($buildings as $b)
		{
			$fBuildings[] = array(
				"name"		=> $b["name"],
				"longitude"	=> $b["longitude"],
				"latitude"	=> $b["latitude"],
				"id"		=> $b["nr"]
				);
		}
		
		return array(
			"buildings"	=>	$fBuildings
			);
	}
}

?>
<?php

class Building{
	
	/*
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
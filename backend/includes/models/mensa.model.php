<?php

/**
 * @author Jonas Schophaus */

class Mensa{
	
	/**
	 * Die getAll() Methode holt alle Datensätze
	 * der mensa-Tabelle aus der DB und gibt sie
	 * als Array von Mensa-Objeken zurück.
	 */	
	public static function getAll()
	{	
		global $db;
										
		$st = $db->query(
			"SELECT * FROM mensa"
			);
		return $st->fetchAll();		
	}
	
	/**
	 * Die format Methode konvertiert ein Array
	 * von Mensa-Objekten ins Output-Format.
	 */	
	public static function format($mensen)
	{	
		$fMensen = array();
		
		foreach($mensen as $m)
		{
			$fMensen[] = array(
				"name"		=> $m["name"],
				"id"		=> $m["id"],
				"long"	=> $m["longitude"],
				"lat"	=> $m["latitude"]
			);
		}
		
		return array(
			"mensen"	=>	$fMensen
			);
	}
}

?>
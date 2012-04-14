<?php

class Mensa{
	
	/*
	*/
		
	public static function getAll()
	{	
		global $db;
										
		$st = $db->query(
			"SELECT * FROM mensa"
			);
		return $st->fetchAll();		
	}
	
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
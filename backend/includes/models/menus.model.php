<?php

/**
 * @author Jonas Schophaus */

class Menus{
	
	/**
	 * Die getCurrentMenus() Methode liefert
	 * ein JSON-Objekt mit den Speiseplänen des
	 * heutigen Wochentages zurück.
	 */	
	public static function getCurrentMenus()
	{	
		$weekday = date("N");
		return file_get_contents("data/mensa_weekday$weekday.json");
	}	
}

?>
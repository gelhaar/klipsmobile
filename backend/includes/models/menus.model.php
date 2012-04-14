<?php

class Menus{
	
	/*
	*/
		
	public static function getCurrentMenus()
	{	
		$weekday = date("N");
		return file_get_contents("data/mensa_weekday$weekday.json");
	}	
}

?>
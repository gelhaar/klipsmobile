<?php

class Event{
	
	/*
		The find static method selects events
		from the database and returns them as
		an array of Event objects.
	*/
	
	public static function find($command){
		
		global $db;
	
		if($command == "getAllPeriodic"){
			$st = $db->prepare("SELECT * FROM veranstaltung WHERE `frequenz` LIKE 'woche'");
		}
		else{
			throw new Exception("Unsupported property!");
		}
		
		$st->execute();
		
		// Returns an array of Event objects:
		return $st->fetchAll(PDO::FETCH_CLASS, "Event");
	}
	
	public static function format($events){
	
		$formattedEvents = $events;
		
		return $formattedEvents;
	
	}
	
}

?>
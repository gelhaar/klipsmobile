<?php

class Event{
	
	/*
		The find static method selects events
		from the database and returns them as
		an array of Event objects.
	*/
	
	// Overhead: type und allDay!
	// Gebäudename f. Roman
		
	// WHERE id IN (kursnrs des users)
	
	public static function find($command, $date = NULL)
	{	
		global $db;
		$user = "jschopha"; 	//testuser
		
		switch($command)
		{			
			case 'getSemesterzeiten':
				$dt = date("Ymd", time());
				$st = $db->prepare(
					"SELECT startVorl, endVorl
					 FROM	semesterzeiten
					 WHERE $dt BETWEEN `start` AND `ende`"
				);
				$st->execute();
								
				return array("semesterzeiten" => $st->fetchAll());
				break;
			
			case 'getAllPeriodic':
				$st = $db->prepare(	
					"SELECT veranstaltung.*,
							gebaeude.name AS gebäudename
					 FROM 	veranstaltung JOIN
							gebaeude
					 ON		veranstaltung.gebäudeId = gebaeude.nr
					 WHERE `frequenz` LIKE 'woche'"
				);
				$st->execute();
				return array("selectedVer"	=>	$st->fetchAll());
				break;
				
			case 'getPeriodicByDate':
				$givenWeekday = dateToWeekday(convertDate($date));
				$selectedEvents = array();
				foreach($db->query("SELECT veranstaltung.*, gebaeude.name AS gebäudename FROM veranstaltung JOIN gebaeude ON veranstaltung.gebäudeId = gebaeude.nr WHERE `frequenz` LIKE 'woche'") as $event)
				{
					$eventWeekday = dateToWeekday($event['startdatum']);
					if ($eventWeekday == $givenWeekday)
						$selectedEvents[] = $event;
				}				
				return array("selectedVer" => $selectedEvents);
				break;
				
				//SELECT * FROM veranstaltung WHERE `frequenz` LIKE 'woche' AND gebäudename FROM gebäude WHERE `gebäude.id` LIKE `veranstaltung.id`
				//SELECT veranstaltungen.*
				
			case 'getUniqueByDate':
				list($date1, $date2) = explode("-", $date);
				$date1 = convertDate($date1);
				$date2 = convertDate($date2);
				
				$st = $db->query(
					"SELECT veranstaltung.*,
							gebaeude.name AS gebäudename
					 FROM 	veranstaltung JOIN
							gebaeude
					 ON		veranstaltung.gebäudeId = gebaeude.nr
					 WHERE `frequenz` LIKE 'unique' AND
					 	   `startdatum` BETWEEN $date1 AND $date2"
				);
				$selVer = $st->fetchAll();
				
				$st = $db->query(
					"SELECT * 
					 FROM 	zusatz
					 WHERE 	`user` = '$user' AND
					 	   	`datum` BETWEEN $date1 AND $date2"
				);
				$selZus = $st->fetchAll();
				
				return array(
					"selectedVer"	=>	$selVer,
					"selectedZus"	=>  $selZus
				);
				break;
				
				case 'md5test':
					echo md5($date);
					exit;
								
			default:
				throw new Exception("Unsupported property!");
				break;
		}		
	}
	
	public static function format($events)
	{	
		extract($events);
		$formattedVer = array();
		$formattedZus = array();
		
		if(!empty($semesterzeiten))
		{
			$semesterzeiten = $semesterzeiten[0];
			return array(
				"startSemester" => convertToISO($semesterzeiten['startVorl'], "000000"),
				"endSemester" => convertToISO($semesterzeiten['endVorl'], "000000")
			);
		}
		
		if(!empty($selectedVer)) 
		foreach($selectedVer as $event)
		{
			if($event['frequenz'] == "woche")
			{				
				$formattedVer[] = array(
					"type" => "veranstaltung",		 //overhead
					"title" => $event['name'],
					"id" => $event['nr'],
					"category" => $event['kategorie'],
					"weekday" => dateToWeekday($event['startdatum']),
					"startTime" => $event['startzeit'],
					"endTime" => $event['endzeit'],
					"tutorId" => $event['dozentId'],
					"buildingId" => $event['gebäudeId'],
					"building" => $event['gebäudename'],
					"room" => $event['raumNr'],
					"allDay" => "false"
				);
			}
			else if($event['frequenz'] == "unique")
			{
				$formattedVer[] = array(
					"type" => "veranstaltung",			//overhead!
					"title" => $event['name'],
					"id" => $event['nr'],
					"category" => $event['kategorie'],
					"startTime" => convertToISO($event['startdatum'], $event['startzeit']),
					"endTime" => convertToISO($event['startdatum'], $event['endzeit']),
					"tutorId" => $event['dozentId'],
					"buildingId" => $event['gebäudeId'],
					"building" => $event['gebäudename'], 
					"room" => $event['raumNr'],
					"allDay" => "false"
				);
			}
		}
		
		if(!empty($selectedZus)) 
		foreach($selectedZus as $zusatz)
		{
			$formattedZus[] = array(
				"type" => "kommentar",				 //overhead!
				"id" => $zusatz['veranstaltungsID'],
				"date" => convertToISO($zusatz['datum'], "000000"),
				"title" => $zusatz['titel'],
				"allDay" => "false"
			);
		}
		
		$res = array();
		if(!empty($formattedVer)) $res['veranstaltungen'] = $formattedVer;
		if(!empty($formattedZus)) $res['kommentare'] = $formattedZus;
		return $res;
	}
}

?>
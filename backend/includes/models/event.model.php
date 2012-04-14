<?php

class Event{
	
	/*
		The find method selects events
		from the database and returns them as
		an array of Event objects.
	*/	
	public static function find($command, $jsondata = NULL)
	{	
		global $db;
		$user = $_SESSION['username'];
		
		switch($command)
		{			
			case 'get':
								
				//fetching all the users lectures  
				$st = $db->query(	
					"SELECT veranstaltung.*,
							gebaeude.name AS gebäudename
					 FROM 	veranstaltung JOIN
							gebaeude JOIN
							userBelegung
					 ON		veranstaltung.gebäudeId = gebaeude.nr AND
							veranstaltung.nr = userBelegung.veranstNr
					 WHERE  `username` LIKE '$user'"
				);
				$rawLectures = $st->fetchAll();
				
				//fetching all the users comments
				$st = $db->query(
					"SELECT * 
					 FROM 	zusatz
					 WHERE 	`user` = '$user'"
				);
				$comments = $st->fetchAll();
				
				return array(
					"rawLectures" 	=> $rawLectures,
					"comments"		=> $comments
				);
				break;
																				
			default:
				throw new Exception("Unsupported property!");
				break;
		}		
	}
	
	/*
		The format method converts the raw Lectures
		to the specified output format name conventions
		and returns them as a structured array.
	*/	
	public static function format($rawLectureData)
	{	
		extract($rawLectureData);
		$singleLectures = array();
		$recurringLectures = array();
				
		if(!empty($rawLectures))
		{
			foreach($rawLectures as $lecture)
				if($lecture['frequenz'] == "woche")
				{
					//linking matching comments
					$linkedComments = array();
					foreach($comments as $comment)
						if($comment['veranstaltungsID'] == $lecture['nr'])
						{
							$linkedComments[] = array(
								"date"	=>	convertDateToYYYYMMDD($comment['datum']),
								"text"	=>	$comment['titel']
							);
						}
				
					//converting to output format
					$recurringLectures[] = array(
						"title" => $lecture['name'],
						"id" => $lecture['nr'],
						"type" => $lecture['kategorie'],
						"weekday" => dateToWeekday($lecture['startdatum']),
						"startTime" => convertTime($lecture['startzeit']),
						"endTime" => convertTime($lecture['endzeit']),
						//"tutorId" => $lecture['dozentId'],
						"buildingId" => $lecture['gebäudeId'],
						//"building" => $lecture['gebäudename'],
						"room" => $lecture['raumNr'],
						"comments" => $linkedComments
					);
				}
			
				else if($lecture['frequenz'] == "unique")
				{
					//linking matching comment (max 1, SingleLecture)
					$linkedComment = "";
					foreach($comments as $comment)
						if($comment['veranstaltungsID'] == $lecture['nr'] && $comment['datum'] == $lecture['startdatum'])
							$linkedComment = $comment['titel'];
				
					//converting to output format
					$singleLectures[] = array(
						"title" => $lecture['name'],
						"id" => $lecture['nr'],
						"type" => $lecture['kategorie'],
						"startTime" => convertTime($lecture['startzeit']),
						"endTime" => convertTime($lecture['endzeit']),
						"date" => convertDateToYYYYMMDD($lecture['startdatum']),
						//"tutorId" => $lecture['dozentId'],
						"buildingId" => $lecture['gebäudeId'],
						//"building" => $lecture['gebäudename'],
						"room" => $lecture['raumNr'],
						"comment" => $linkedComment
					);			
				}
			}
		
		return array(
			"recurringLectures" => $recurringLectures,
			"singleLectures" => $singleLectures
		);
	}
}

?>
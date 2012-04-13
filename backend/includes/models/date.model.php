<?php

class Date{
	
	/*
		The getCurrentPeriod Method selects the current
		Periods dates from the database and returns them as
		an array of Date objects.
	*/	
	public static function getCurrentPeriod()
	{			
		global $db;
		
		$dt = date("Ymd", time());
		$st = $db->query(
			"SELECT startVorl, endVorl, start, ende
			 FROM	semesterzeiten
			 WHERE $dt BETWEEN `start` AND `ende`"
		);
						
		return $st->fetchAll();
	}
	
	/*
		The getCurrentPeriod Method selects the all 
		holiday dates from the database and returns them as
		an array of Date objects.
	*/
	public static function getHolidays()
	{
		global $db;
		
		$st = $db->query("SELECT * FROM feiertage");
		return $st->fetchAll();
		//var_dump($st->fetchAll());
		//exit;
	}
	
	/*
		The format function converts period and holiday
		date objects to match output format specifications
		and returns an array which is ready for rendering.
	*/
	public static function format($period, $holidays)
	{	
		$fPeriod = array();
		$fHolidays = array();
		
		//converting period to output format
		$fPeriod[] = array(
			"name"	=> "Semesterbeginn",
			"date"	=> convertDateToYYYYMMDD($period[0]["start"])
		);
		$fPeriod[] = array(
			"name" 	=> "Vorlesungsbeginn",
			"date"  => convertDateToYYYYMMDD($period[0]["startVorl"])
		);
		$fPeriod[] = array(
			"name"	=> "Vorlesungsende",
			"date"	=> convertDateToYYYYMMDD($period[0]["endVorl"])
		);
		$fPeriod[] = array(
			"name"	=> "Semesterende",
			"date"	=> convertDateToYYYYMMDD($period[0]["ende"])
		);
		
		//converting holidays to output format
		foreach($holidays as $h)
		{
			if(!($h["endDatum"]))
			{
				$fHolidays[] = array(
					"name"	=> $h["name"],
					"date"	=> convertDateToYYYYMMDD($h["datum"])
				);
			} else
			{
				$fHolidays[] = array(
					"name"	=> $h["name"],
					"date"	=> convertDateToYYYYMMDD($h["datum"]),
					"endDate" => convertDateToYYYYMMDD($h["endDatum"])
				);
			}
		}
		
		return array(
			"period" 	=> $fPeriod,
			"holidays"	=> $fHolidays
		);
	}
}

?>
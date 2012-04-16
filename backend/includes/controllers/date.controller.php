<?php

/**
 * Dieser Controller rendert Antworten auf Requests
 * nach Date-Objekten.
 *
 * @author Jonas Schophaus
 */

class DateController
{
	public function handleRequest($command)
	{	
		switch($command)
		{
			case 'get':
				$period = Date::getCurrentPeriod();
				$holidays = Date::getHolidays();
				break;
				
			default:
				throw new Exception("Unsupported property!");
				break;	
		}
		
		if(empty($period))
		{
			throw new Exception("Nothing found");
		}
		
		$formattedDates = Date::format($period, $holidays);
		render('date',array(
			'dates'	=> $formattedDates
		));		
	}
}

?>
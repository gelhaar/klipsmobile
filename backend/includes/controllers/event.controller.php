<?php

/* This controller renders the event pages */

class EventController
{
	public function handleRequest($command, $date = NULL)
	{	
		$events = Event::find($command, $date);
		
		if(empty($events))
		{
			throw new Exception("Nothing found");
		}
		
		$formattedEvents = Event::format($events);
		
		render('event',array(
			'events'	=> $formattedEvents
		));		
	}
}

?>
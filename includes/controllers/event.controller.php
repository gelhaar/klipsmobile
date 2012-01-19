<?php

/* This controller renders the event pages */

class EventController{
	public function handleRequest($command){
		
		$events = Event::find($command);
		
		if(empty($events)){
			throw new Exception("Nothing found");
		}
		
		$formattedEvents = Event::format($events);
		
		render('event',array(
			'events'	=> $formattedEvents
		));		
	}
}


?>
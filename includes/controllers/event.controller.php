<?php

/* This controller renders the event pages */

class EventController{
	public function handleRequest($command){
		
		$events = Event::find($command);
		
		if(empty($events)){
			throw new Exception("Nothing found");
		}
		
		render('event',array(
			'events'	=> $events
		));		
	}
}


?>
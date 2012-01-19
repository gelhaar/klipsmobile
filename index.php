<?php

error_reporting(E_ALL);
ini_set("display_errors",1);

/*
	This is the index file of our simple website.
	It routes requets to the appropriate controllers
*/

require_once "includes/main.php";

try {

	if($_GET['command']){
	
		switch ($_GET['command']) {
			
			case "getAllPeriodic":
				$c = new EventController();
				break;
				
			case "GetPeriodicEventsFor":
				
				break;
				
		}
	
	}
	else if(empty($_GET)){
		echo "Kein Command!";
	}
	else throw new Exception('Wrong page!');

	$c->handleRequest($_GET['command']);
}
catch(Exception $e) {
	// Display the error page using the "render()" helper function:
	render('error',array('message'=>$e->getMessage()));
}

?>
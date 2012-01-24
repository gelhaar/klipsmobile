<?php

error_reporting(E_ALL);
ini_set("display_errors",1);

/*
	This is the index file of our simple website.
	It routes requets to the appropriate controllers
*/

require_once "includes/main.php";

try {
	
	if($_GET['type'] && $_GET['command']) {

		switch ($_GET['type']) {
			
			case "event":
				$c = new EventController();
				break;
				
			case "building":
				
				break;
		}
	}
	else if(empty($_GET)){
		echo "Kein Command!";
	}
	else throw new Exception('Missing Parameters!');
	
	$c->handleRequest($_GET['command'], $_GET['date']);

}
catch(Exception $e) {
	// Display the error page using the "render()" helper function:
	render('error',array('message'=>$e->getMessage()));
}

?>
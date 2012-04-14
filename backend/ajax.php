<?php

error_reporting(E_ALL);
ini_set("display_errors",1);

/*
	This is the index file of our simple website.
	It routes requets to the appropriate controllers
*/

//init session
session_start();

//get all required files
require_once "includes/main.php";

try {
	if(!isLoggedIn()) throw new Exception('Not logged in!');
	$jsonString = str_replace("\\","",$_POST['json']);
	$jsondata = array();
	if($_POST['json']) 
		$jsondata = json_decode($jsonString, true);
		
	if($_POST['type'] && $_POST['request']) 
	{	
		switch ($_POST['request'])
		{			
			case "Lectures":
				$c = new EventController();
				break;
				
			case "Buildings":
				$c = new BuildingController();
				break;
				
			case "Dates":
				$c = new DateController();
				break;
				
			case "Comment":
				$c = new CommentController();
				break;
				
			case "User":
				$c = new UserController();
				break;
				
			case "Mensen":
				$c = new MensaController();
				break;
				
			case "Menus":
				$c = new MenusController();
				break;
				
			default:
				throw new Exception('Unkown Parameter!');
				break;
		}
	}
	else if(empty($_POST))
	{
		throw new Exception('Missing Parameters!');
	}
	else throw new Exception('Missing Parameters!');
	
	$c->handleRequest($_POST['type'], $jsondata);

}

catch(Exception $e) 
{
	// Display the error page using the "render()" helper function:
	render('error',array('message'=>$e->getMessage()));
}

?>
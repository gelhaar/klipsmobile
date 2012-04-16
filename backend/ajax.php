<?php

require_once "includes/error_reporting.php";

/**
 *	Dies ist der Index-File unseres API.
 *	Er leitet den Request und gegebenenfalls zusätzliche als JSON
 *	empfangene Parameter an den für den angefragte Objekttyp 
 *	zuständigen Controller weiter.
 *	Der Zugriff auf die API erfordert eine vorhergehende
 *	erfolgreiche Authentifizierung.
 *	
 *	Jeder Request erfordert mindestens folgende POST-Paramter:
 *		request = [Objektklasse]
 *		type	= [Request-Art]
 *	Optional:	
 *		(json	= [JSON-Objekt])
 *  
 *	@author: Jonas Schophaus, Benjamin Gelhaar
 */

//init session
session_start();

//get all required files
require_once "includes/main.php";

try {
	if(!isLoggedIn()) throw new Exception('Not logged in!');
	
	$jsondata = array();
	
	if(isset($_POST['json'])) 
	{	
		//Fix für php 5.2
		$jsonString = str_replace("\\","",$_POST['json']);
		//json to array
		$jsondata = json_decode($jsonString, true);
	}
	
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
	// display error page using render() function:
	render('error',array('message'=>$e->getMessage()));
}

?>
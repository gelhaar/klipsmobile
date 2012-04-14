<?php

class User{
	
	/*
		Gets information about the User and the Session
	*/	
	public static function getSessionName()
	{	
	
		if (!$_SESSION['username']) throw new Exception('Session Problem!'); 
		
		return  array("username" => $_SESSION['username']);		
	
	}
	
	public static function validateSession()
	{
		$status = array("session" => "invalid");
		
		if (isLoggedIn()){
			$status["session"] = "valid";
		}
		
		return $status;
	}
	
}

?>
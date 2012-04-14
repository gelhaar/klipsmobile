<?php

/* This controller renders the event pages */

class MenusController
{
	public function handleRequest($command)
	{	
		switch($command)
		{
			case 'get':
				$menus = Menus::getCurrentMenus();
				break;
				
			default:
				throw new Exception("Unsupported property!");
				break;	
		}
		
		if(empty($menus))
		{
			throw new Exception("Nothing found");
		}

		render('menus',array(
			'menus'	=> $menus
		));		
	}
}

?>
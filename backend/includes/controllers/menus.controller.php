<?php

/**
 * Dieser Controller rendert Antworten auf Requests
 * nach Menus-Objekten.
 *
 * @author Jonas Schophaus
 */

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
<?php

/**
 * Dieser Controller rendert Antworten auf
 * Requests nach Buildings.
 *
 * @author Jonas Schophaus
 */

class BuildingController
{
	public function handleRequest($command)
	{	
		switch($command)
		{
			case 'get':
				$buildings = Building::getAll();
				break;
				
			default:
				throw new Exception("Unsupported property!");
				break;	
		}
		
		if(empty($buildings))
		{
			throw new Exception("Nothing found");
		}
		
		$formattedBuildings = Building::format($buildings);
		render('building',array(
			'buildings'	=> $formattedBuildings
		));			
	}
}

?>
<?php

/* This controller renders the event pages */

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
		//echo json_encode($formattedBuildings);
		render('building',array(
			'buildings'	=> $formattedBuildings
		));		
		
	}
}

?>
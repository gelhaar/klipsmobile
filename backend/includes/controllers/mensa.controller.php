<?php

/* This controller renders the event pages */

class MensaController
{
	public function handleRequest($command)
	{	
		switch($command)
		{
			case 'get':
				$mensen = Mensa::getAll();
				break;
				
			default:
				throw new Exception("Unsupported property!");
				break;	
		}
		
		if(empty($mensen))
		{
			throw new Exception("Nothing found");
		}
		
		$formattedMensen = Mensa::format($mensen);
		//echo json_encode($formattedBuildings);
		render('mensa',array(
			'mensen'	=> $formattedMensen
		));		
		
	}
}

?>
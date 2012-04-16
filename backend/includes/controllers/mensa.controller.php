<?php

/**
 * Dieser Controller rendert Antworten auf Requests
 * nach Mensa-Objekten.
 *
 * @author Jonas Schophaus
 */

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
		render('mensa',array(
			'mensen'	=> $formattedMensen
		));		
		
	}
}

?>
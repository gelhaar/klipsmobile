<?php

/**
 * Dieser Controller rendert Antworten auf
 * Comment-Requests.
 *
 * @author Jonas Schophaus
 */

class CommentController
{
	public function handleRequest($command, $comment)
	{	
		switch($command)
		{
			case 'set':
				$response = Comment::setComment($comment);
				break;

			case 'delete':
				$response = Comment::deleteComment($comment);
				break;
				
			default:
				throw new Exception("Unsupported property!");
				break;	
		}
		
		if(empty($response))
		{
			$response = false;
		}
		
		$formattedResponse = Comment::formatResponse($response);
		render('comment',array(
			'comments'	=> $formattedResponse
		));		
	}
}

?>
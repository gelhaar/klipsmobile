<?php

/**
 * @author Jonas Schophaus */

class Comment{
	
	/**
	 *	Die setComment Methode pusht einen neuen Comment
	 *	in die Datenbank oder überschreibt einen bereits
	 *	existierenden Comment am gleichen Datum zur
	 *	gleichen Lecture.
	 *	Erfordert input comment im format:
	 *		Array => 
	 *			[
	 *				id		=>	[id]
	 *				date	=>	[YYYY/MM/DD]
	 *				comment =>	[string]
	 *			]
	 */	
	public static function setComment($inputcomment)
	{	
		global $db;
		$user = $_SESSION['username'];
		
		try {
			extract($inputcomment);
			$qdate = dateStripSlashes($date);
			
			//check if comment for specific lecture and date already in database
			$st = $db->query(utf8_encode(
				"SELECT * FROM zusatz 
				 WHERE 	`user` LIKE '$user' AND
				 		`veranstaltungsID` = '$id' AND
						`datum` = '$qdate'"
				));
			$qresponse = $st->fetchAll();
		
			//if comment already exists, delete...
			if(!empty($qresponse))
			{
				$r = Comment::deleteComment($inputcomment);
				if (!$r) throw new Exception('Unknown Error'); 
			}
			
			//...and (over)write
			$st = $db->exec(utf8_encode(
				"INSERT INTO zusatz (user, veranstaltungsID, titel, datum) VALUES ('$user', '$id', '$comment', '$qdate')"
				));
			return true;
		}
		
		catch(Exception $e) {
			return false;
		}
	}
	
	
	/**
	 * Die deleteComment() Methode löscht einen
	 * Comment in der Datenbank.
	 * Erfordert input comment im Format:
	 *		Array => 
	 *			[
	 *				id		=>	[id]
	 *				date	=>	[YYYY/MM/DD]
	 *			]
	 */
	public static function deleteComment($inputcomment)
	{
		global $db;
		$user = 'jschopha';			//testuser
		
		try {
			extract($inputcomment);
			$qdate = dateStripSlashes($date);

			//delete inputcomment
			$st = $db->exec(utf8_encode(
				"DELETE FROM zusatz
				 WHERE 	`user` LIKE '$user' AND
				 		`veranstaltungsID` = '$id' AND
						`datum` = '$qdate'"
				));
			if($st<1) return false;
			return true;
		}
		
		catch(Exception $e) {
			return false;
		}
	}
	
	
	/**
	 * Liefert eine Status-Meldung als Comment-
	 * Response-Objekt zurück.
	 */
	public static function formatResponse($bool)
	{	
		if($bool) $status = "OK";
		else $status = "ERROR";
		return array(
			"status"	=> $status
			);
	}
}

?>
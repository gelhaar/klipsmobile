<?php

class Comment{
	
	/*
		The setComment method pushes a new comment to the
		database or overwrites a comment on the same date
		and lecture.
	*/	
	public static function setComment($inputcomment)
	{	
		global $db;
		$user = 'jschopha';			//testuser
		
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
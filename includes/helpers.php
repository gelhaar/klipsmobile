<?php

/* These are helper functions */

function render($template,$vars = array()){
	
	// This function takes the name of a template and
	// a list of variables, and renders it.
	
	// This will create variables from the array:
	extract($vars);
	
	include "views/$template.php";
	
}

?>
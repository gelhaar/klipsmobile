<?php

require_once "simple_html_dom.php";
require_once "../includes/config.php";
require_once "../includes/connect.php";

$source = file_get_html('http://www.kstw.de/index.php?option=com_speiseplan&id=182&Itemid=121&mid=10&zeit=heute&lang=de');
$table = 0;
foreach($source->find('table') as $t)
{
	if($t->class == 'speiseplan')
	{
		$table = $t;//->find('tbody',0);
		break;
	} 
}
var_dump($table); exit;
foreach($table->find('tr') as $row) echo "hi";//$row->find('td',0); 


//$table = $source->find('table',1);
//foreach($table->find('tr') as $row)


?>
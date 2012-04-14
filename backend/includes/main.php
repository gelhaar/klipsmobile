<?php

/*
	This is the main include file.
	It is only used in index.php and keeps it much cleaner.
*/

require_once "tools/simple_html_dom.php";

require_once "includes/config.php";
require_once "includes/connect.php";
require_once "includes/helpers.php";

require_once "auth/helpers.php";

require_once "includes/models/user.model.php";
require_once "includes/controllers/user.controller.php";

require_once "includes/models/event.model.php";
require_once "includes/controllers/event.controller.php";
require_once "includes/models/date.model.php";
require_once "includes/controllers/date.controller.php";
require_once "includes/models/building.model.php";
require_once "includes/controllers/building.controller.php";
require_once "includes/models/comment.model.php";
require_once "includes/controllers/comment.controller.php";
require_once "includes/models/mensa.model.php";
require_once "includes/controllers/mensa.controller.php";
require_once "includes/models/menus.model.php";
require_once "includes/controllers/menus.controller.php";



// This will allow the browser to cache the pages of the store.
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: max-age=3600, public');
header('Pragma: cache');
header("Last-Modified: ".gmdate("D, d M Y H:i:s",time())." GMT");
header("Expires: ".gmdate("D, d M Y H:i:s",time()+3600)." GMT");

?>
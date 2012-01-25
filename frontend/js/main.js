$(document).ready(function(){//$("#aktuelles").live("pageinit", function(){

	handler = new moduleHandler();
	handler.registerModule("calendar", new calendar(handler, "calendarContainer"));
	
});
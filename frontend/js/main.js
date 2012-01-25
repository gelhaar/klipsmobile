$("#aktuelles").live("pageinit", function(){
	
	handler = new moduleHandler();
	
	handler.registerModule("calendar", new calendar(handler, "calendarContainer"));
	
//	console.log(handler.getModule("calendar").getNextEvent(new Date()));
	
});
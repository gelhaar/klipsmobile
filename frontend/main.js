$(document).ready() {
	
	//init module handler
	handler = new moduleHandler();
	
	//register modules
	handler.registerModule("calendar", new calendar(handler, "insert container ID"));
	//...
	
}
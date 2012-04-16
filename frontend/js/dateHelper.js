/**
 * Hilfsklasse für Umwandlung von Date-Objekten in Strings.
 * @author Roman Quiring
 */

function dateHelper() {
	
	//Konstruktor
	if(typeof(_dateHelper_prototype_called) === "undefined") {
		_dateHelper_prototype_called = true;
		dateHelper.prototype.getDateString = getDateString;
		dateHelper.prototype.getTimeString = getTimeString;
		dateHelper.prototype.getWeekDayString = getWeekDayString;
		dateHelper.prototype.getDateSlashString = getDateSlashString;
	}
	
	/**
	 * Konvertiert ein date in einen String der Form DD.MM.YYYY.
	 * @param date ein date-Objekt.
	 * @returns {String}
	 */
	function getDateString(date) {
		var year = date.getFullYear();
		
		var month = date.getMonth() + 1;
		if(month < 10) 
			month = "0"+month;
		
		var day = date.getDate();
		if(day < 10)
			day = "0"+day;

		var dateString = day+"."+month+"."+year;
		return dateString;
	};

	/**
	 * Konvertiert ein date in einen String der Form HH.MM
	 * @param date ein date-Objekt.
	 * @returns {String}
	 */
	function getTimeString(date) {
		var hours = date.getHours();
		
		var minutes = date.getMinutes();
		if(minutes < 10)
			minutes = "0"+minutes;
		
		var date = hours+"."+minutes;
		return date;
	};
	
	/**
	 * Gibt den Wochentag eines dates als String zurück.
	 * @param date ein date-Objekt.
	 * @returns {String}
	 */
	function getWeekDayString(date) {
		var weekdays = new Array("Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag");
		return weekdays[date.getDay()];
	}
	
	/**
	 * Konvertiert ein date in einen String der Form YYYY/MM/DD.
	 * @param date ein date-Objekt.
	 * @returns {String}
	 */
	function getDateSlashString(date) {
		var year = date.getFullYear();
		
		var month = date.getMonth() + 1;
		if(month < 10) 
			month = "0"+month;
		
		var day = date.getDate();
		if(day < 10)
			day = "0"+day;

		return year+"/"+month+"/"+day;
	}

};
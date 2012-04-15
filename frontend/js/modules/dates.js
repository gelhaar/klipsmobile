/**
 * Termine-Modul.
 * @author Roman Quiring
 */

function dates() {
	
	 //enthält ein Array mit date-Objekten der Semester- und Vorlesungszeiten sowie die Vorlesungszeiten als Attribute
	var period = new Array();
	
	//enthält ein Array mit date-Objekten der Feiertage
	var holidays = new Array();
	
	//Konstruktor
	if(typeof(_dates_prototype_called) === "undefined") {
		_dates_prototype_called = true;
		dates.prototype.period = period;
		dates.prototype.holidays = holidays;
		dates.prototype.initDateView = initDateView;
		dates.prototype.getNextDates = getNextDates;
		
		initDates();
	}
	
	/**
	 * Führt einen AJAX-Request aus und befüllt die Termine-Arrays.
	 */
	function initDates() {
		$.ajax({
			async: false,
			type: "POST",
			url: "../backend/ajax.php",
			data: "request=Dates&type=get",
			dataType: "json",
			success: function(data) {
				
				for (var int = 0; int < data.period.length; int++) {
					var date = new Object();
					date.date = new Date(data.period[int].date);
					date.name = data.period[int].name;
					
					//wichtig für den Stundenplan
					if(date.name === "Vorlesungsbeginn")
						period.lectureStart = date.date;
					else if(date.name === "Vorlesungsende")
						period.lectureEnd = date.date;
					
					period.push(date);
				}
				
				for (var int = 0; int < data.holidays.length; int++) {
					var holiday = new Object();
					holiday.name = data.holidays[int].name;
					holiday.date = new Date(data.holidays[int].date);
					if(data.holidays[int].endDate !== undefined)
						holiday.endDate = new Date(data.holidays[int].endDate);
					
					holidays.push(holiday);
				}
			}
		});
	}
	
	/**
	 * Füllt den "Termine"-Tab mit einer Liste aller Termine.
	 */
	function initDateView() {
		$("#termine > ul").append("<li data-role='list-divider'>Semesterzeiten:</li>");
			
		for (var int = 0; int < period.length; int++) {
			var date = period[int];
			$("#termine > ul").append("<li>"+date.name+"<div>"+dateHelper.getDateString(date.date)+"</div></li>");
		}
			
		$("#termine > ul").append("<li data-role='list-divider'>Feiertage:</li>");
		
		for (var int = 0; int < holidays.length; int++) {
			var holiday = holidays[int];
			if(holiday.endDate === undefined)
				$("#termine > ul").append("<li>"+holiday.name+"<div>"+dateHelper.getDateString(holiday.date)+"</div></li>");
			else
				$("#termine > ul").append("<li>"+holiday.name+"<div>"+dateHelper.getDateString(holiday.date)+" - "+dateHelper.getDateString(holiday.endDate)+"</div></li>");
		}
	};
	
	/**
	 * Gibt die kommenden Termine zurück. 
	 * Anzahl der zu überprüfenden Tage und maximale Anzahl der Termine sind optionale Parameter.
	 * @param numDays Anzahl der zu überprüfenden Tage. Default: 3.
	 * @param numDates maximale Anzahl der Termine. Default: 3.
	 * @returns {Array}
	 */
	function getNextDates(numDays, numDates) {
		
		var days = (numDays === undefined || numDays === null) ? 3 : numDays;
		var maxDates = (numDates === undefined || numDates === null) ? 3 : numDates;
		
		var currentTime = new Date().getTime(); 
		var maxTime = currentTime + (86400000 * days); 
		
		var upcomingEvents = new Array();
		
		//Semesterdaten
		for (var int = 0; int < period.length; int++) {
			var periodDate = period[int];
			if(periodDate.date.getTime() >= currentTime && periodDate.date.getTime() < maxTime)
				upcomingEvents.push(periodDate);
		}
		
		//Feiertage
		for (var int = 0; int < holidays.length; int++) {
			var holiday = holidays[int];
			
			if(holiday.endDate !== undefined) {
				if(holiday.endDate.getTime() >= currentTime && holiday.endDate.getTime() < maxTime)
					upcomingEvents.push(holiday);
			}
			else if(holiday.date.getTime() >= currentTime && holiday.date.getTime() < maxTime)
				upcomingEvents.push(holiday);
		}
		
		var dateSorter = function (date1, date2) {
			if (date1.date > date2.date)
				return 1;
			
			if (date1.date < date2.date) 
				return -1;
			
			return 0;
		};
		upcomingEvents.sort(dateSorter);

		if(upcomingEvents.length > maxDates)
			upcomingEvents = upcomingEvents.slice(0, maxDates);
	
		return upcomingEvents;
	}
	
}
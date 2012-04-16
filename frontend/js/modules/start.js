/**
 * Aktuelles-Modul
 * @author Roman Quiring
 */

function start() {
	
	//Konstruktor
	if(typeof(_start_prototype_called) === "undefined") {
		_start_prototype_called = true;
		start.prototype.initStartPage = initStartPage;
	}
	
	/**
	 * Füllt den "Aktuelles"-Tab mit einer Liste der kommenden Veranstaltungen und Termine.
	 */
	function initStartPage() {
		
		var eventList = $("<ul data-role='listview' data-inset='true'></ul>");
			
		//Veranstaltungen
		$(eventList).append("<li data-role='list-divider'>Veranstaltungen:</li>");
		
		var lectures = schedule.getNextLectures();
		
		if(lectures.length === 0) {
			$("<li><div>keine Veranstaltungen in den kommenden 3 Tagen.</div></li>").appendTo(eventList);
		}
		
		for (var int = 0; int < lectures.length; int++) {
			var lecture = lectures[int];

			var day;
			if(lecture.start.getDay() === new Date().getDay())
				day = "heute";
			else if(lecture.start.getDay() === new Date().getDay() + 1)
				day = "morgen";
			else
				day = dateHelper.getWeekDayString(lecture.start);
			
			var lectureEntry;
			
			if(lecture.comment === "") {
				lectureEntry = $("<li>" +
						"<a href='#'>" + lecture.title + 
							"<div>"+day+", "+lecture.startTime+" - "+lecture.endTime+"</div>" + 
						"</a></li>");
			}
			else {
				lectureEntry = $("<li>" +
						"<a href='#'>" + lecture.title + 
							"<div>"+day+", "+lecture.startTime+" - "+lecture.endTime+"</div>" + 
							"<div class='comment'>"+lecture.comment+"</div>" + 
						"</a></li>");
			}
			
			$(lectureEntry)
				.data("lecture", lecture)
				.bind("tap", function() {
					schedule.showLecture($(this).data("lecture"));
				})
				.appendTo(eventList);
		}
		
		//Termine
		$(eventList).append("<li data-role='list-divider'>Termine:</li>");
		
		var nextDates = dates.getNextDates(7, null);
		
		if(nextDates.length === 0) {
			$("<li><div>keine Termine in der nächsten Woche.</div></li>").appendTo(eventList);
		}
		
		for (var int = 0; int < nextDates.length; int++) {
			var date = nextDates[int];
			
			var dateEntry;
			if(date.endDate === undefined)
				dateEntry = 
					"<li>" + date.name + 
						"<div>" + dateHelper.getWeekDayString(date.date) + ", " + dateHelper.getDateString(date.date) + "</span>" + 
					"</li>";
			else
				dateEntry = 
					"<li>" + date.name + 
						"<div>" +
							dateHelper.getWeekDayString(date.date) + ", " + dateHelper.getDateString(date.date) + " - " +
							dateHelper.getWeekDayString(date.endDate) + ", " + dateHelper.getDateString(date.endDate) +
						"</div>" + 
					"</li>";
			$(dateEntry).appendTo(eventList);
		}
		
		$("#upcomingEvents").html(eventList);
	}
	
}
/**
 * Stundenplan-Modul.
 * @author Roman Quiring
 */

function schedule() {
	
	var singleLectures = null;
	var recurringLectures = null;
	
	var allHolidays = new Array();
	
	var calendar;

	//Konstruktor
	if(typeof(_schedule_prototype_called) === "undefined") {
		_schedule_prototype_called = true;
		schedule.prototype.initScheduleView = initScheduleView;
		schedule.prototype.getNextLectures = getNextLectures;
		schedule.prototype.render = render;
		schedule.prototype.showLecture = showLecture;
		
		initLectures();
		initHolidays();
	}

	/**
	 * Führt einen AJAX-Request aus und initialisiert die Veranstaltungs-Arrays.
	 */
	function initLectures() {
		$.ajax({
			async: false,
			type: "POST",
			url: "../backend/ajax.php",
			data: "request=Lectures&type=get",
			dataType: "json",
			success: function(data) {
				recurringLectures = data.recurringLectures;
				singleLectures = data.singleLectures;
			}
		});
	}
	
	/**
	 * Befüllt das allHolidays-Array mit Date-Objekten der im Termin-Modul zur Verfügung stehenden Termine.
	 */
	function initHolidays() {
		for (var int = 0; int < dates.holidays.length; int++) {
			var holiday = dates.holidays[int];
			
			var holidayDate = new Date(holiday.date);
			if(holiday.endDate !== undefined) {
				while(holidayDate.getTime() <= new Date(holiday.endDate)) {
					allHolidays.push(holidayDate.getTime());			
					holidayDate = new Date(holidayDate.getTime() + 86400000); //Inkrement: 1 Tag
				}
			}
			else
				allHolidays.push(holidayDate.getTime());	
		}
	}
	
	/**
	 * Initialisiert den Stundenplan und seine Optionen und zeigt ihn im "Stundenplan"-Tab an.
	 */
	function initScheduleView() {
		initSchedule();
		
		$("#nextDayButton").live("tap", function(){
			calendar.fullCalendar("next");
		});
		$("#previousDayButton").live("tap", function(){
			calendar.fullCalendar("prev");
		});
		$("#weekViewButton").live("tap", function(){
			if(calendar.fullCalendar("getView").name === "agendaDay") {
				calendar.fullCalendar("changeView", "agendaWeek");
			}
			else {
				calendar.fullCalendar("changeView", "agendaDay");
			}
		});
	}
	
	/**
	 * Initialisiert den Stundenplan.
	 */
	function initSchedule() {

		calendar = $("#calendarContainer").fullCalendar({
	
			//Regionale Einstellungen
			firstDay: 1,
			dayNames: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
			dayNamesShort: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
			columnFormat: {
				month: "ddd",
				week: "ddd d.M",
				day: "dddd d.M."
			},
			timeFormat: 'H:mm',
	
			//Header / Kalenderinternes Interface
			header: false,
			
			allDaySlot: true, 
			allDayText: "",
			
			contentHeight: 1000, //großer Wert unterdrückt Scrollbar

			//Zeitleiste
			axisFormat: "HH:mm",
			minTime: 8,
			maxTime: 21,
			slotMinutes: 30,
			
			//events / lectures
			events: getCalendarEvents(),
			
			//render callback
			eventRender: function(event, element) {
				renderEvent(event, element);
			},
		
			//view change callback
			viewDisplay: function(view) { // "strecken" der Einträge auf 100% Breite
				$(".lectureEvent").width($(".fc-col0:visible").width());
			}
	
		});
	
		//auf Tagesansicht wechseln
		calendar.fullCalendar("changeView", "agendaDay"); 	
	}
	
	/**
	 * Gibt ein Array zurück, das fullCalendar-kompatible Kalendereinträge aller Veranstaltungen und Feiertage enthält.
	 * @returns {Array}
	 */
	function getCalendarEvents() {
		var events = new Array();
		
		//single lectures
		for (var int = 0; int < singleLectures.length; int++) {
			var singleLecture = singleLectures[int];
						
			var lectureStartTime = singleLecture.startTime.split(".");
			var lectureStartDate = new Date(singleLecture.date);
			lectureStartDate.setHours(lectureStartTime[0]);
			lectureStartDate.setMinutes(lectureStartTime[1]);
			
			var lectureEndTime = singleLecture.endTime.split(".");
			var lectureEndDate = new Date(singleLecture.date);
			lectureEndDate.setHours(lectureEndTime[0]);
			lectureEndDate.setMinutes(lectureEndTime[1]);
			
			singleLecture.start = lectureStartDate;
			singleLecture.end = lectureEndDate;
			singleLecture.allDay = false;
			
			events.push(singleLecture);
		}
						
		//holidays
		for (var int = 0; int < dates.holidays.length; int++) {
			var holiday = dates.holidays[int];
			var newCalendarEvent = new Object();
			newCalendarEvent.start = new Date(holiday.date);
			
			if(holiday.endDate !== undefined)
				newCalendarEvent.end = new Date(holiday.endDate);
			
			newCalendarEvent.title = holiday.name;
			newCalendarEvent.allDay = true;
			events.push(newCalendarEvent);
		}

		//recurring lectures
		for (var int = 0; int < recurringLectures.length; int++) {
			var recurringLecture = recurringLectures[int];

			var datePointer = dates.period.lectureStart;
			
			var dayDifference = 0;
			if(recurringLecture.weekday > datePointer.getDay())
				dayDifference = recurringLecture.weekday - datePointer.getDay();
			else if(recurringLecture.weekday < datePointer.getDay())
				dayDifference = -(datePointer.getDay() - recurringLecture.weekday);
			
			//Zeiger auf den Tag des Events "forwarden"
			datePointer = new Date(datePointer.getTime() + (86400000 * dayDifference));
			
			var lectureStartTime = recurringLecture.startTime.split("."); 
			var lectureEndTime = recurringLecture.endTime.split(".");
			
			//Semester durchlaufen
			while(datePointer.getTime() <= dates.period.lectureEnd.getTime()) {

				//überprüfe auf Feiertag
				if(allHolidays.indexOf(datePointer.getTime()) === -1) {
					
					//überprüfe auf Kommentar
					var comment = "";
					
					for (var int2 = 0; int2 < recurringLecture.comments.length; int2++) {
						var commentDate = new Date(recurringLecture.comments[int2].date);
						
						if(commentDate.getTime() === datePointer.getTime())
							comment = recurringLecture.comments[int2].text;
					}
					
					var lectureStartDate = new Date(datePointer);
					lectureStartDate.setHours(lectureStartTime[0]);
					lectureStartDate.setMinutes(lectureStartTime[1]);
					
					var lectureEndDate = new Date(datePointer);
					lectureEndDate.setHours(lectureEndTime[0]);
					lectureEndDate.setMinutes(lectureEndTime[1]);
					
					var newCalendarEvent = $.extend({}, recurringLecture); //shallow copy
					newCalendarEvent.start = lectureStartDate;
					newCalendarEvent.end = lectureEndDate;
					newCalendarEvent.allDay = false;
					newCalendarEvent.comment = comment;
					newCalendarEvent.id = newCalendarEvent.id+"-"+dateHelper.getDateString(lectureStartDate);
										
					events.push(newCalendarEvent);
				}
				
				//Inkrement: 1 Woche
				datePointer = new Date(datePointer.getTime() + 604800000);
			}
		}

		return events;
	}
	
	/**
	 * Wird aufgerufen wenn ein Event im Stundenplan gerendert wird.
	 * Fügt dem Element Kommentare und einen Click-Handler für die Detailansicht hinzu.
	 * @param event das Kalender-Event.
	 * @param element das DOM-Element des Events.
	 */
	function renderEvent(event, element) {
		$(element)
			.attr("id", event.id)
			.unbind("tap")
			.bind("tap", function(evt){
				showLecture(event);
			});
		
		if(event.id === undefined)
			$(element).addClass("allDayEvent");
		else {
			$(element).addClass("lectureEvent");
			if(event.comment !== "") {
				var commentContainer = $("<div class='comment'>"+event.comment+"</div>");
				
				$(element).find(".fc-event-head")
					.show()
					.html(commentContainer);
			}
		}
	}
	
	/**
	 * Öffnet die Detailansicht einer übergebenen Veranstaltung.
	 * @param lecture die Veranstaltung, deren Details angezeigt werden sollen.
	 */
	function showLecture(lecture) {
		$("#lecturePopupHeader > h1").html(lecture.title);
				
		var lectureDetails = $("<table id='lectureDetails'></table>")
			.append("<tr>" +
						"<td class='lectureDetailsCaption'>Zeit:</td>" +
						"<td>" +
							dateHelper.getWeekDayString(lecture.start)+", " +
							dateHelper.getDateString(lecture.start)+
							"<br />" +
							lecture.startTime+" - " +
							lecture.endTime +
						"</td>" +
					"</tr>")
			.append("<tr>" +
						"<td class='lectureDetailsCaption'>Gebäude:</td>" +
						"<td>"+map.getBuilding(lecture.buildingId).name+"</td>" +
						"<td>" +
							"<a href='#map' id='goToBuildingButton' data-role='button' data-mini='true' data-transition='slide'>Karte</a>" + 
						"</td>" +
					"</tr>")
			.append("<tr>" +
						"<td class='lectureDetailsCaption'>Raum:</td>" +
						"<td>"+lecture.room+"</td>" +
					"</tr>")
			.append("<tr>" +
						"<td class='lectureDetailsCaption'>Typ:</td>" +
						"<td>"+lecture.type+"</td>" +
					"</tr>")
			.append("<tr>" +
						"<td class='lectureDetailsCaption'>Kommentar:</td>" +
						"<td>" +
							"<input type='text' name='commentInput' id='commentInput' data-mini='true' value='"+lecture.comment+"'/>" +
						"</td>" +
						"<td>" +
							"<div class='ui-grid-a'>" +
								"<div class='ui-block-a'>" +
									"<a href='#' id='commentSubmitButton' data-role='button' data-iconpos='notext' data-icon='check' class='ui-disabled'></a>" +
								"</div>" +
								"<div class='ui-block-b'>" +
									"<a href='#' id='commentDeleteButton' data-role='button' data-iconpos='notext' data-icon='delete'></a>" + 
								"</div>" +
							"</div>" +
						"</td>" +
					"</tr>");
		
		$("#lecturePopupContent").html(lectureDetails);
		
		//button(), textinput() und page() erzwingen JQM-Styling 
		if(lecture.comment === "")
			$("#commentDeleteButton").addClass("ui-disabled");
		
		$("#goToBuildingButton")
			.button()
			.unbind("tap")
			.bind("tap", function(){
				map.showBuilding(lecture.buildingId);
			});
		
		$("#commentInput")
			.textinput()
			.unbind("keyup")
			.bind("keyup", function() {
				if($("#commentInput").val() !== "" && $("#commentInput").val() !== lecture.comment)
					$("#commentSubmitButton").removeClass("ui-disabled");
				else 
					$("#commentSubmitButton").addClass("ui-disabled");
			});
		
		$("#commentSubmitButton")
			.button()
			.unbind("tap")
			.bind("tap", function(){
				setComment(lecture, $("#commentInput").val());
				history.back();
			});
		
		$("#commentDeleteButton")
			.button()
			.unbind("tap")
			.bind("tap", function(){
				deleteComment(lecture);
				history.back();
			});
		
		$.mobile.changePage("#lecturePopup");
		
		$("#lecturePopup").page(); 
	}

	/**
	 * Gibt die kommenden Veranstaltungen zurück. 
	 * Anzahl der zu überprüfenden Tage und maximale Anzahl der Termine sind optionale Parameter.
	 * @param numDays Anzahl der zu überprüfenden Tage. Default: 3.
	 * @param numLectures maximale Anzahl der Termine. Default: 3.
	 * @returns {Array}
	 */
	function getNextLectures(numDays, numLectures) {
		
		var days = (numDays === undefined || numDays === null) ? 3 : numDays;
		var maxLectures = (numLectures === undefined || numLectures === null) ? 3 : numLectures;

		var currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0); //zurücksetzen auf Mitternacht
		
		var currentTime = new Date().getTime(); 
		var maxTime = currentDate.getTime() + (86400000 * days); 

		var nextLectures = new Array();
		
		//single lectures
		for (var int = 0; int < singleLectures.length; int++) {
			var lecture = singleLectures[int];
			
			var lectureStartTime = lecture.startTime.split(".");
			var lectureDate = new Date(lecture.lectureDate);
			lectureDate.setHours(lectureStartTime[0]);
			lectureDate.setMinutes(lectureStartTime[1]);
			
			//überprüfe ob die Veranstaltung innerhalb des Zeitfensters liegt
			if(lectureDate.getTime() >= currentTime && lectureDate.getTime() < maxTime) {
				lecture.start = lectureDate;
				nextLectures.push(lecture);
			}
		}

		//recurring lectures
		while(currentDate.getTime() <= maxTime) { //Zeitfenster durchlaufen

			for (var int = 0; int < recurringLectures.length; int++) {
				var lecture = recurringLectures[int];

				if(currentDate.getDay() == lecture.weekday) { //int == string
					
					//überprüfe auf Feiertag
					if(allHolidays.indexOf(currentDate.getTime()) === -1) {
												
						var lectureStartTime = lecture.startTime.split(".");
						var lectureStart = new Date(currentDate);
						lectureStart.setHours(lectureStartTime[0]);
						lectureStart.setMinutes(lectureStartTime[1]);
						
						if(lectureStart.getTime() > currentTime) {

							//überprüfe auf Kommentar
							var comment = "";
							for (var int2 = 0; int2 < lecture.comments.length; int2++) {
								var commentDate = new Date(lecture.comments[int2].date);
								if(commentDate.getTime() === currentDate.getTime()) {
									comment = lecture.comments[int2].text;
								}
							}
							
							var newLectureObject = $.extend({}, lecture); //shallow copy
							newLectureObject.start = lectureStart;
							newLectureObject.comment = comment;
							newLectureObject.id = lecture.id+"-"+dateHelper.getDateString(lectureStart);
							
							nextLectures.push(newLectureObject);
						}
					}
				}
			}
			
			currentDate = new Date(currentDate.getTime() + 86400000); //Inkrement: 1 Tag
		}
		
		var lectureSorter = function (lecture1, lecture2) {
			if (lecture1.start > lecture2.start)
				return 1;
			
			if (lecture1.start < lecture2.start) 
				return -1;
			
			return 0;
		};
		nextLectures.sort(lectureSorter);
		
		if(nextLectures.length > maxLectures)
			nextLectures = nextLectures.slice(0, maxLectures);
		
		return nextLectures;
	}
	
	/**
	 * Rendert den Kalender und streckt die Einträge auf volle Breite.
	 */
	function render() {
		calendar.fullCalendar("render");
		$(".lectureEvent").width($(".fc-day-content").width());
	};

	/**
	 * Gibt einer übergebenen Veranstaltung einen übergebenen Kommentar.
	 * @param lecture die zu kommentierende Veranstaltung.
	 * @param comment der Kommentar.
	 */
	function setComment(lecture, comment) {
		
		var isSingleLecture = (lecture.comments === undefined);
		
		var date;
		var id;
		if(isSingleLecture) {
			id = lecture.id;
			date = lecture.lectureDate;
		}
		else {
			id = lecture.id.split("-")[0];
			date = dateHelper.getDateSlashString(lecture.start);
		}
				
		var commentObject = new Object();
		commentObject.id = id;
		commentObject.date = date;
		commentObject.comment = comment;
		
		var commentJSON = JSON.stringify(commentObject);
		
		$.ajax({
			async: false,
			type: "POST",
			url: "../backend/ajax.php",
			data: "request=Comment&type=set&json="+commentJSON,
			dataType: "json",
			success: function(data) {
				if(data.status === "OK") {
					
					lecture.comment = comment;

					if(!isSingleLecture) {
						
						var commentObject = new Object();
						commentObject.text = comment;
						commentObject.date = date;
						
						for (var int = 0; int < lecture.comments.length; int++) {
							if(date === lecture.comments[int].date) {
								lecture.comments.pop(int);
								break;	
							}
						}
						
						lecture.comments.push(commentObject);
					}
					
					//update calendar (if initialised)
					if(calendar !== undefined) {
						var originalEvent = calendar.fullCalendar("clientEvents", lecture.id);
						originalEvent[0].comment = comment;
						calendar.fullCalendar("updateEvent", originalEvent[0]);
					}
					
					//update startpage (if initialised)
					if($("#upcomingEvents").html() !== "") {
						start.initStartPage();
						$("#start").trigger("create");
					}
				}
			}
		});
	}
	
	/**
	 * Löscht den Kommentar einer übergebenen Veranstaltung.
	 * @param lecture die Veranstaltung, deren Kommentar gelöscht werden soll.
	 */
	function deleteComment(lecture) {
		
		var isSingleLecture = (lecture.comments === undefined);
		
		var date;
		var id;
		if(isSingleLecture) {
			id = lecture.id;
			date = lecture.lectureDate;
		}
		else {
			id = lecture.id.split("-")[0];
			date = dateHelper.getDateSlashString(lecture.start);
		}
		
		var deleteCommentObject = new Object();
		deleteCommentObject.id = id;
		deleteCommentObject.date = date;
		
		var deleteCommentJSON = JSON.stringify(deleteCommentObject);
		
		$.ajax({
			async: false,
			type: "POST",
			url: "../backend/ajax.php",
			data: "request=Comment&type=delete&json="+deleteCommentJSON,
			dataType: "json",
			success: function(data) {
				if(data.status === "OK") {
					
					lecture.comment = "";
					
					if(!isSingleLecture) {
						for(var int = 0; int < lecture.comments.length; int++) {
							var comment = lecture.comments[int];
							if(comment.date === date) {
								lecture.comments.pop(comment);
								break;
							}
						}
					}
					
					//update calendar (if initialised)
					if(calendar !== undefined) {
						var originalEvent = calendar.fullCalendar("clientEvents", lecture.id);
						
						originalEvent[0].comment = "";
						calendar.fullCalendar("updateEvent", originalEvent[0]);
					}
					
					//update startpage (if initialised)
					if($("#upcomingEvents").html() !== "") {
						start.initStartPage();
						$("#start").trigger("create");
					}
				}
			}
		});
	}
	
}
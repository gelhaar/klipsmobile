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
		schedule.prototype.reset = reset;
		schedule.prototype.showLecture = showLecture;
		
		initEvents();
		initHolidays();
	}

	function initEvents() {
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
			
			//TODO kann raus
//			monthNames:["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
//			monthNamesShort : ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
//			buttonText: {
//				today: "heute",
//				month: "Monat",
//				week: "Woche",
//				day: "Tag"
//			},
//			titleFormat: {
//				month: "MMMM yyyy",
//				week: "d[ yyyy]{ '&#8212;'[ MMM] d MMM yyyy}", // - TODO
//				day: "dddd, d. MMM yyyy"
//			},
	
			//header
			header: false,
			
			allDaySlot: true, 
			allDayText: "",
			
			contentHeight: 1000, //großer Wert unterdrückt Scrollbar

			//TODO scrollbar-hack, benötigt?
//			viewDisplay: function(view) {
//				var n = view.name;
//				var body_h = $('div.fc-view-'+n+' > div > div > div').height();
//				$('div.fc-view-'+n+' > div > div, div.fc-view-'+n+' .fc-agenda-days').height(body_h + 20 +'px');
//				$('div.fc-view-'+n+' .fc-agenda-days thead th').height(20);
//				
//				$("fc-agenda-gutter ui-widget-header fc-last").width(1).css("border-left", "none").empty();;
//				$('.fc-agenda-gutter').width(1).css("border-left", "none").empty();
//			},
	
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
	
	
	function getCalendarEvents() {
		var events = new Array();
		
		//single lectures
		for (var int = 0; int < singleLectures.length; int++) {
			var singleLecture = singleLectures[int];
						
			var lectureStartTime = singleLecture.startTime.split(".");
			var lectureStartDate = new Date(singleLecture.lectureDate);
			lectureStartDate.setHours(lectureStartTime[0]);
			lectureStartDate.setMinutes(lectureStartTime[1]);
			
			var lectureEndTime = singleLecture.endTime.split(".");
			var lectureEndDate = new Date(singleLecture.lectureDate);
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
	

	function renderEvent(event, element) {
		$(element)
			.attr("id", event.id)
			.unbind("tap")
			.bind("tap", function(evt){
				showLecture(event);
			});
		
		if(event.id === undefined)  //TODO dates haben keine id (-> alle all-day events haben im DOM die selbe id)
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
						"<td>"+map.getBuilding(lecture.building).name+"</td>" +
						"<td>" +
							"<a href='#map' id='goToBuildingButton' data-role='button' data-mini='true' data-transition='slide'>zeigen</a>" + 
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
		$("#lecturePopup").page(); //JQM-Styling erzwingen
		
		if(lecture.comment === "")
			$("#commentDeleteButton").addClass("ui-disabled");
		
		$("#goToBuildingButton")
			.unbind("tap")
			.bind("tap", function(){
				map.showBuilding(lecture.building);
			});
		
		$("#commentInput")
			.unbind("keyup")
			.bind("keyup", function() {
				if($("#commentInput").val() !== "" && $("#commentInput").val() !== lecture.comment)
					$("#commentSubmitButton").removeClass("ui-disabled");
				else 
					$("#commentSubmitButton").addClass("ui-disabled");
			});
		
		$("#commentSubmitButton")
			.unbind("tap")
			.bind("tap", function(){
				setComment(lecture, $("#commentInput").val());
				history.back();
			});
		
		$("#commentDeleteButton")
			.unbind("tap")
			.bind("tap", function(){
				deleteComment(lecture);
				history.back();
			});
		
		$.mobile.changePage("#lecturePopup");
	}

	
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
	
	function render() {
		calendar.fullCalendar("render");
		$(".lectureEvent").width($(".fc-day-content").width());
	};
	
	function reset() {
		//if the lecture-popup is visible, the user navigated there from the calendar and will navigate back -> no reset
		if(!$("#lecturePopup").is(":visible"))
			calendar.fullCalendar("today");
	}

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
				
		var commentJSON = new Object();
		commentJSON.id = id;
		commentJSON.date = date;
		commentJSON.comment = comment;
		
		$.ajax({
			async: false,
			type: "POST",
			url: "../../backend/ajax.php",
			data: "request=Comment&type=set&json="+commentJSON,
			dataType: "json",
			success: function(data) {
				if(data.status === "OK") {
					
					lecture.comment = comment;

					if(!isSingleLecture) {
						
						var commentObject = new Object();
						commentObject.text = comment;
						commentObject.date = date;
						
						lecture.comments.push(commentObject);
					}
					
					//update calendar (if already initialised)
					if(calendar !== undefined) {
						var originalEvent = calendar.fullCalendar("clientEvents", lecture.id);
						originalEvent[0].comment = comment;
						calendar.fullCalendar("updateEvent", originalEvent[0]);
					}
					
					//update startpage (if already initialised)
					if($("#upcomingEvents").html() !== "") {
						start.initStartPage();
						$("#start").trigger("create");
					}
				}
			}
		});
	}
	
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
		
		var deleteCommentJSON = new Object();
		deleteCommentJSON.id = id;
		deleteCommentJSON.date = date;
		
		$.ajax({
			async: false,
			type: "POST",
			url: "../../backend/ajax.php",
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
					
					//update calendar (if already initialised)
					if(calendar !== undefined) {
						var originalEvent = calendar.fullCalendar("clientEvents", lecture.id);
						
						originalEvent[0].comment = "";
						calendar.fullCalendar("updateEvent", originalEvent[0]);
					}
					
					//update startpage (if already initialised)
					if($("#upcomingEvents").html() !== "") {
						start.initStartPage();
						$("#start").trigger("create");
					}
				}
			}
		});
	}
	
}
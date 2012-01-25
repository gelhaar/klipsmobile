function calendar(moduleHandler, containerID) {
	
	var currentViewStart = null;
	var currentViewEnd = null;
	var semesterStart = null;
	var semesterEnd = null;
	var periodicEvents = null;
	var visitedDaysPeriodic = new Array();
	var visitedDaysUnique = new Array();
	var commentaryMap = new Object();
	var init = true;
	
	//init semesterzeiten
	$.ajax({
		async: false,
		type: "POST",
		url: "../../backend/ajax.php?type=event",
		data: "command=getSemesterzeiten",
		dataType: "json",
		success: function(data) {
			semesterStart = new Date(data.startSemester);
			semesterEnd = new Date(data.endSemester);
		}
	});	
	
	//init periodic events
	$.ajax({
		async: false,
		type: "POST",
		url: "../../backend/ajax.php?type=event",
		data: "command=getAllPeriodic",
		dataType: "json",
		success: function(data) {
			periodicEvents = data.veranstaltungen;
		}
	});	
	
	//init calendar
	var calendar = $("#"+containerID).fullCalendar({
		
			//region-specific settings
			firstDay: 1,
		    dayNames: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
	        dayNamesShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
	        monthNames:['Januar', 'Februar', 'M&auml;rz', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
	        monthNamesShort : ['Jan', 'Feb', 'M&auml;r', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
			buttonText: {
			    today: 'heute',
			    month: 'Monat',
			    week: 'Woche',
			    day: 'Tag'
			},
			titleFormat: {
			    month: 'MMMM yyyy',
			    week: "d[ yyyy]{ '&#8212;'[ MMM] d MMM yyyy}",
			    day: 'dddd, d. MMM yyyy'
			},
			columnFormat: {
			    month: 'ddd',
			    week: 'ddd d.M',
			    day: "dddd d.M."
			},
			timeFormat: 'H:mm',
			
			//general view
	        header: {
	        	left: 'prev,next today',
	        	center: 'title',
			    right: 'month agendaWeek agendaDay'
			},
		    height: 600,

		    //view change callback
			viewDisplay: function(view) {
				viewChangeHandler(view);
		    },
		    
		    //week-view
		    axisFormat: "HH:mm",
		    minTime: 8,
		    maxTime: 21,
		    allDaySlot: false, //all-day events are currently not implemented
	
		    //render callback
		    eventRender: function(event, element) {
		    	renderEvent(event, element);
		    },
		    
		    theme: true
	    });
	
	init = false;
	calendar.fullCalendar('changeView', "agendaWeek"); //set to week-view
	
	function viewChangeHandler(view) {
		if(init === false) {
			
			//save view span for the render functions
			currentViewStart = view.visStart;
			currentViewEnd = view.visEnd; //this is actually the day after the view at midnight
			
			//if the view was not already rendered: render events
			if(!checkIfViewIsAlreadyRendered()) {
				
				//render periodic events
				renderPeriodicEvents();
				
				//perform request and render unique events
				performRequestAndRenderUniqueEvents(currentViewStart, currentViewEnd);
			}
		}
	}
	
	function performRequestAndRenderUniqueEvents(startDate, endDate) {
		$.ajax({
			async: false,
			type: "POST",
			url: "../backend/ajax.php?type=event",
			data: "command=getUniqueByDate&date="+convertToYYYYMMDD(startDate)+"-"+covertToYYYYMMDD(endDate),
			dataType: "json",
			success: function(data) {
				if(data.kommentare !== undefined) {
					for ( var int = 0; int < data.kommentare.length; int++) {
						commentaryMap[data.kommentare[int].id] = data.kommentare[int];
					}
					renderUniqueEvents(data.veranstaltungen);
				}
			}
		});
	}
	
	function checkIfViewIsAlreadyRendered() {		
		var viewStart = convertToYYYYMMDD(currentViewStart);
		var viewEnd = convertToYYYYMMDD(new Date(currentViewEnd.getTime() - 1)); //subtract 1s to get the last day in the view
		
		//see if first and last day of view were already visited
		if(visitedDaysUnique.indexOf(viewStart) === -1 || 
			visitedDaysUnique.indexOf(viewEnd) === -1 ||
			visitedDaysPeriodic.indexOf(viewStart) === -1 ||
			visitedDaysPeriodic.indexOf(viewEnd) === -1) {
			return false;
		}
		return true;
	}
	
	function renderEvent(event, element) {
	 	if(event.type === "veranstaltung") {
    		$(element)
    			.unbind("click")
	    		.bind("click", function(evt){
					focusEvent(event);
				})
	    		.attr("id","veranstaltung"+event.id)
	    		.find(".fc-event-content")
	    		.append("<div>"+event.building+", Raum "+event.room+"</div>")
	    		.css("cursor", "pointer");
    		
	 		//see if it has commentarys attached to it
	 		if(commentaryMap[event.id] !== undefined) {
	 			var commentary = commentaryMap[event.id];
	    		var commentaryContainer = $("<div id='kommentar"+event.id+"'>"+commentary.title+"</div>")
			    	.css({
			    		"color":"red"
			    	});
				$(element)
					.css({
			    		"outline":"solid red 2px",
			    	})
			    	.find(".fc-event-time").append(commentaryContainer);
	 		}
	 	}
	}
	
	function focusEvent(event) {
		
		//see if the element has a commentary
		var kommentar = "keine";
		if(commentaryMap[event.id] !== undefined) {
			kommentar = commentaryMap[event.id].title;
		}
		
		//init links
		var kommentarEditButton = $("<input type='button' class='clickable' value='bearbeiten'></input>")
			.click(function(){
				if($(this).val() === "bearbeiten") {
					var currentCommentary = $(this).siblings(".kommentar").html();
					var editField = $("<input type='text' value='"+currentCommentary+"'></input>");
					$(this)
						.val("ok")
						.siblings(".kommentar").html(editField);
				}
				else if($(this).val() === "ok") {
					var commentary = $($(this).siblings(".kommentar").children("input")).val();
					
					$(this)
						.val("bearbeiten")
						.siblings(".kommentar").html(commentary);
					
					//send commentary to server
					
					//update local commentary
					var commentaryObject = new Object();
					commentaryObject.title = commentary;
					commentaryObject.id = event.id;
					commentaryObject.type = "kommentar";
					commentaryMap[event.id] = commentaryObject;
					
					//rerender to make changes visible
					calendar.fullCalendar("rerenderEvents");
				}
			});
		var kommentare = $("<div>Kommentare: <span class='kommentar'>"+kommentar+"</span></div>")
			.append(kommentarEditButton);
		
		var goToMapButton = $("<input type='button' class='clickable' value='zeigen' disabled='disabled'></input>");
		var location = $("<div>Geb&auml;ude: "+event.building+", Raum "+event.room+"</div>")
			.append(goToMapButton);
				
		//init event element to display
		var eventContainer = $("<div id='focusEventContainer'></div>")
			.append("<div><b>"+event.title+"</b></div>")
			.append("<div>Datum: "+convertToDateString(event.start)+"</div>")
			.append("<div>Zeit: "+convertToTimeString(event.start)+" - "+convertToTimeString(event.end)+"</div>")
			.append(location)
			.append(kommentare)
			.css({
				"text-align": "left",
				"font-family": "arial"
			});
		
		//show element in blockUI
		$.blockUI({
			message: eventContainer,
			theme: true,
			css: {"cursor": "default", "width":"50%", "left":"25%"}, 
			overlayCSS: {"cursor": "pointer"},
			fadeIn: 500
		});
		
		//bind click handler to body to escape focus
		setTimeout(
			function() {
				$("body").bind("click", function(evt) {
					evt.stopPropagation();
					
					//check if the click comes from outside of blockUI
					if($(eventContainer).has(evt.target).length === 0) {
						evt.preventDefault();
						$("body").unbind("click");
						$.unblockUI();
					}
				});
			},
			100 //add click handler 100ms afterwards to ensure that the click that opened the ui is not caught
		);
	}

	function renderUniqueEvents(events) {
		var nextDate = currentViewStart; //this points to the currently rendering day
		while(nextDate.getTime() < currentViewEnd.getTime()) {
			
			//if the day was not visited already...
			var yyyymmdd = convertToYYYYMMDD(nextDate);
			if(visitedDaysUnique.indexOf(yyyymmdd) !== -1) {
				nextDate = new Date(nextDate.getTime() + 86400000);
				continue;
			}
			//mark day as visited
			visitedDaysUnique.push(yyyymmdd);
			
			for ( var int = 0; int < events.length; int++) {
				var event = events[int];
				
				//calculate day difference to currently rendering day
				var eventStart = new Date(event.startTime);
				var differenceCurrentDay  = nextDate.getTime() - eventStart.getTime();
				var differenceDaysCurrentDay = Math.round(differenceCurrentDay / (1000 * 60 * 60 * 24));
				
				//if days coincide...
				if(differenceDaysCurrentDay === 0) {
				
					//set fullcalendar properties
					event.start = eventStart;
					event.end = new Date(event.endTime);
					event.allDay = (event.allDay === "true");
					
					//render event
					calendar.fullCalendar('renderEvent', event, true);
				}
			}
			nextDate = new Date(nextDate.getTime() + 86400000);
		}
	};

	function renderPeriodicEvents() {
		var nextDate = currentViewStart; //this points to the currently rendering day
		while(nextDate.getTime() < currentViewEnd.getTime()) {

			//if the day was not visited already...
			var yyyymmdd = convertToYYYYMMDD(nextDate);
			if(visitedDaysPeriodic.indexOf(yyyymmdd) !== -1) {
				nextDate = new Date(nextDate.getTime() + 86400000);
				continue;
			}
			//mark day as visited
			visitedDaysPeriodic.push(yyyymmdd);
		
			//calculate day difference to semester start and end
			var differenceSemesterStart  = nextDate.getTime() - semesterStart.getTime();
			var differenceDaysSemesterStart = Math.round(differenceSemesterStart / (1000 * 60 * 60 * 24));
			var differenceSemesterEnd  = semesterEnd.getTime() - nextDate.getTime();
			var differenceDaysSemesterEnd = Math.round(differenceSemesterEnd / (1000 * 60 * 60 * 24));
			
			//view is before start of semester: set date pointer to startsemester time
			if(differenceDaysSemesterStart <= 0 && differenceDaysSemesterStart > -8 && differenceDaysSemesterEnd > 0) {
				nextDate = new Date(nextDate.getTime() + (86400000 * -differenceDaysSemesterStart));
			}
			else if( //view is after end or before start of semester: continue
					(differenceDaysSemesterEnd <= 0  && differenceDaysSemesterEnd > -8 && differenceDaysSemesterStart > 0) || 	
					!(differenceDaysSemesterStart > 0 && differenceDaysSemesterEnd > 0)) {
				nextDate = new Date(nextDate.getTime() + 86400000);
				continue;
			}
			
			for ( var int = 0; int < periodicEvents.length; int++) {
				var periodicEvent = periodicEvents[int];

				//if days coincide...
				if(periodicEvent.weekday == nextDate.getDay()) { //comparing string to number with == 
					
					//init basic event object and clone properties
					var event = new Object();
					for (var property in periodicEvent) {
						event[property] = periodicEvent[property];
					}
					
					//set fullcalendar properties
					event.start = convertToDate(yyyymmdd, periodicEvent.startTime);
					event.end = convertToDate(yyyymmdd, periodicEvent.endTime);
					event.allDay = (event.allDay === "true");

					//render event
					calendar.fullCalendar('renderEvent', event, true);
				}
			}
		nextDate = new Date(nextDate.getTime() + 86400000);
		}
	};
	
	function convertToYYYYMMDD(date) {
		var year = date.getFullYear();
		var month = date.getMonth();
		if(month < 10) {
			month = "0"+month;
		}
		var day = date.getDate();
		if(day < 10) {
			day = "0"+day;
		}
		var yyyymmdd = year+""+month+""+day;
		return yyyymmdd;
	}
	
	function convertToDate(yyyymmdd, hhmmss) {
		var year = yyyymmdd.substr(0,4);
		var month = yyyymmdd.substr(4,2);
		var day = yyyymmdd.substr(6,2);
		if(hhmmss !== undefined) {
			var hour = hhmmss.substr(0,2);
			var minute = hhmmss.substr(2,2);
			var second = hhmmss.substr(4,2);
			return new Date(year, month, day, hour, minute, second);
		}
		return new Date(year, month, day);
	};
	
	function convertToDateString(date) {
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		if(month < 10) {
			month = "0"+month;
		}
		var day = date.getDate();
		if(day < 10) {
			day = "0"+day;
		}
		var date = day+"."+month+"."+year;
		return date;
	}
	
	function convertToTimeString(date) {
		var hours = date.getHours();
		var minutes = date.getMinutes();
		if(minutes < 10) {
			minutes = "0"+minutes;
		}
		var date = hours+"."+minutes;
		return date;
	}
	
	this.getNextEvent = function(date) {
		var allEvents = calendar.fullCalendar( 'clientEvents');
		var upcomingEvents = new Array();
		
		for (var int = 0; int < allEvents.length; int++) {
			var event = allEvents[int];
			if(event.start.getTime() >= date.getTime()) {
				upcomingEvents.push(event);
			}
		}
		
		//sort upcoming events
		var dateSorter = function (event1, event2) {
			  if (event1.start > event2.start) return 1;
			  if (event1.start < event2.start) return -1;
			  return 0;
			};
		upcomingEvents.sort(dateSorter);
		
		return upcomingEvents[0];
	};
}

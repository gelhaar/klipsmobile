/**
 * Initialisierung aller Komponenten.
 * @author Roman Quiring
 */

/**
 * Einstiegspunkt des Scriptes. Wird aufgerufen, sobald das JQM-DOM-Modell geladen ist.
 * Initialisiert alle Module und bindet sie an die entsprechenden Seiten.
 */
$(document).live("mobileinit", function(){
	
	//Defaults überschreiben
	$.mobile.dialog.prototype.options.closeBtnText = "Schließen";
	$.mobile.loadingMessage = "Lade...";
	
	//Module initialisieren
	dateHelper = new dateHelper();
	session = new session();
	dates = new dates();
	mensa = new mensa();
	map = new map();
	schedule = new schedule();
	start = new start();
	
	//Module an Seiten binden
	$("#start")
		.live("pagecreate", function() {
			start.initStartPage();
		})
		.live("pageshow", function() {
			$("#start > .content").height(getContentHeight());
			$("#start").trigger("updatelayout");
		});
	
	$("#schedule")
		.live("pagecreate", function() {
			schedule.initScheduleView();
		})
		.live("pageshow", function() {
			$("#schedule > .content").height(getContentHeight());
			$("#schedule").trigger("updatelayout");
			schedule.render();
		});

	$("#map")
		.live("pagecreate", function() {
			map.initMapView();
		})
		.live("pageshow", function() {
			$("#mapContainer").height(getContentHeight() - $("#mapOptions").outerHeight() - ($("#mapContainer").outerHeight() - $("#mapContainer").innerHeight()));
			$("#map").trigger("updatelayout");
			map.render();
		});
	
	$("#mensa")
		.live("pagecreate", function() {
			mensa.initMensaView();
		})
		.live("pageshow", function() {
			$("#mensa > .content").height(getContentHeight());
			$("#mensa").trigger("updatelayout");
		});

	$("#dates")
		.live("pagecreate", function(){
			dates.initDateView();
		})
		.live("pageshow", function() {
			$("#dates > .content").height(getContentHeight());
			$("#dates").trigger("updatelayout");
		});

	//Benutzername anzeigen
	$(window).one("pagecreate", function() {
		session.initUsername();
	});
	
	//Jede Minute den Server pingen
	setInterval(session.ping, 60000);
});

/**
 * Gibt die maximale Höhe des aktuell sichtbaren Content-Bereichs zurück.
 * @returns {Number}
 */
function getContentHeight() {
	var contentHeight =  $(window).height() - $(".header:visible").outerHeight() - $(".footer:visible").outerHeight();
	contentHeight -= ($(".content:visible").outerHeight() - $(".content:visible").height());
    return contentHeight;
}

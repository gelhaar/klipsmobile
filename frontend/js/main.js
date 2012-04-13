var contentHeight;

var init = true;

//document.ontouchmove = function(e){ e.preventDefault(); };

$(document).live("mobileinit", function(){
	
	//override defaults
	$.mobile.dialog.prototype.options.closeBtnText = "Schlie&szlig;en";
	$.mobile.loadingMessage = "Lade...";
//	$.mobile.ajaxLinksEnabled = false; //wichtig für login-formular
//	$.mobile.hashListeningEnabled = false; //reload führt zur startseite
	
	//module pre-init
	dateHelper = new dateHelper();
	dates = new dates();
	map = new map();
	schedule = new schedule();
	start = new start();
	
	//module init
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

			//safari fix: if render is called directly the scrollbar is still shown -> event-width == 100% - scrollbar-width
//			setTimeout(function(){ 
				schedule.render(); //TODO
//			}, 10);
		})
		.live("pagehide", function() {
			schedule.reset();
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

	$("#dates")
		.live("pagecreate", function(){
			dates.initDateView();
		})
		.live("pageshow", function() {
			$("#dates > .content").height(getContentHeight());
			$("#dates").trigger("updatelayout");
		});
	
//	$(window).bind("orientationchange resize pageshow", fixgeometry);

	//init username + logout-bar
	$(window).one("pagecreate", function() {
		login();
	});
});


function getContentHeight() {
	var contentHeight =  $(window).height() - $(".header:visible").outerHeight() - $(".footer:visible").outerHeight();
	contentHeight -= ($(".content:visible").outerHeight() - $(".content:visible").height());
    return contentHeight;
}




var fixgeometry = function() {
//    /* Some orientation changes leave the scroll position at something that isn't 0,0. This is annoying for user experience. */
//    scroll(0, 0);
//
//    var content = $(".content:visible");
//    
//    if(contentHeight === undefined) {
//    
//	    var header = $(".header:visible");
//	    var footer = $(".footer:visible");
//	    var viewport_height = $(window).height();
//	    
//	    /* Calculate the geometry that our content area should take */
//	    contentHeight = viewport_height - header.outerHeight() - footer.outerHeight();
//	    /* Trim margin/border/padding height */
//	    contentHeight -= (content.outerHeight() - content.height());
//    }
////    console.log("fix "+contentHeight);
//    
////    content.height(contentHeight);
	
	getContentHeight();

	$("#one > .content").height(contentHeight);
	$("#two > .content").height(contentHeight);
	$("#three > .content").height(contentHeight);
	$("#four > .content").height(contentHeight);
	
	$("#mapContainer").height(contentHeight - $("#mapOptions").height());
  };

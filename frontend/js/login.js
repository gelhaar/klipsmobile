/**
 * Javascript-Funktionalität für die Startseite.
 * Gibt dem Content-Bereich die maximale Höhe, damit der Footer am unteren Bildschirmrand angezeigt wird.
 * @author Roman Quiring
 */

$("#loginPage").live("pageshow", function() {

	setContentHeight();
	
	function setContentHeight() {
		var contentHeight =  $(window).height() - $(".header:visible").outerHeight() - $(".footer:visible").outerHeight();
		contentHeight -= ($(".content:visible").outerHeight() - $(".content:visible").height());
		$(".content").height(contentHeight);
	} 

});
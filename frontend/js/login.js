$("#loginPage").live("pageshow", function() {

	setContentHeight();
	
	function setContentHeight() {
		var contentHeight =  $(window).height() - $(".header:visible").outerHeight() - $(".footer:visible").outerHeight();
		contentHeight -= ($(".content:visible").outerHeight() - $(".content:visible").height());
		$(".content").height(contentHeight);
	} 

});
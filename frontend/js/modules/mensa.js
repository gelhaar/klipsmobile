function mensa() {
	
	var mensen = new Array();
	var menus = new Array();
	
	//Konstruktor
	if (typeof(_mensa_prototype_called) == "undefined") {
		_mensa_prototype_called = true;
		mensa.prototype.initMensaView = initMensaView;
		mensa.prototype.getMensen = getMensen;
		mensa.prototype.getMensa = getMensa;
		
		initMensen();
		initMenus();
	}
	
	function initMensen() {
		$.ajax({
			async: false,
			type: "POST",
			url: "../backend/ajax.php",
			data: "request=Mensen&type=get",
			dataType: "json",
			success: function(data) {
				mensen = data.mensen;
			}
		});
	}
	
	function initMenus() {
		$.ajax({
			async: false,
			type: "POST",
			url: "../backend/ajax.php",
			data: "request=Menus&type=get",
			dataType: "json",
			success: function(data) {
				menus = data;
			}
		});
	}
	
	function initMensaView() {

		for(var int = 0; int < menus.length; int++) {
			var mensaMenus = menus[int];
			
			var collapsibleHeader = $("<h1 class='mensaName'>"+getMensa(mensaMenus.id).name+"</h1>");
			
			$("<a href='#map' class='goToMensaButton' data-role='button' data-mini='true' data-transition='slide' data-ajax='false'>Karte</a>")
				.data("mensaID", mensaMenus.id)
//				.button()
//				.unbind("tap")
				.bind("tap click", function(event){
					event.stopPropagation();
					map.showMensa($(this).data("mensaID")); 
				})
				.appendTo(collapsibleHeader);
			
			var mensaListItem = $("<div data-role='collapsible' data-content-theme='c'></div>")
				.append(collapsibleHeader);
			
			if(mensaMenus.menus.length === 0)
				mensaListItem.addClass("ui-disabled");
			else {
				for (var int2 = 0; int2 < mensaMenus.menus.length; int2++) {
					var menu = mensaMenus.menus[int2];
					
					var menuListItem = $("<div class='mensaMenu'></div>")
						.append("<div class='menuName'>"+menu.name+"</div>");
					
					for (var int4 = 0; int4 < menu.meals.length; int4++) {
						var meal = menu.meals[int4];
						$(menuListItem).append(
									"<div class='meal'>" +
										"<div>"+meal.name+"</div>" + 
										"<div>"+meal.price+"</div>" +
									"<div>" 
									);
					}
					
					$(mensaListItem).append(menuListItem);
				}
			}
			
			$(mensaListItem).appendTo("#mensaList");
		}
			
		//JQM-Styling erzwingen
		$("#mensa").page();
	}
	
	function getMensen() {
		return mensen;
	}
	
	function getMensa(id) {
		for(var int = 0; int < mensen.length; int++) {
			if(id == mensen[int].id) {
				return mensen[int];
			}
		}
	}
}
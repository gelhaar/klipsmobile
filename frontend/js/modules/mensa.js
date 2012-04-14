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
			
			var mensaListItem = $("<div data-role='collapsible' data-content-theme='c'></div>")
				.append("<h1>"+getMensa(mensaMenus.id).name+"</h1>");
			
			for (var int2 = 0; int2 < mensaMenus.menus.length; int2++) {
				var menu = mensaMenus.menus[int2];
				
				var menuListItem = $("<div class='mensaMenu'></div>")
					.append("<div class='menuName'>"+menu.name+"</div>");
				
				for (var int4 = 0; int4 < menu.meals.length; int4++) {
					var meal = menu.meals[int4];
					$(menuListItem).append(
								"<div class='meal'>" +
									"<div>"+meal.name+"</div>" + 
									"<div class='price'>Preis: "+meal.price+" </div>" +
								"<div>" 
								);
				}
				
				$(mensaListItem).append(menuListItem);
			}
			
			$(mensaListItem).appendTo("#mensaList");
		}
		//JQM-Styling erzwingen
		$("#mensa").page(); //TODO im Safari werden trotzdem keine Umlaute angezeigt
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
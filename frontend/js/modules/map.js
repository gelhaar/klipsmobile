/**
 * Karten-Modul.
 * @author Roman Quiring
 */

function map() {
	
	var buildings = null;
	
	var gMap = null;
	
	var marker = null;
	var markerToShow;
	
	var initialLocation = new google.maps.LatLng(50.928256, 6.929184); //Hauptgebäude
	
	var directionsService = new google.maps.DirectionsService();
	var directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers : true});
	
	var defaultZoom = 17;
	
	var init = true; //wird fürs erste Rendering gebraucht
	
	//Konstruktor
	if (typeof(_map_prototype_called) == "undefined") {
		_map_prototype_called = true;
		map.prototype.render = render;
		map.prototype.initMapView = initMapView;
		map.prototype.showBuilding = showBuilding;
		map.prototype.showMensa = showMensa;
		map.prototype.getBuilding = getBuilding;
		
		initBuildings();
	}
	
	/**
	 * Führt einen AJAX-Request aus und initialisiert das buildings-Array.
	 */
	function initBuildings() {
		$.ajax({
			async: false,
			type: "POST",
			url: "../backend/ajax.php",
			data: "request=Buildings&type=get",
			dataType: "json",
			success: function(data) {
				buildings = data.buildings;
			}
		});
	}
	
	/**
	 * Gibt das Gebäude zurück, das der übergebenen ID entspricht.
	 * @param id die Gebäude-ID
	 * @returns ein Gebäude-Objekt.
	 */
	function getBuilding(id) {
		for (var int = 0; int < buildings.length; int++) {
			var building = buildings[int];
			if(building.id === id)
				return building;
		}
	}
	
	/**
	 * Initialisiert die Optionen zur Kartennavigation.
	 */
	function initMapView() {
		
		//Gebäude
		for (var int = 0; int < buildings.length; int++) {
			var building = buildings[int];
			$("#buildingSelect").append("<option value='"+building.id+"'>"+building.name+"</option>");
		}
		
		$("#buildingSelect").change(function(){
			showBuilding($(this).val());
			render();
			
			$("#directionsSelect").selectmenu("enable");
			$("#mensaSelect option:selected").removeAttr("selected");
			$("#mensaSelect option:first").attr("selected", "selected");
			$("#mensaSelect").selectmenu("refresh");
			
			//wenn gerade ein Weg angezeigt wird, soll der Weg zum neu ausgewählten Gebäude angezeigt werden
			if(directionsDisplay.getMap() !== undefined) {
				getDirectionsToBuildingOrMensa();
			}
		});
		
		//Mensen
		var mensen = mensa.getMensen();
		for (var int = 0; int < mensen.length; int++) {
			var singleMensa = mensen[int];
			$("#mensaSelect").append("<option value='"+singleMensa.id+"'>"+singleMensa.name+"</option>");
			$("#mensaSelect").val($("#mensaSelect option:first").val());
		}
		
		$("#mensaSelect").change(function(){
			showMensa($(this).val());
			render();
			
			$("#directionsSelect").selectmenu("enable");
			$("#buildingSelect option:selected").removeAttr("selected");
			$("#buildingSelect option:first").attr("selected", "selected");
			$("#buildingSelect").selectmenu("refresh");
			
			if(directionsDisplay.getMap() !== undefined) {
				getDirectionsToBuildingOrMensa();
			}
		});
		
		//Directions
		$("#directionsSelect").change(function() {
			getDirectionsToBuildingOrMensa();
			$("#removeDirectionsButton").removeClass("ui-disabled");
		});
		
		$("#removeDirectionsButton").live("tap", function(){
			directionsDisplay.setMap(null);
			$(this).addClass("ui-disabled");
			$("#directionsSelect option:selected").removeAttr("selected");
			$("#directionsSelect option:first").attr("selected", "selected");
			$("#directionsSelect").selectmenu("refresh");
			
			if(parseInt($("#buildingSelect").val())) {
				showBuilding($("#buildingSelect").val());
			}
			else if(parseInt($("#mensaSelect").val())) {
				showMensa($("#mensaSelect").val());
			}
			render();
		});
	}
	
	/**
	 * Initialisiert die Karte, falls dies noch nicht geschehen ist.
	 * Zeigt einen Marker auf der Karte an, falls markerToShow gesetzt wurde.
	 * Rendert die Karte.
	 */
	function render() {
		
		if(init) {
			initMap();
			init = false;
		}
		
		if(markerToShow !== undefined) {
			var latLng = new google.maps.LatLng(markerToShow.latitude, markerToShow.longitude);
			showMarker(latLng, markerToShow.name);

			if(markerToShow.type === "building") {
				$("#buildingSelect").val(markerToShow.id); 
				$("#buildingSelect").selectmenu("refresh");
			}
			else if(markerToShow.type === "mensa") {
				$("#mensaSelect").val(markerToShow.id);
				$("#mensaSelect").selectmenu("refresh");
			}
			
			markerToShow = undefined;
		}
		
		google.maps.event.trigger(gMap, "resize");
	};

	/**
	 * Initialisiert die Karte.
	 */
	function initMap() {
	    var mapOptions = {
	      zoom: defaultZoom,
	      center: initialLocation,
	      mapTypeId: google.maps.MapTypeId.ROADMAP,
	      disableDefaultUI: true
	    };
	    
	    gMap = new google.maps.Map($("#mapContainer")[0], mapOptions);
	}
	
	/**
	 * Setzt die Position von markerToShow auf die des Gebäudes, das der übergebenen ID entspricht.  
	 * @param id die Gebäude-ID
	 */
	function showBuilding(id) {
		var building = getBuilding(id);
		
		markerToShow = new Object();
		markerToShow.type = "building";
		markerToShow.id = id;
		markerToShow.name = building.name;
		markerToShow.latitude = building.latitude;
		markerToShow.longitude = building.longitude;
	}
	
	/**
	 * Setzt die Position von markerToShow auf die der Mensa, die der übergebenen ID entspricht.  
	 * @param id die Mensa-ID
	 */
	function showMensa(id) {
		var singleMensa = mensa.getMensa(id);

		markerToShow = new Object();
		markerToShow.type = "mensa";
		markerToShow.id = id;
		markerToShow.name = singleMensa.name;
		markerToShow.latitude = singleMensa.lat;
		markerToShow.longitude = singleMensa.long;	
	}
	
	/**
	 * Zeigt einen Marker auf der Karte an. 
	 * @param latLng ein Objekt des Typs google.maps.LatLng.
	 * @param title der Titel des Markers.
	 */
	function showMarker(latLng, title) {
		gMap.setZoom(defaultZoom);
		gMap.panTo(latLng);		
		
		if(marker !== null)
			marker.setMap(null);
		
		marker = new google.maps.Marker({
		    position: latLng, 
		    map: gMap,
		    title: title,
		    bounds: true
		});
	}
	
	/**
	 * Überprüft, ob ein Gebäude oder eine Mensa ausgewählt ist und zeigt den Weg dorthin an.
	 */
	function getDirectionsToBuildingOrMensa() {

		var latLng = null;
		if(parseInt($("#buildingSelect").val())) {
			var building = getBuilding($("#buildingSelect").val());
			latLng = new google.maps.LatLng(building.latitude, building.longitude);
		}
		else if(parseInt($("#mensaSelect").val())) {
			var singleMensa = mensa.getMensa($("#mensaSelect").val());
			latLng = new google.maps.LatLng(singleMensa.lat, singleMensa.long);
		}
		
		if(latLng != null) {
		
			var travelMode;
			if($("#directionsSelect").val() === "car")
				travelMode = google.maps.DirectionsTravelMode.DRIVING;
			else
				travelMode = google.maps.DirectionsTravelMode.WALKING;
			
			getDirectionsToLatLng(latLng, travelMode);
		}
	}
	
	/**
	 * Zeigt den Weg mit Hilfe eines angegebenen Fortbewegungsmittels von der aktuellen Position des Benutzers zu einem übergebenen Punkt.
	 * @param latLng ein Objekt des Typs google.maps.LatLng.
	 * @param travelMode ein Objekt des Typs google.maps.DirectionsTravelMode.
	 */
	function getDirectionsToLatLng(latLng, travelMode) {
		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				var origin = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				
				var request = {
				        origin: origin, 
				        destination: latLng,
				        travelMode: travelMode
				    };
					
			    directionsService.route(request, function(response, status) {
			    	if (status == google.maps.DirectionsStatus.OK) {
			    		directionsDisplay.setMap(gMap);
			    		directionsDisplay.setDirections(response);
			    	}
			    });
			}, function(error) {
				alert(error);
			});
		}
	}
	
}
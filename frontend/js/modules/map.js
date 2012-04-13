function map() {
	
	var buildings = null;
	var gMap = null;
	var initialLocation = new google.maps.LatLng(50.928256, 6.929184); //Hauptgebäude
	
	var directionsService = new google.maps.DirectionsService();
	var directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers : true});
	
	var marker = null;
//	var infoWindow = new google.maps.InfoWindow();
	
	var zoom = 17;
	
	
	//KONSTRUKTOR
	
	if (typeof(_map_prototype_called) == "undefined")
	{
		_map_prototype_called = true;
		map.prototype.render = render;
		map.prototype.initMapView = initMapView;
		map.prototype.showBuilding2 = showBuilding2;
		
		initBuildings();
	}
	
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
	
	function initMapView() { //TODO
		
		initBuildingSelect();
	}
	
	var init = true;
	
	function render() { //TODO
		
		if(init) {
			initMap();
			showBuilding($("#buildingSelect").val());
			init = false;
		}
		
		if(b !== undefined) {
			console.log("render b");
			showBuilding(b);
			$("#buildingSelect").val(b);
			$("#buildingSelect").selectmenu("refresh");
		}
		
		google.maps.event.trigger(gMap, "resize");
	};
	
	function initBuildingSelect() {
		for (var int = 0; int < buildings.length; int++) {
			var building = buildings[int];
			$("#buildingSelect").append("<option value='"+building.name+"'>"+building.name+"</option>");
		}
		$("#buildingSelect").change(function(){
			showBuilding($(this).val());
		});
		
		$("#travelModeSelect").change(function() {
			getRouteToBuilding($("#buildingSelect").val(), $("#travelModeSelect").val());
		});
		
		$("#directionsButton").live("tap", function(){
			var textElement = $(this).find(".ui-btn-text");
			if(textElement.text() === "Weg zeigen") {
				getRouteToBuilding($("#buildingSelect").val(), $("#travelModeSelect").val());
				$(textElement).text("verbergen");
			}
			else {
				$(textElement).text("Weg zeigen");
				directionsDisplay.setMap(null);
				showBuilding($("#buildingSelect").val());
			}
		});
	}

	function initMap() {
	    var mapOptions = {
	      zoom: zoom,
	      center: initialLocation,
	      mapTypeId: google.maps.MapTypeId.ROADMAP,
	      disableDefaultUI: true
//	      zoomControl: true
	    };
	    
	    gMap = new google.maps.Map($("#mapContainer")[0], mapOptions);
	}
	
	/**
	 * Helper function
	 * @param buildingName
	 */
	function getBuilding(buildingName) {
		for (var int = 0; int < buildings.length; int++) {
			if(buildings[int].name === buildingName)
				return buildings[int];
		}
	}

	var b;
	
	function showBuilding2(buildingName) { //TODO
//		console.log("show b");
//		initialLocation = new google.maps.LatLng(58.928256, 6.929184);
////		$("#buildingSelect").children("option:selected").removeAttr("selected");
//		$("#buildingSelect").val(buildingName);
//		$("#buildingSelect").selectmenu("refresh");
		
		b = buildingName;
	}
	
	function showBuilding(buildingName) {
		
		var building = getBuilding(buildingName);

		var latLng = new google.maps.LatLng(building.latitude, building.longitude);
		
		gMap.setZoom(zoom);
		gMap.panTo(latLng);			
		
		if(marker !== null)
			marker.setMap(null);
		
		marker = new google.maps.Marker({
		    position: latLng, 
		    map: gMap,
		    title: building.name,
		    bounds: true
		});
		
//		infoWindow.setContent(building.name);
//		infoWindow.close();
//		infoWindow.open(map, marker);
	}

	function getRouteToBuilding(buildingName, travelMode) {

		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				var from = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				var building = getBuilding(buildingName);
				var to = new google.maps.LatLng(building.latitude, building.longitude);
				
				var mode;
				if(travelMode === "foot")
					mode = google.maps.DirectionsTravelMode.WALKING;
				else
					mode = google.maps.DirectionsTravelMode.DRIVING;
				
				showRoute(from, to, mode);
			}, function(error) {
				//TODO handle errors
				alert(error);
			});
		}
		
	}
	
	function showRoute(from, to, mode) {
		
		var request = {
	        origin: from, 
	        destination: to,
	        travelMode: mode
	    };
		
	    directionsService.route(request, function(response, status) {
	    	if (status == google.maps.DirectionsStatus.OK) {
	    		directionsDisplay.setMap(gMap);
	    		directionsDisplay.setDirections(response);
	    	}
	    });
	}
	
}
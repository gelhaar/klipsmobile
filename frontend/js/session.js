function session() {

	if (typeof(_login_prototype_called) == "undefined") {
		_session_prototype_called = true;
		session.prototype.initUsername = initUsername;
		session.prototype.ping = ping;
		
		initUsername();
	}
	
	function initUsername() {
		$.ajax({		
			async: false,
			type: "POST",
			url: "../backend/ajax.php",
			data: "request=User&type=getName",
			dataType: "json",
			success: function(data) {
				$(".userName").html(data.username);
			}
		});
	
		
	}

	 function ping() {
		$.ajax({
			type: "POST",
			url: "../backend/auth/ping.php",
			data: "",
			success: function(data) {}
		});
 	}
	
}
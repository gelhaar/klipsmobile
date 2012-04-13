function login() {

	if (typeof(_login_prototype_called) == "undefined")
	{
		_login_prototype_called = true;
		login.prototype.initLogoutBar = initLogoutBar;
	}
	
	initLogoutBar();
	
	function initLogoutBar() {
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

}